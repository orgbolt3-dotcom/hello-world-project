/**
 * Trust foundation — placeholder.
 *
 * Defines the SHAPE of a trust signal so UI components can render
 * something today, while real scoring/attestation logic lands later.
 */

export interface TrustSignal {
  subjectId: string;
  /** 0–100 visual score. */
  score: number;
  verified: boolean;
  /** Short, human reason — already localized by the caller. */
  reason?: string;
}

export const TRUST_THRESHOLDS = {
  low: 30,
  medium: 60,
  high: 80,
} as const;

export function trustBand(score: number): "low" | "medium" | "high" {
  if (score >= TRUST_THRESHOLDS.high) return "high";
  if (score >= TRUST_THRESHOLDS.medium) return "medium";
  return "low";
}
