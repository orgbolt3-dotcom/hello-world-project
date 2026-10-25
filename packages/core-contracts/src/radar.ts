import type { FlashCategory } from "./flash";
import type { BaseRecord } from "./records";

export const RADAR_STATUSES = [
  "draft",
  "active",
  "watching",
  "matched",
  "paused",
  "expired",
  "cancelled",
] as const;

export type RadarStatus = (typeof RADAR_STATUSES)[number];

export const RADAR_ACTIONS = [
  "activate",
  "begin_watch",
  "mark_matched",
  "pause",
  "resume",
  "revalidate",
  "expire",
  "cancel",
] as const;

export type RadarAction = (typeof RADAR_ACTIONS)[number];

export const RADAR_RADII_KM = [1, 3, 5, 10, 25, 50] as const;
export type RadarRadiusKm = (typeof RADAR_RADII_KM)[number];

export const RADAR_MIN_DURATION_DAYS = 3;
export const RADAR_MAX_DURATION_DAYS = 90;
export const RADAR_REVIEW_INTERVAL_DAYS = 7;

export interface RadarDraftInput {
  title: string;
  query: string;
  category: FlashCategory | null;
  areaLabel: string;
  radiusKm: RadarRadiusKm;
  startsAt: number;
  expiresAt: number;
}

export interface RadarRecord extends BaseRecord, RadarDraftInput {
  id: string;
  ownerId: string;
  status: RadarStatus;
  nextReviewAt: number | null;
  lastReviewedAt: number | null;
}

export interface RadarTransitionPatch {
  status: RadarStatus;
  nextReviewAt: number | null;
  lastReviewedAt: number | null;
}
