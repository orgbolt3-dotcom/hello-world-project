/**
 * Server-side execution of the sync protocol.
 *
 * It never elevates privileges: it always runs with a Supabase client bound to
 * the caller's session, so the access rules (RLS) are the real boundary.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isClientMutationAllowed,
  type OutboxEntry,
  type PullRequest,
  type PullResult,
  type PushRequest,
  type PushResult,
  type SyncRecordEnvelope,
  type SyncRejectionCode,
} from "@eco/core-contracts";
import { isReadOnlyTable, ownerColumn, physicalTable, toRecord, toRow } from "./mapping";

export type SyncClient = SupabaseClient;

function envelope(table: OutboxEntry["table"], row: Record<string, unknown>): SyncRecordEnvelope {
  return {
    table,
    revision: Number(row["revision"] ?? 0),
    deleted: row["deleted_at"] != null,
    data: toRecord(row),
  };
}

function classifyDatabaseError(error: { code?: string }): {
  code: SyncRejectionCode;
  retryable: boolean;
} {
  if (error.code === "42501" || error.code === "PGRST301") {
    return { code: "permission_denied", retryable: false };
  }
  if (error.code === "23505" || error.code === "23P01") {
    return { code: "conflict", retryable: false };
  }
  if (error.code?.startsWith("23") || error.code === "P0001") {
    return { code: "invalid_mutation", retryable: false };
  }
  return { code: "server_error", retryable: true };
}

export async function runPull(db: SyncClient, request: PullRequest): Promise<PullResult> {
  const records: SyncRecordEnvelope[] = [];
  const cursors: PullResult["cursors"] = [];
  let hasMore = false;
  let remaining = request.limit;

  for (const cursor of request.cursors) {
    if (remaining === 0) {
      cursors.push({ ...cursor });
      hasMore = true;
      continue;
    }
    const { data: rows, error } = await db
      .from(physicalTable(cursor.table))
      .select("*")
      .gt("revision", cursor.revision)
      .order("revision", { ascending: true })
      .limit(remaining);

    if (error) throw new Error("sync_pull_failed");

    const typedRows = (rows ?? []) as Record<string, unknown>[];
    let nextRevision = cursor.revision;

    for (const row of typedRows) {
      const revision = Number(row["revision"] ?? 0);
      if (!Number.isSafeInteger(revision) || revision <= nextRevision) {
        throw new Error("invalid_server_revision");
      }
      nextRevision = revision;
      records.push({
        table: cursor.table,
        revision,
        deleted: row["deleted_at"] != null,
        data: toRecord(row),
      });
    }

    remaining -= typedRows.length;
    if (remaining === 0) hasMore = true;
    cursors.push({ table: cursor.table, revision: nextRevision });
  }

  return { records, cursors, hasMore };
}

async function replayReceipt(
  db: SyncClient,
  entry: OutboxEntry,
  userId: string,
): Promise<SyncRecordEnvelope | null | undefined> {
  const { data, error } = await db
    .from("sync_mutation_receipts")
    .select("response")
    .eq("mutation_id", entry.id)
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw new Error("sync_receipt_read_failed");
  if (!data) return undefined;
  return (data as { response: SyncRecordEnvelope | null }).response;
}

async function storeReceipt(
  db: SyncClient,
  entry: OutboxEntry,
  userId: string,
  response: SyncRecordEnvelope | null,
): Promise<void> {
  const { error } = await db.from("sync_mutation_receipts").insert({
    mutation_id: entry.id,
    owner_id: userId,
    logical_table: entry.table,
    record_id: entry.recordId,
    response,
  });
  if (error && error.code !== "23505") throw new Error("sync_receipt_write_failed");
}

function sameDatabaseValue(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true;
  if (typeof actual === "number" && typeof expected === "number") {
    return Number.isFinite(actual) && Number.isFinite(expected) && actual === expected;
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
}

async function recoverAppliedMutation(
  db: SyncClient,
  entry: OutboxEntry,
  table: string,
  expectedRow: Record<string, unknown>,
): Promise<SyncRecordEnvelope | null> {
  const { data, error } = await db.from(table).select("*").eq("id", entry.recordId).maybeSingle();
  if (error || !data) return null;
  const current = data as Record<string, unknown>;
  const matches =
    entry.kind === "delete"
      ? current["deleted_at"] != null
      : Object.entries(expectedRow).every(([key, value]) => sameDatabaseValue(current[key], value));
  return matches ? envelope(entry.table, current) : null;
}

export async function runPush(
  db: SyncClient,
  request: PushRequest,
  userId: string,
): Promise<PushResult> {
  const accepted: string[] = [];
  const rejected: PushResult["rejected"] = [];
  const records: SyncRecordEnvelope[] = [];

  for (const entry of request.entries) {
    if (entry.ownerId !== userId) {
      rejected.push({ id: entry.id, code: "owner_mismatch", retryable: false });
      continue;
    }

    if (isReadOnlyTable(entry.table) || !isClientMutationAllowed(entry.table, entry.kind)) {
      rejected.push({ id: entry.id, code: "operation_not_allowed", retryable: false });
      continue;
    }

    try {
      const replay = await replayReceipt(db, entry, userId);
      if (replay !== undefined) {
        accepted.push(entry.id);
        if (replay) records.push(replay);
        continue;
      }

      const table = physicalTable(entry.table);
      const owner = ownerColumn(entry.table);
      const row = toRow(entry.table, entry.patch);

      if (entry.kind === "delete") row["deleted_at"] = Date.now();

      let result: {
        data: unknown;
        error: { code?: string; message?: string } | null;
      };

      if (entry.kind === "create") {
        row["id"] = entry.recordId;
        if (owner) row[owner] = userId;
        result = await db.from(table).insert(row).select("*").maybeSingle();
      } else {
        delete row["id"];
        if (owner) delete row[owner];
        result = await db
          .from(table)
          .update(row)
          .eq("id", entry.recordId)
          .select("*")
          .maybeSingle();
      }

      if (result.error) {
        const recovered = await recoverAppliedMutation(db, entry, table, row);
        if (recovered) {
          await storeReceipt(db, entry, userId, recovered);
          accepted.push(entry.id);
          records.push(recovered);
          continue;
        }
        rejected.push({ id: entry.id, ...classifyDatabaseError(result.error) });
        continue;
      }
      if (!result.data) {
        if (entry.kind === "delete") {
          await storeReceipt(db, entry, userId, null);
          accepted.push(entry.id);
          continue;
        }
        rejected.push({ id: entry.id, code: "record_not_found", retryable: false });
        continue;
      }

      const saved = envelope(entry.table, result.data as Record<string, unknown>);
      await storeReceipt(db, entry, userId, saved);
      accepted.push(entry.id);
      records.push(saved);
    } catch {
      rejected.push({ id: entry.id, code: "server_error", retryable: true });
    }
  }

  return { accepted, rejected, records };
}
