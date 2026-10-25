import {
  SYNCED_TABLES,
  SYNC_PROTOCOL_VERSION,
  type OutboxEntry,
  type SyncCursor,
  type SyncRecordEnvelope,
  type SyncState,
  type SyncedTable,
} from "@eco/core-contracts";
import { SyncAuthError, SyncNetworkError, type SyncTransport } from "./transport";

/** Everything the engine needs from the local database. */
export interface SyncStore {
  readCursors(): Promise<SyncCursor[]>;
  writeCursor(table: SyncedTable, patch: Partial<Omit<SyncCursor, "table">>): Promise<void>;
  applyRemoteRecords(records: readonly SyncRecordEnvelope[]): Promise<SyncedTable[]>;
  applyPullPage(
    records: readonly SyncRecordEnvelope[],
    cursors: readonly Pick<SyncCursor, "table" | "revision">[],
  ): Promise<SyncedTable[]>;
  readPending(limit?: number): Promise<OutboxEntry[]>;
  dropAccepted(ids: readonly string[]): Promise<void>;
  markAttemptFailed(id: string, reason: string): Promise<void>;
  quarantineRejected(
    rejections: readonly import("@eco/core-contracts").RejectedMutation[],
  ): Promise<void>;
  quarantineExhausted(maxAttempts: number): Promise<void>;
  countPending(): Promise<number>;
}

export interface SyncEngineOptions {
  transport: SyncTransport;
  store: SyncStore;
  /** Reports the state after every meaningful change. */
  onState: (state: SyncState) => void;
  /** Tables whose local rows just changed because of remote data. */
  onApplied?: (tables: SyncedTable[]) => void;
  /** Milliseconds between two idle passes. */
  intervalMs?: number;
  /** How many outbox entries travel in one push. */
  pushBatchSize?: number;
  /** How many records one pull page may contain. */
  pullPageSize?: number;
  /** Attempts after which an entry is considered permanently stuck. */
  maxAttempts?: number;
  isOnline?: () => boolean;
}

const DEFAULTS = {
  intervalMs: 15_000,
  pushBatchSize: 50,
  pullPageSize: 100,
  maxAttempts: 8,
  maxBackoffMs: 5 * 60_000,
};

export interface SyncEngine {
  start(): void;
  stop(): void;
  syncNow(): Promise<void>;
  getState(): SyncState;
}

export function createSyncEngine(options: SyncEngineOptions): SyncEngine {
  const {
    transport,
    store,
    onState,
    onApplied,
    intervalMs = DEFAULTS.intervalMs,
    pushBatchSize = DEFAULTS.pushBatchSize,
    pullPageSize = DEFAULTS.pullPageSize,
    maxAttempts = DEFAULTS.maxAttempts,
    isOnline = () => (typeof navigator === "undefined" ? true : navigator.onLine),
  } = options;

  let state: SyncState = {
    phase: "idle",
    pendingCount: 0,
    lastSyncedAt: null,
    messageKey: null,
  };
  let running = false;
  let inFlight: Promise<void> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let consecutiveFailures = 0;

  function emit(patch: Partial<SyncState>): void {
    state = { ...state, ...patch };
    onState(state);
  }

  function schedule(delayMs: number): void {
    if (!running) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void run();
    }, delayMs);
  }

  function nextDelay(): number {
    if (consecutiveFailures === 0) return intervalMs;
    const backoff = intervalMs * 2 ** Math.min(consecutiveFailures, 6);
    return Math.min(backoff, DEFAULTS.maxBackoffMs);
  }

  /** Sends pending local writes. Returns the records the backend confirmed. */
  async function push(): Promise<SyncRecordEnvelope[]> {
    await store.quarantineExhausted(maxAttempts);
    const pending = await store.readPending(pushBatchSize);
    if (pending.length === 0) return [];

    emit({ phase: "pushing", messageKey: "sync.sending" });
    const result = await transport.push({
      protocolVersion: SYNC_PROTOCOL_VERSION,
      entries: pending,
    });

    await store.dropAccepted(result.accepted);
    for (const rejection of result.rejected) {
      if (rejection.retryable) {
        await store.markAttemptFailed(rejection.id, rejection.code);
      }
    }
    await store.quarantineRejected(result.rejected);
    return result.records;
  }

  /** Fetches and atomically commits everything newer than the local cursors. */
  async function pull(): Promise<SyncedTable[]> {
    emit({ phase: "pulling", messageKey: "sync.updating" });

    const stored = await store.readCursors();
    const byTable = new Map(stored.map((cursor) => [cursor.table, cursor.revision]));
    let cursors = SYNCED_TABLES.map((table) => ({
      table,
      revision: byTable.get(table) ?? 0,
    }));

    const touched = new Set<SyncedTable>();
    let pages = 0;
    let hasMore = true;

    while (hasMore && pages < 20) {
      const result = await transport.pull({
        protocolVersion: SYNC_PROTOCOL_VERSION,
        cursors,
        limit: pullPageSize,
      });
      const applied = await store.applyPullPage(result.records, result.cursors);
      for (const table of applied) touched.add(table);
      cursors = result.cursors;
      hasMore = result.hasMore;
      pages += 1;
    }
    if (hasMore) throw new Error("Pull page safety limit reached.");
    return [...touched];
  }

  async function pass(): Promise<void> {
    if (!isOnline()) {
      emit({
        phase: "offline",
        messageKey: "sync.offlineSaved",
        pendingCount: await store.countPending(),
      });
      return;
    }

    try {
      // Push first: the local intent must exist upstream before we merge.
      const pushed = await push();
      const pushedTables = pushed.length > 0 ? await store.applyRemoteRecords(pushed) : [];
      const pulledTables = await pull();
      const tables = [...new Set([...pushedTables, ...pulledTables])];
      if (tables.length > 0) onApplied?.(tables);

      consecutiveFailures = 0;
      emit({
        phase: "idle",
        messageKey: "sync.saved",
        lastSyncedAt: Date.now(),
        pendingCount: await store.countPending(),
      });
    } catch (error) {
      consecutiveFailures += 1;
      const pendingCount = await store.countPending().catch(() => state.pendingCount);

      if (error instanceof SyncAuthError) {
        emit({ phase: "error", messageKey: "sync.signInNeeded", pendingCount });
        return;
      }
      if (error instanceof SyncNetworkError || !isOnline()) {
        emit({ phase: "offline", messageKey: "sync.offlineSaved", pendingCount });
        return;
      }
      emit({ phase: "error", messageKey: "sync.retrying", pendingCount });
    }
  }

  async function run(): Promise<void> {
    if (inFlight) return inFlight;
    inFlight = pass().finally(() => {
      inFlight = null;
      schedule(nextDelay());
    });
    return inFlight;
  }

  return {
    start() {
      if (running) return;
      running = true;
      consecutiveFailures = 0;
      void run();
    },
    stop() {
      running = false;
      if (timer) clearTimeout(timer);
      timer = null;
    },
    syncNow() {
      consecutiveFailures = 0;
      return run();
    },
    getState: () => state,
  };
}
