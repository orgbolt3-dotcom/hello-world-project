import Dexie from "dexie";
import type { MutationKind, OutboxEntry, RejectedMutation, SyncedTable } from "@eco/core-contracts";
import { newId } from "@eco/core-contracts";
import { getDb, requireLocalDataOwnerId } from "./schema";

/**
 * The outbox is the durable queue of local writes. Every mutation goes through
 * it, so a device can work for days offline and still converge once online.
 */
export async function enqueueMutation(input: {
  table: SyncedTable;
  recordId: string;
  kind: MutationKind;
  patch: Record<string, unknown>;
  mutatedAt?: number;
}): Promise<OutboxEntry> {
  const entry: OutboxEntry = {
    id: newId<"OutboxId">(),
    ownerId: requireLocalDataOwnerId(),
    table: input.table,
    recordId: input.recordId,
    kind: input.kind,
    patch: input.patch,
    mutatedAt: input.mutatedAt ?? Date.now(),
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
  };
  await getDb().outbox.put(entry);
  return entry;
}

/** Oldest pending writes first — order matters for causal consistency. */
export function readPending(limit = 50): Promise<OutboxEntry[]> {
  const ownerId = requireLocalDataOwnerId();
  return getDb()
    .outbox.where("[ownerId+mutatedAt]")
    .between([ownerId, Dexie.minKey], [ownerId, Dexie.maxKey])
    .limit(limit)
    .toArray();
}

export function countPending(): Promise<number> {
  return getDb().outbox.where("ownerId").equals(requireLocalDataOwnerId()).count();
}

export async function dropAccepted(ids: readonly string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getDb();
  const ownerId = requireLocalDataOwnerId();
  const owned = await db.outbox
    .where("id")
    .anyOf([...ids])
    .filter((entry) => entry.ownerId === ownerId)
    .primaryKeys();
  await db.outbox.bulkDelete(owned);
}

/** Records a failed attempt so the worker can back off instead of hammering. */
export async function markAttemptFailed(id: string, reason: string): Promise<void> {
  const db = getDb();
  const entry = await db.outbox.get(id);
  if (!entry || entry.ownerId !== requireLocalDataOwnerId()) return;
  await db.outbox.put({
    ...entry,
    attempts: entry.attempts + 1,
    lastAttemptAt: Date.now(),
    lastError: reason,
  });
}

/** Removes permanent failures from the active queue while keeping a local trace. */
export async function quarantineRejected(rejections: readonly RejectedMutation[]): Promise<void> {
  const permanent = rejections.filter((rejection) => !rejection.retryable);
  if (permanent.length === 0) return;
  const db = getDb();
  const ownerId = requireLocalDataOwnerId();
  await db.transaction("rw", db.outbox, db.failedMutations, async () => {
    for (const rejection of permanent) {
      const entry = await db.outbox.get(rejection.id);
      if (!entry || entry.ownerId !== ownerId) continue;
      await db.failedMutations.put({
        ...entry,
        failedAt: Date.now(),
        failureCode: rejection.code,
        lastError: rejection.code,
      });
      await db.outbox.delete(entry.id);
    }
  });
}

/** Prevents exhausted mutations from blocking every newer write behind them. */
export async function quarantineExhausted(maxAttempts: number): Promise<void> {
  const db = getDb();
  const ownerId = requireLocalDataOwnerId();
  const exhausted = await db.outbox
    .where("ownerId")
    .equals(ownerId)
    .filter((entry) => entry.attempts >= maxAttempts)
    .toArray();
  if (exhausted.length === 0) return;
  await db.transaction("rw", db.outbox, db.failedMutations, async () => {
    for (const entry of exhausted) {
      await db.failedMutations.put({
        ...entry,
        failedAt: Date.now(),
        failureCode: "server_error",
        lastError: entry.lastError ?? "max_attempts_reached",
      });
      await db.outbox.delete(entry.id);
    }
  });
}

/** Fields this device changed for a record — drives field-level merging. */
export async function locallyChangedFields(
  table: SyncedTable,
  recordId: string,
): Promise<string[]> {
  const entries = await getDb()
    .outbox.where("recordId")
    .equals(recordId)
    .filter((entry) => entry.table === table && entry.ownerId === requireLocalDataOwnerId())
    .toArray();
  const fields = new Set<string>();
  for (const entry of entries) {
    for (const key of Object.keys(entry.patch)) fields.add(key);
  }
  return [...fields];
}
