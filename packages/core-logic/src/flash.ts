import type { FlashRecord, FlashStatus } from "@eco/core-contracts";

/** A flash is visible when it is live, not deleted and not past its expiry. */
export function isFlashVisible(flash: FlashRecord, now = Date.now()): boolean {
  if (flash.deletedAt !== null) return false;
  if (flash.status !== "live") return false;
  return flash.expiresAt === null || flash.expiresAt > now;
}

/** Resolves the status a flash should have right now, without mutating it. */
export function resolveFlashStatus(flash: FlashRecord, now = Date.now()): FlashStatus {
  if (flash.status === "live" && flash.expiresAt !== null && flash.expiresAt <= now) {
    return "expired";
  }
  return flash.status;
}

/** Remaining lifetime in milliseconds, or null when the flash never expires. */
export function flashTimeLeft(flash: FlashRecord, now = Date.now()): number | null {
  if (flash.expiresAt === null) return null;
  return Math.max(0, flash.expiresAt - now);
}

/** Newest visible flashes first. */
export function sortFlashes(flashes: FlashRecord[]): FlashRecord[] {
  return [...flashes].sort((a, b) => b.createdAt - a.createdAt);
}
