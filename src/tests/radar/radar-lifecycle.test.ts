import { describe, expect, it } from "vitest";
import type { RadarRecord } from "@eco/core-contracts";
import {
  nextRadarReview,
  radarNeedsReview,
  radarTransition,
  validateRadarSchedule,
} from "@eco/core-logic";

const DAY_MS = 24 * 60 * 60 * 1000;

function radar(overrides: Partial<RadarRecord> = {}): RadarRecord {
  return {
    id: "d0000000-0000-4000-8000-000000000010",
    ownerId: "d0000000-0000-4000-8000-000000000001",
    title: "Trouver un répétiteur",
    query: "Répétiteur de mathématiques",
    category: "education",
    areaLabel: "Centre",
    radiusKm: 10,
    startsAt: 0,
    expiresAt: 30 * DAY_MS,
    status: "draft",
    nextReviewAt: null,
    lastReviewedAt: null,
    createdAt: 0,
    updatedAt: 0,
    deletedAt: null,
    revision: 0,
    ...overrides,
  };
}

describe("Radar lifecycle", () => {
  it("validates the programmed interval", () => {
    expect(validateRadarSchedule({ startsAt: 0, expiresAt: 3 * DAY_MS })).toBe(true);
    expect(validateRadarSchedule({ startsAt: 0, expiresAt: 91 * DAY_MS })).toBe(false);
  });

  it("activates and schedules the next weekly review", () => {
    expect(radarTransition(radar(), "activate", 0)).toEqual({
      status: "active",
      nextReviewAt: 7 * DAY_MS,
      lastReviewedAt: null,
    });
    expect(nextRadarReview(28 * DAY_MS, 30 * DAY_MS)).toBe(30 * DAY_MS);
  });

  it("supports watching, matching, pause and resume", () => {
    expect(radarTransition(radar({ status: "active" }), "begin_watch", 0).status).toBe("watching");
    expect(radarTransition(radar({ status: "watching" }), "mark_matched", 0).status).toBe(
      "matched",
    );
    expect(radarTransition(radar({ status: "matched" }), "pause", 0).status).toBe("paused");
    expect(radarTransition(radar({ status: "paused" }), "resume", 0).status).toBe("active");
  });

  it("detects review deadlines and terminal expiration", () => {
    expect(radarNeedsReview(radar({ status: "watching", nextReviewAt: DAY_MS }), DAY_MS)).toBe(
      true,
    );
    expect(
      radarTransition(radar({ status: "paused", expiresAt: DAY_MS }), "resume", DAY_MS).status,
    ).toBe("expired");
    expect(() => radarTransition(radar({ status: "cancelled" }), "resume", 0)).toThrow();
  });
});
