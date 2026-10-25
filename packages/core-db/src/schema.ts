import Dexie, { type Table } from "dexie";
import type {
  AuditEntryRecord,
  FlashRecord,
  MediaRecord,
  MissionRecord,
  NotificationRecord,
  RadarRecord,
  FailedMutation,
  PromotedAssistantAnswer,
  OutboxEntry,
  PostRecord,
  SyncCursor,
  LocalDataScope,
  SyncedTable,
  UdiRecord,
  UserRecord,
} from "@eco/core-contracts";

/**
 * The local database is the ONLY source of truth the UI ever reads.
 * Nothing in this file talks to the network: the sync worker is the sole
 * bridge between this database and the Cloud.
 */
export class EcosystemDatabase extends Dexie {
  users!: Table<UserRecord, string>;
  udi!: Table<UdiRecord, string>;
  flashes!: Table<FlashRecord, string>;
  missions!: Table<MissionRecord, string>;
  radars!: Table<RadarRecord, string>;
  posts!: Table<PostRecord, string>;
  media!: Table<MediaRecord, string>;
  notifications!: Table<NotificationRecord, string>;
  audit!: Table<AuditEntryRecord, string>;

  /** Pending local writes waiting to reach the Cloud. */
  outbox!: Table<OutboxEntry, string>;
  /** Permanent refusals, retained for support instead of retried forever. */
  failedMutations!: Table<FailedMutation, string>;
  /** Server-approved answers copied locally for instant offline reuse. */
  assistantKnowledge!: Table<PromotedAssistantAnswer, string>;
  /** Per-table pull/push cursors. */
  cursors!: Table<SyncCursor, SyncedTable>;

  constructor(name: string) {
    super(name);

    this.version(1).stores({
      users: "id, handle, status, updatedAt, deletedAt",
      udi: "id, userId, level, updatedAt, deletedAt",
      flashes: "id, authorId, status, expiresAt, updatedAt, deletedAt",
      missions: "id, authorId, assigneeId, status, dueAt, updatedAt, deletedAt",
      posts: "id, authorId, visibility, updatedAt, deletedAt",
      media: "id, kind, state, updatedAt, deletedAt",
      notifications: "id, recipientId, channel, readAt, updatedAt, deletedAt",
      audit: "id, actorId, targetTable, targetId, updatedAt, deletedAt",
      outbox: "id, ownerId, [ownerId+mutatedAt], table, recordId, mutatedAt, attempts",
      cursors: "table",
    });

    this.version(2).stores({
      failedMutations: "id, ownerId, [ownerId+failedAt], table, recordId, failureCode",
    });

    this.version(3).stores({
      assistantKnowledge: "id, [locale+normalizedQuestion], locale, category, updatedAt",
    });

    this.version(4).stores({
      radars: "id, ownerId, status, nextReviewAt, expiresAt, updatedAt, deletedAt",
    });
  }
}

let instance: EcosystemDatabase | null = null;
let activeScope: LocalDataScope | null = null;

function assertScope(scope: LocalDataScope): void {
  if (!scope.ownerId || scope.ownerId.length > 160) {
    throw new Error("Invalid local data owner.");
  }
  if (!/^vitala:[a-z0-9._:-]{1,220}$/i.test(scope.databaseName)) {
    throw new Error("Invalid local database name.");
  }
}

/**
 * Selects the only local database the current runtime may access.
 * Calling this with another owner closes every reference to the previous one.
 */
export function configureLocalDatabase(scope: LocalDataScope): void {
  assertScope(scope);
  if (activeScope?.ownerId === scope.ownerId && activeScope.databaseName === scope.databaseName) {
    return;
  }

  instance?.close();
  instance = null;
  activeScope = { ...scope };
}

/** Closes the active database and removes its identity from memory. */
export function closeLocalDatabase(): void {
  instance?.close();
  instance = null;
  activeScope = null;
}

export function getLocalDataScope(): LocalDataScope | null {
  return activeScope ? { ...activeScope } : null;
}

export function requireLocalDataOwnerId(): string {
  if (!activeScope) throw new Error("Local database scope is not configured.");
  return activeScope.ownerId;
}

/** Lazily creates the singleton database. Never call this during SSR. */
export function getDb(): EcosystemDatabase {
  if (typeof indexedDB === "undefined") {
    throw new Error("The local database is only available in the browser.");
  }
  if (!activeScope) {
    throw new Error("Local database scope is not configured.");
  }
  instance ??= new EcosystemDatabase(activeScope.databaseName);
  return instance;
}

/** True when the local database can be used (browser with IndexedDB). */
export function isLocalDatabaseAvailable(): boolean {
  return typeof indexedDB !== "undefined" && activeScope !== null;
}
