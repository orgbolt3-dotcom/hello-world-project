import type { Table } from "dexie";
import type { BaseRecord, SyncedTable } from "@eco/core-contracts";
import { CLIENT_WRITE_POLICY, newId, protectedClientFields } from "@eco/core-contracts";
import { changedFields, stampCreate, stampDelete, stampUpdate } from "@eco/core-logic";
import { enqueueMutation } from "./outbox";
import { getDb, type EcosystemDatabase } from "./schema";

/**
 * A repository is the only way the application writes data.
 *
 * It keeps the local table and outbox consistent inside one transaction.
 * Client write policies are checked before an optimistic local mutation.
 */
export interface Repository<T extends BaseRecord> {
  readonly table: SyncedTable;

  get(id: string): Promise<T | undefined>;

  list(): Promise<T[]>;

  create(data: Omit<T, keyof BaseRecord> & Partial<Pick<T, "id">>): Promise<T>;

  update(id: string, patch: Partial<Omit<T, keyof BaseRecord>>): Promise<T>;

  remove(id: string): Promise<void>;
}

type TableKey = keyof EcosystemDatabase;

export function createRepository<T extends BaseRecord>(name: SyncedTable): Repository<T> {
  const dexieTable = (): Table<T, string> =>
    getDb()[name as TableKey] as unknown as Table<T, string>;

  const alive = (record: T | undefined): T | undefined =>
    record && record.deletedAt === null ? record : undefined;

  return {
    table: name,

    async get(id) {
      return alive(await dexieTable().get(id));
    },

    async list() {
      const rows = await dexieTable().toArray();

      return rows.filter((row) => row.deletedAt === null).sort((a, b) => b.updatedAt - a.updatedAt);
    },

    async create(data) {
      if (!CLIENT_WRITE_POLICY[name].create) {
        throw new Error(`Local creation is not allowed for ${name}.`);
      }

      const db = getDb();

      const id =
        (
          data as {
            id?: string;
          }
        ).id ?? newId<"Record">();

      const record = stampCreate(
        {
          ...(data as object),
        },
        id,
      ) as T;

      await db.transaction("rw", dexieTable(), db.outbox, async () => {
        await dexieTable().put(record);

        await enqueueMutation({
          table: name,
          recordId: id,
          kind: "create",

          patch: record as unknown as Record<string, unknown>,

          mutatedAt: record.updatedAt,
        });
      });

      return record;
    },

    async update(id, patch) {
      const protectedFields = protectedClientFields(
        name,

        patch as Record<string, unknown>,
      );

      if (protectedFields.length > 0) {
        throw new Error(
          `Protected field update rejected for ${name}: ${protectedFields.join(", ")}.`,
        );
      }

      const db = getDb();

      const current = await dexieTable().get(id);

      if (!current) {
        throw new Error(`No local record ${name}/${id}.`);
      }

      const next = stampUpdate({
        ...current,
        ...patch,
      } as T);

      const fields = changedFields(current, next).filter((key) => key !== "updatedAt");

      if (fields.length === 0) {
        return current;
      }

      const delta: Record<string, unknown> = {};

      for (const field of fields) {
        delta[field] = (next as unknown as Record<string, unknown>)[field];
      }

      await db.transaction("rw", dexieTable(), db.outbox, async () => {
        await dexieTable().put(next);

        await enqueueMutation({
          table: name,
          recordId: id,
          kind: "update",
          patch: delta,
          mutatedAt: next.updatedAt,
        });
      });

      return next;
    },

    async remove(id) {
      if (!CLIENT_WRITE_POLICY[name].delete) {
        throw new Error(`Local deletion is not allowed for ${name}.`);
      }

      const db = getDb();

      const current = await dexieTable().get(id);

      if (!current) return;

      const next = stampDelete(current);

      await db.transaction("rw", dexieTable(), db.outbox, async () => {
        await dexieTable().put(next);

        await enqueueMutation({
          table: name,
          recordId: id,
          kind: "delete",
          patch: {
            deletedAt: next.deletedAt,
          },
          mutatedAt: next.updatedAt,
        });
      });
    },
  };
}
