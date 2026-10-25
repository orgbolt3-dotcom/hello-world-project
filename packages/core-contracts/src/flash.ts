/**
 * Flash taxonomy shared by the local database, the radar domain and the
 * public feed exposed by the backend.
 */

export const FLASH_CATEGORIES = [
  "personal",
  "professional",
  "commercial",
  "home",
  "transport",
  "food",
  "education",
  "health",
  "events",
  "other",
] as const;

export type FlashCategory = (typeof FLASH_CATEGORIES)[number];

export const FLASH_KINDS = ["offer", "need"] as const;
export type FlashKind = (typeof FLASH_KINDS)[number];

export const FLASH_TIME_SLOTS = ["now", "today", "tomorrow", "this_week"] as const;
export type FlashTimeSlot = (typeof FLASH_TIME_SLOTS)[number];

/**
 * The public shape of a flash: no author, no coordinates, only what anyone
 * may see. Precise location stays private on the backend.
 */
export interface PublicFlash {
  id: string;
  kind: FlashKind;
  category: FlashCategory;
  title: string;
  timeSlot: FlashTimeSlot;
  areaLabel: string;
  expiresAt: number;
  createdAt: number;
}
