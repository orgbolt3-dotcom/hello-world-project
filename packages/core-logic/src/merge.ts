import type { BaseRecord } from "@eco/core-contracts";

/**
 * Field-level conflict resolution.
 *
 * Rule: the remote record wins for every field, EXCEPT fields the device
 * modified after the remote revision was produced. This keeps offline edits
 * alive without discarding server-side changes made by other people.
 */
export function mergeRecords<T extends BaseRecord>(
  local: T | undefined,
  remote: T,
  locallyChangedFields: readonly string[],
): T {
  if (!local) return remote;

  const localIsNewer = local.updatedAt > remote.updatedAt;
  if (!localIsNewer || locallyChangedFields.length === 0) {
    return { ...remote, updatedAt: Math.max(local.updatedAt, remote.updatedAt) };
  }

  const merged = { ...remote } as Record<string, unknown>;
  const localRecord = local as unknown as Record<string, unknown>;
  for (const field of locallyChangedFields) {
    if (field in localRecord) merged[field] = localRecord[field];
  }
  merged.updatedAt = local.updatedAt;
  merged.revision = remote.revision;
  return merged as T;
}

/** Returns the keys whose values differ between two versions of a record. */
export function changedFields<T extends object>(before: T, after: T): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];
  for (const key of keys) {
    const a = (before as Record<string, unknown>)[key];
    const b = (after as Record<string, unknown>)[key];
    if (!shallowEqual(a, b)) changed.push(key);
  }
  return changed;
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }
  return false;
}

/** Stamps the envelope fields for a freshly created local record. */
export function stampCreate<T extends object>(
  data: T,
  id: string,
  now = Date.now(),
): T & BaseRecord {
  return { ...data, id, createdAt: now, updatedAt: now, revision: null, deletedAt: null };
}

/** Stamps the envelope fields for a local update. */
export function stampUpdate<T extends BaseRecord>(record: T, now = Date.now()): T {
  return { ...record, updatedAt: now };
}

/** Marks a record as deleted without removing it, so the deletion can sync. */
export function stampDelete<T extends BaseRecord>(record: T, now = Date.now()): T {
  return { ...record, deletedAt: now, updatedAt: now };
}
