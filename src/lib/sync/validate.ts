/** Server entry-point for the shared, dependency-free sync validators. */
export {
  MAX_PULL_LIMIT,
  MAX_PUSH_ENTRIES,
  MAX_SYNC_BODY_BYTES,
  SyncValidationError,
  isSyncedTable,
  validatePullRequest as validatePull,
  validatePushRequest as validatePush,
} from "@eco/core-contracts";
