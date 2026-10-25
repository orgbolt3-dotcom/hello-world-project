import {
  RADAR_MAX_DURATION_DAYS,
  RADAR_MIN_DURATION_DAYS,
  RADAR_REVIEW_INTERVAL_DAYS,
  type RadarAction,
  type RadarDraftInput,
  type RadarRecord,
  type RadarStatus,
  type RadarTransitionPatch,
} from "@eco/core-contracts";

const DAY_MS = 24 * 60 * 60 * 1000;

export function validateRadarSchedule(
  input: Pick<RadarDraftInput, "startsAt" | "expiresAt">,
): boolean {
  if (!Number.isSafeInteger(input.startsAt) || !Number.isSafeInteger(input.expiresAt)) {
    return false;
  }
  const duration = input.expiresAt - input.startsAt;
  return (
    duration >= RADAR_MIN_DURATION_DAYS * DAY_MS && duration <= RADAR_MAX_DURATION_DAYS * DAY_MS
  );
}

export function nextRadarReview(now: number, expiresAt: number): number | null {
  if (now >= expiresAt) return null;
  return Math.min(now + RADAR_REVIEW_INTERVAL_DAYS * DAY_MS, expiresAt);
}

export function radarTransition(
  radar: Pick<RadarRecord, "status" | "expiresAt" | "nextReviewAt" | "lastReviewedAt">,
  action: RadarAction,
  now = Date.now(),
): RadarTransitionPatch {
  const patch = (status: RadarStatus): RadarTransitionPatch => ({
    status,
    nextReviewAt: status === "expired" || status === "cancelled" ? null : radar.nextReviewAt,
    lastReviewedAt: radar.lastReviewedAt,
  });

  if (now >= radar.expiresAt && action !== "cancel") {
    return patch("expired");
  }

  switch (action) {
    case "activate":
      if (radar.status !== "draft") throw new Error("Radar action is not allowed: activate.");
      return {
        status: "active",
        nextReviewAt: nextRadarReview(now, radar.expiresAt),
        lastReviewedAt: null,
      };
    case "begin_watch":
      if (radar.status !== "active") throw new Error("Radar action is not allowed: begin_watch.");
      return patch("watching");
    case "mark_matched":
      if (radar.status !== "watching")
        throw new Error("Radar action is not allowed: mark_matched.");
      return patch("matched");
    case "pause":
      if (!["active", "watching", "matched"].includes(radar.status)) {
        throw new Error("Radar action is not allowed: pause.");
      }
      return { status: "paused", nextReviewAt: null, lastReviewedAt: radar.lastReviewedAt };
    case "resume":
      if (radar.status !== "paused") throw new Error("Radar action is not allowed: resume.");
      return {
        status: "active",
        nextReviewAt: nextRadarReview(now, radar.expiresAt),
        lastReviewedAt: radar.lastReviewedAt,
      };
    case "revalidate":
      if (!["active", "watching", "matched"].includes(radar.status)) {
        throw new Error("Radar action is not allowed: revalidate.");
      }
      return {
        status: radar.status,
        nextReviewAt: nextRadarReview(now, radar.expiresAt),
        lastReviewedAt: now,
      };
    case "expire":
      if (["expired", "cancelled"].includes(radar.status)) {
        throw new Error("Radar action is not allowed: expire.");
      }
      return patch("expired");
    case "cancel":
      if (["expired", "cancelled"].includes(radar.status)) {
        throw new Error("Radar action is not allowed: cancel.");
      }
      return patch("cancelled");
  }
}

export function radarNeedsReview(
  radar: Pick<RadarRecord, "status" | "nextReviewAt">,
  now = Date.now(),
): boolean {
  return (
    ["active", "watching", "matched"].includes(radar.status) &&
    radar.nextReviewAt !== null &&
    radar.nextReviewAt <= now
  );
}
