import type { UdiLevel, UdiRecord } from "@eco/core-contracts";

/**
 * Trust score display model.
 *
 * This function is a non-authoritative display projection only. A trusted
 * backend process must persist the real score from verified server-side
 * signals. Callers must never write this result directly to a profile.
 */
export interface TrustSignals {
  identityLevel: UdiLevel;
  completedMissions: number;
  positiveReviews: number;
  negativeReviews: number;
  accountAgeDays: number;
}

const LEVEL_WEIGHT: Record<UdiLevel, number> = {
  guest: 0,
  identified: 15,
  verified: 30,
  trusted: 45,
};

export function computeTrustScore(signals: TrustSignals): number {
  const identity = LEVEL_WEIGHT[signals.identityLevel];

  const delivery = Math.min(25, signals.completedMissions * 2.5);

  const reputation = Math.max(
    -15,
    Math.min(
      20,

      signals.positiveReviews * 2 - signals.negativeReviews * 5,
    ),
  );

  const seniority = Math.min(10, signals.accountAgeDays / 36.5);

  return clamp(Math.round(identity + delivery + reputation + seniority), 0, 100);
}

export type TrustTier = "new" | "growing" | "solid" | "reference";

/**
 * Human-facing tier. The UI may display it but must not persist it directly.
 */
export function trustTier(score: number): TrustTier {
  if (score >= 80) {
    return "reference";
  }

  if (score >= 55) {
    return "solid";
  }

  if (score >= 25) {
    return "growing";
  }

  return "new";
}

/** Next identity step that may be requested, not self-attributed. */
export function nextIdentityStep(udi: UdiRecord | undefined): UdiLevel | null {
  const order: UdiLevel[] = ["guest", "identified", "verified", "trusted"];

  const current = udi?.level ?? "guest";

  const index = order.indexOf(current);

  return index < order.length - 1 ? order[index + 1]! : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
