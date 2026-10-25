import type { FlashCategory, FlashKind, FlashTimeSlot } from "./flash";

/** What someone is looking for around them, right now. */
export interface ScanQuery {
  text: string;
  category: FlashCategory | null;
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit: number;
}

/** One public match returned by a scan, already stripped of private data. */
export interface ScanResult {
  id: string;
  kind: FlashKind;
  category: FlashCategory;
  title: string;
  timeSlot: FlashTimeSlot;
  areaLabel: string;
  distanceKm: number;
  createdAt: number;
  expiresAt: number;
}
