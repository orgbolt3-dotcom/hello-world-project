import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPublicFlashFeed = createServerFn({ method: "GET" }).handler(async () =>
  (await import("./flash.server")).publicFlashes(),
);

export const commandFlash = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["live", "archived"]),
      })
      .strict(),
  )
  .handler(async ({ data, context }) =>
    (await import("./flash.server")).transitionFlash(context.supabase, data.id, data.status),
  );

export const saveFlashLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        flashId: z.string().uuid(),
        latitude: z.number().finite().min(-90).max(90),
        longitude: z.number().finite().min(-180).max(180),
        accuracyMeters: z.number().finite().min(0).max(5000),
      })
      .strict(),
  )
  .handler(async ({ data, context }) =>
    (await import("./flash.server")).setPrivateFlashLocation(context.supabase, data),
  );
