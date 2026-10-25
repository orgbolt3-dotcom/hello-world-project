import { describe, expect, it } from "vitest";
import { createSyncEngine } from "@eco/core-sync";
import type {
  OutboxEntry,
  PullResult,
  PushResult,
  SyncCursor,
  SyncRecordEnvelope,
  SyncedTable,
} from "@eco/core-contracts";

const uuid = (n: number) => `00000000-0000-4000-8000-${n.toString().padStart(12, "0")}`;

function entry(table: SyncedTable = "flashes"): OutboxEntry {
  return {
    id: uuid(1),
    ownerId: uuid(2),
    table,
    recordId: uuid(3),
    kind: "update",
    patch: { title: "updated" },
    mutatedAt: 1,
    attempts: 0,
    lastAttemptAt: null,
    lastError: null,
  };
}

function cursor(table: SyncedTable, revision = 0): SyncCursor {
  return { table, revision, lastPulledAt: null, lastPushedAt: null };
}

function record(table: SyncedTable, revision: number): SyncRecordEnvelope {
  return {
    table,
    revision,
    deleted: false,
    data: { id: uuid(3), title: "updated" },
  };
}

function storeWith(pending: OutboxEntry[]) {
  const state = {
    pending: [...pending],
    applied: [] as SyncRecordEnvelope[],
    cursors: [] as SyncCursor[],
  };
  return {
    state,
    readCursors: async () => state.cursors,
    writeCursor: async () => undefined,
    applyRemoteRecords: async (records: readonly SyncRecordEnvelope[]) => {
      state.applied.push(...records);
      return [...new Set(records.map((r) => r.table))];
    },
    applyPullPage: async (
      records: readonly SyncRecordEnvelope[],
      cursors: readonly Pick<SyncCursor, "table" | "revision">[],
    ) => {
      state.applied.push(...records);
      state.cursors = cursors.map((c) => cursor(c.table, c.revision));
      return [...new Set(records.map((r) => r.table))];
    },
    readPending: async (limit = 50) => state.pending.slice(0, limit),
    dropAccepted: async (ids: readonly string[]) => {
      state.pending = state.pending.filter((item) => !ids.includes(item.id));
    },
    markAttemptFailed: async () => undefined,
    quarantineRejected: async () => undefined,
    quarantineExhausted: async () => undefined,
    countPending: async () => state.pending.length,
  };
}

function pullResult(): PullResult {
  return {
    records: [],
    cursors: [
      cursor("users"),
      cursor("udi"),
      cursor("flashes"),
      cursor("missions"),
      cursor("radars"),
      cursor("posts"),
      cursor("media"),
      cursor("notifications"),
      cursor("audit"),
    ],
    hasMore: false,
  };
}

describe("sync engine", () => {
  it("pushes before pulling and removes accepted outbox entries", async () => {
    const store = storeWith([entry()]);
    const calls: string[] = [];
    const transport = {
      push: async (): Promise<PushResult> => {
        calls.push("push");
        return { accepted: [uuid(1)], rejected: [], records: [record("flashes", 1)] };
      },
      pull: async (): Promise<PullResult> => {
        calls.push("pull");
        return pullResult();
      },
    };

    const engine = createSyncEngine({ store, transport, onState: () => undefined });
    await engine.syncNow();

    expect(calls).toEqual(["push", "pull"]);
    expect(store.state.pending).toHaveLength(0);
    expect(store.state.applied.some((item) => item.revision === 1)).toBe(true);
    expect(engine.getState().phase).toBe("idle");
  });

  it("does not hit the transport while offline", async () => {
    const store = storeWith([entry()]);
    const transport = {
      push: async () => {
        throw new Error("must not push");
      },
      pull: async () => {
        throw new Error("must not pull");
      },
    };

    const engine = createSyncEngine({
      store,
      transport,
      onState: () => undefined,
      isOnline: () => false,
    });

    await engine.syncNow();

    expect(engine.getState().phase).toBe("offline");
    expect(store.state.pending).toHaveLength(1);
  });

  it("stops pulling after the protocol safety limit", async () => {
    const store = storeWith([]);
    let pulls = 0;
    const transport = {
      push: async (): Promise<PushResult> => ({ accepted: [], rejected: [], records: [] }),
      pull: async (): Promise<PullResult> => {
        pulls += 1;
        return { ...pullResult(), hasMore: true };
      },
    };

    const engine = createSyncEngine({ store, transport, onState: () => undefined });
    await engine.syncNow();

    expect(pulls).toBe(20);
    expect(engine.getState().phase).toBe("error");
  });
});
