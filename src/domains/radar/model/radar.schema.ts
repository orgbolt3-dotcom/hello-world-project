import { z } from "zod";
import {
  FLASH_CATEGORIES,
  RADAR_MAX_DURATION_DAYS,
  RADAR_MIN_DURATION_DAYS,
  RADAR_RADII_KM,
} from "@eco/core-contracts";

const DAY_MS = 24 * 60 * 60 * 1000;

export const radarDraftSchema = z
  .object({
    title: z.string().trim().min(3).max(160),
    query: z.string().trim().min(3).max(2_000),
    category: z.enum(FLASH_CATEGORIES).nullable(),
    areaLabel: z.string().trim().min(2).max(80),
    radiusKm: z.union([
      z.literal(1),
      z.literal(3),
      z.literal(5),
      z.literal(10),
      z.literal(25),
      z.literal(50),
    ]),
    startsAt: z.number().int().nonnegative(),
    expiresAt: z.number().int().positive(),
  })
  .strict()
  .superRefine((value, context) => {
    const duration = value.expiresAt - value.startsAt;
    if (duration < RADAR_MIN_DURATION_DAYS * DAY_MS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Radar must last at least 3 days.",
      });
    }
    if (duration > RADAR_MAX_DURATION_DAYS * DAY_MS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Radar cannot exceed 90 days.",
      });
    }
  });

export const radarCommandSchema = z
  .object({
    radarId: z.string().uuid(),
    action: z.enum(["activate", "pause", "resume", "revalidate", "cancel"]),
  })
  .strict();
