import type { Table } from "dexie";
import type { BaseRecord, SyncCursor, SyncRecordEnvelope, SyncedTable } from "@eco/core-contracts";
import { mergeRecords } from "@eco/core-logic";
import { locallyChangedFields } from "./outbox";
import { getDb, type EcosystemDatabase } from "./schema";

/**
 * Applies records coming from the Cloud into the local database, preserving
 * offline edits that have not been pushed yet (field-level merge).
 * Only the sync worker calls this.
 */
export async function applyRemoteRecords(
  envelopes: readonly SyncRecordEnvelope[],
): Promise<SyncedTable[]> {
  const db = getDb();
  const touched = new Set<SyncedTable>();

  for (const envelope of envelopes) {
    const table = db[envelope.table as keyof EcosystemDatabase] as unknown as Table<
      BaseRecord,
      string
    >;
    const incoming = envelope.data as unknown as BaseRecord;
    const remote: BaseRecord = {
      ...incoming,
      revision: envelope.revision,
      deletedAt: envelope.deleted ? (incoming.deletedAt ?? Date.now()) : null,
    };

    const local = await table.get(remote.id);
    const fields = await locallyChangedFields(envelope.table, remote.id);
    await table.put(mergeRecords(local, remote, fields));
    touched.add(envelope.table);
  }

  return [...touched];
}

/**
 * Commits a pull page and its cursors in one IndexedDB transaction. A crash can
 * therefore never advance a cursor without persisting the corresponding rows.
 */
export async function applyPullPage(
  envelopes: readonly SyncRecordEnvelope[],
  cursors: readonly Pick<SyncCursor, "table" | "revision">[],
): Promise<SyncedTable[]> {
  const db = getDb();
  const touched = new Set<SyncedTable>();
  const tables = [
    db.users,
    db.udi,
    db.flashes,
    db.missions,
    db.radars,
    db.posts,
    db.media,
    db.notifications,
    db.audit,
    db.outbox,
    db.cursors,
  ];

  await db.transaction("rw", tables, async () => {
    for (const envelope of envelopes) {
      const table = db[envelope.table as keyof EcosystemDatabase] as unknown as Table<
        BaseRecord,
        string
      >;
      const incoming = envelope.data as unknown as BaseRecord;
      const remote: BaseRecord = {
        ...incoming,
        revision: envelope.revision,
        deletedAt: envelope.deleted ? (incoming.deletedAt ?? Date.now()) : null,
      };
      const local = await table.get(remote.id);
      const fields = await locallyChangedFields(envelope.table, remote.id);
      await table.put(mergeRecords(local, remote, fields));
      touched.add(envelope.table);
    }

    const pulledAt = Date.now();
    for (const cursor of cursors) {
      const current = (await db.cursors.get(cursor.table)) ?? {
        table: cursor.table,
        revision: 0,
        lastPulledAt: null,
        lastPushedAt: null,
      };
      if (cursor.revision < current.revision) {
        throw new Error(`Non-monotonic cursor for ${cursor.table}.`);
      }
      await db.cursors.put({ ...current, revision: cursor.revision, lastPulledAt: pulledAt });
    }
  });

  return [...touched];
}

export async function readCursors(): Promise<SyncCursor[]> {
  return getDb().cursors.toArray();
}

export async function writeCursor(
  table: SyncedTable,
  patch: Partial<Omit<SyncCursor, "table">>,
): Promise<void> {
  const db = getDb();
  const current = (await db.cursors.get(table)) ?? {
    table,
    revision: 0,
    lastPulledAt: null,
    lastPushedAt: null,
  };
  await db.cursors.put({ ...current, ...patch });
}
