/**
 * Sync protocol contract — shared by the local database, the sync worker and
 * the backend endpoints. Changing anything here is a protocol change.
 */

/** Tables that participate in synchronisation. */
export const SYNCED_TABLES = [
  "users",
  "udi",
  "flashes",
  "missions",
  "radars",
  "posts",
  "media",
  "notifications",
  "audit",
] as const;

export const SYNC_PROTOCOL_VERSION = 2 as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];

export type MutationKind = "create" | "update" | "delete";

/** Identifies the physical local database owned by one authenticated user or guest device. */
export interface LocalDataScope {
  ownerId: string;
  databaseName: string;
}

/** One pending local write waiting to reach the backend. */
export interface OutboxEntry {
  id: string;
  /** Account/device that created this mutation. Never inferred from the current token. */
  ownerId: string;
  table: SyncedTable;
  recordId: string;
  kind: MutationKind;
  /** Only the fields that actually changed — enables field-level merging. */
  patch: Record<string, unknown>;
  /** Client clock at the moment of the write. */
  mutatedAt: number;
  attempts: number;
  lastAttemptAt: number | null;
  lastError: string | null;
}

export type SyncRejectionCode =
  | "invalid_mutation"
  | "owner_mismatch"
  | "operation_not_allowed"
  | "permission_denied"
  | "conflict"
  | "record_not_found"
  | "server_error";

export interface RejectedMutation {
  id: string;
  code: SyncRejectionCode;
  /** Permanent failures are quarantined; retryable failures remain pending. */
  retryable: boolean;
}

/** A permanently rejected write kept locally for support and recovery. */
export interface FailedMutation extends OutboxEntry {
  failedAt: number;
  failureCode: SyncRejectionCode;
}

/** Per-table synchronisation cursor and health. */
export interface SyncCursor {
  table: SyncedTable;
  /** Server revision of the last successfully pulled record. */
  revision: number;
  lastPulledAt: number | null;
  lastPushedAt: number | null;
}

export type SyncPhase = "idle" | "pulling" | "pushing" | "offline" | "error";

export interface SyncState {
  phase: SyncPhase;
  pendingCount: number;
  lastSyncedAt: number | null;
  /** Plain-language message key, never a technical error string. */
  messageKey: string | null;
}

/** Privacy-safe aggregate shown in diagnostics; never contains mutation data. */
export interface OfflineDiagnostics {
  pendingCount: number;
  oldestPendingAgeMs: number | null;
  quarantinedCount: number;
}

/** Push request body sent to the backend. */
export interface PushRequest {
  protocolVersion: typeof SYNC_PROTOCOL_VERSION;
  entries: OutboxEntry[];
}

export interface PushResult {
  /** Outbox entry ids the backend accepted; safe to drop locally. */
  accepted: string[];
  /** Entries rejected for good (validation, permission) — never retried. */
  rejected: RejectedMutation[];
  /** Records the backend returns as authoritative after the merge. */
  records: SyncRecordEnvelope[];
}

/** Pull request body sent to the backend. */
export interface PullRequest {
  protocolVersion: typeof SYNC_PROTOCOL_VERSION;
  cursors: Pick<SyncCursor, "table" | "revision">[];
  limit: number;
}

export interface PullResult {
  records: SyncRecordEnvelope[];
  cursors: Pick<SyncCursor, "table" | "revision">[];
  /** True when more pages remain for the same cursors. */
  hasMore: boolean;
}

/** Anything that survives a round-trip through the sync transport. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface SyncRecordEnvelope {
  table: SyncedTable;
  revision: number;
  deleted: boolean;
  data: Record<string, JsonValue>;
}

/** Messages exchanged with the sync worker. */
export type SyncWorkerCommand =
  | { type: "start"; scope: LocalDataScope; accessToken: string | null }
  | { type: "stop" }
  | { type: "sync-now" }
  | { type: "token"; ownerId: string; accessToken: string | null };

export type SyncWorkerEvent =
  | { type: "state"; state: SyncState }
  | { type: "applied"; tables: SyncedTable[] };
