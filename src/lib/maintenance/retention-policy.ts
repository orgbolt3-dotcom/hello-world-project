export interface RetentionPolicy {
  syncReceiptDays: number;
  aiRequestDays: number;
}

export function retentionCutoff(now: number, days: number): number {
  if (!Number.isFinite(now) || !Number.isFinite(days) || days < 0) {
    throw new Error("Retention cutoff requires finite non-negative values.");
  }

  return now - days * 24 * 60 * 60 * 1000;
}

export function isOlderThanRetention(createdAt: number, cutoff: number): boolean {
  return Number.isFinite(createdAt) && createdAt < cutoff;
}
