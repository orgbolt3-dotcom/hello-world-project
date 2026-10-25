/**
 * Progressive identity foundation.
 *
 * Identity is a spectrum, not a binary. The app starts with a `guest`
 * and gradually upgrades the user as they reveal more (handle, email,
 * verified contact, attested relationships).
 *
 * Real backend wiring lands in a later phase. Today this is a stable
 * placeholder so feature code can already branch on the right tier.
 */
import { create } from "zustand";

export type IdentityTier = "guest" | "identified" | "trusted";

interface IdentityState {
  tier: IdentityTier;
  displayName?: string;
  setTier: (tier: IdentityTier) => void;
  setDisplayName: (name: string | undefined) => void;
}

export const useIdentity = create<IdentityState>((set) => ({
  tier: "guest",
  displayName: undefined,
  setTier: (tier) => set({ tier }),
  setDisplayName: (displayName) => set({ displayName }),
}));

/** Convenience: does this user have at least the given tier? */
export function hasAtLeast(current: IdentityTier, min: IdentityTier): boolean {
  const order: Record<IdentityTier, number> = { guest: 0, identified: 1, trusted: 2 };
  return order[current] >= order[min];
}
