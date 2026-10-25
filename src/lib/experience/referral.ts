/**
 * Referral foundation — placeholder.
 *
 * Stable interface so referral UI can be wired today.
 * Real generation, redemption and reward logic lands later.
 */

export interface ReferralCode {
  code: string;
  /** ISO timestamp; undefined = never expires. */
  expiresAt?: string;
  /** How many times this code has been redeemed. */
  redemptions: number;
}

export function makePlaceholderReferral(): ReferralCode {
  return {
    code: "ECO-SOON",
    redemptions: 0,
  };
}
