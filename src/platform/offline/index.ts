/**
 * Offline-first platform layer.
 *
 * The interface reads and writes the local database only. Nothing here calls
 * the Cloud: synchronisation is the worker's job.
 */

export * from "./live-query";
export * from "./sync-status";
export * from "./local-scope";

export { useSyncEngine, requestSyncNow } from "./sync-controller";

export {
  isLocalDatabaseAvailable,
  usersRepository,
  udiRepository,
  flashesRepository,
  missionsRepository,
  postsRepository,
  mediaRepository,
  notificationsRepository,
  auditRepository,
  countPending,
} from "@eco/core-db";
