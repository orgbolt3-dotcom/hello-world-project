import type { FailedMutation, OfflineDiagnostics, OutboxEntry } from "@eco/core-contracts";

export function getOfflineDiagnostics(
  pending: readonly OutboxEntry[],
  quarantined: readonly FailedMutation[],
  now: number = Date.now(),
): OfflineDiagnostics {
  const oldestPendingAt = pending.reduce<number | null>((oldest, entry) => {
    if (!Number.isFinite(entry.mutatedAt) || entry.mutatedAt > now) {
      return oldest;
    }

    return oldest === null ? entry.mutatedAt : Math.min(oldest, entry.mutatedAt);
  }, null);

  return {
    pendingCount: pending.length,
    oldestPendingAgeMs: oldestPendingAt === null ? null : Math.max(0, now - oldestPendingAt),
    quarantinedCount: quarantined.length,
  };
}

export const OFFLINE_WARNING_AGE_MS = 15 * 60 * 1000;
export const OFFLINE_CRITICAL_AGE_MS = 24 * 60 * 60 * 1000;

export interface OfflineHealthThresholds {
  warningAgeMs: number;
  criticalAgeMs: number;
}

export type OfflineHealthLevel = "healthy" | "warning" | "critical";

export const DEFAULT_OFFLINE_HEALTH_THRESHOLDS: OfflineHealthThresholds = {
  warningAgeMs: OFFLINE_WARNING_AGE_MS,
  criticalAgeMs: OFFLINE_CRITICAL_AGE_MS,
};

export function classifyOfflineHealth(
  pendingCount: number,
  oldestPendingAgeMs: number | null,
  quarantinedCount: number,
  thresholds: OfflineHealthThresholds = DEFAULT_OFFLINE_HEALTH_THRESHOLDS,
): OfflineHealthLevel {
  if (
    !Number.isInteger(pendingCount) ||
    pendingCount < 0 ||
    !Number.isInteger(quarantinedCount) ||
    quarantinedCount < 0 ||
    (oldestPendingAgeMs !== null &&
      (!Number.isFinite(oldestPendingAgeMs) || oldestPendingAgeMs < 0)) ||
    !Number.isFinite(thresholds.warningAgeMs) ||
    !Number.isFinite(thresholds.criticalAgeMs) ||
    thresholds.warningAgeMs < 0 ||
    thresholds.criticalAgeMs < thresholds.warningAgeMs
  ) {
    throw new Error("Invalid offline health diagnostics.");
  }

  if (
    quarantinedCount > 0 ||
    (oldestPendingAgeMs !== null && oldestPendingAgeMs >= thresholds.criticalAgeMs)
  ) {
    return "critical";
  }

  if (
    pendingCount > 0 ||
    (oldestPendingAgeMs !== null && oldestPendingAgeMs >= thresholds.warningAgeMs)
  ) {
    return "warning";
  }

  return "healthy";
}
