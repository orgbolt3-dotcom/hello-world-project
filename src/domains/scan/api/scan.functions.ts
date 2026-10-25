import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ScanResult } from "@eco/core-contracts";
import { FLASH_CATEGORIES } from "@eco/core-contracts";

const scanQuerySchema = z
  .object({
    text: z.string().trim().min(0).max(160),
    category: z.enum(FLASH_CATEGORIES).nullable(),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    radiusKm: z.number().finite().min(1).max(50),
    limit: z.number().int().min(1).max(50),
  })
  .strict();

/** Public proximity search; no account required, no private data returned. */
export const scanNearby = createServerFn({ method: "POST" })
  .inputValidator(scanQuerySchema)
  .handler(
    async ({ data }): Promise<ScanResult[]> =>
      (await import("./scan.server")).scanPublicFlashes(data),
  );
