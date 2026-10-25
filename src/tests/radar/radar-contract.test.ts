import { describe, expect, it } from "vitest";
import {
  RADAR_MAX_DURATION_DAYS,
  RADAR_MIN_DURATION_DAYS,
  RADAR_RADII_KM,
  RADAR_STATUSES,
} from "@eco/core-contracts";
import { radarDraftSchema } from "@/domains/radar/model/radar.schema";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("Radar contract", () => {
  const valid = {
    title: "Trouver un répétiteur",
    query: "Je cherche un répétiteur de mathématiques",
    category: "education" as const,
    areaLabel: "Centre",
    radiusKm: 10 as const,
    startsAt: 1_000,
    expiresAt: 1_000 + 10 * DAY_MS,
  };

  it("defines all lifecycle states and bounded radii", () => {
    expect(RADAR_STATUSES).toEqual([
      "draft",
      "active",
      "watching",
      "matched",
      "paused",
      "expired",
      "cancelled",
    ]);
    expect(RADAR_RADII_KM).toEqual([1, 3, 5, 10, 25, 50]);
  });

  it("accepts a strict valid draft", () => {
    expect(radarDraftSchema.parse(valid)).toEqual(valid);
  });

  it("rejects durations outside three to ninety days", () => {
    expect(() =>
      radarDraftSchema.parse({
        ...valid,
        expiresAt: valid.startsAt + (RADAR_MIN_DURATION_DAYS - 1) * DAY_MS,
      }),
    ).toThrow();
    expect(() =>
      radarDraftSchema.parse({
        ...valid,
        expiresAt: valid.startsAt + (RADAR_MAX_DURATION_DAYS + 1) * DAY_MS,
      }),
    ).toThrow();
  });
});
