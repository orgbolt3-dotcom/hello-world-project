import type { ScanResult } from "@eco/core-contracts";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Relevance of a scan result: close and fresh first, expiring soon last.
 * Pure and deterministic so it can run on the device or on the server.
 */
export function scanRelevance(result: ScanResult, now = Date.now()): number {
  const proximity = 1 / (1 + Math.max(0, result.distanceKm));
  const ageHours = Math.max(0, now - result.createdAt) / HOUR_MS;
  const freshness = 1 / (1 + ageHours);
  const timeLeftHours = Math.max(0, result.expiresAt - now) / HOUR_MS;
  const stillUseful = timeLeftHours <= 0 ? 0 : Math.min(1, timeLeftHours / 24);
  return proximity * 0.5 + freshness * 0.3 + stillUseful * 0.2;
}

/** Most relevant results first; never mutates the input. */
export function rankScanResults(results: ScanResult[], now = Date.now()): ScanResult[] {
  return [...results].sort((a, b) => scanRelevance(b, now) - scanRelevance(a, now));
}
