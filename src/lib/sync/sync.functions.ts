/**
 * Sync server functions — the typed, in-app twin of the HTTP sync endpoints.
 *
 * The background worker uses the HTTP endpoints (`/api/sync/*`); application
 * code that already runs inside the router can call these instead. Both share
 * the exact same execution logic and run as the signed-in person.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PullResult, PushResult } from "@eco/core-contracts";
import { validatePull, validatePush } from "./validate";

/** Pull every change newer than the caller's cursors, table by table. */
export const pullChanges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validatePull)
  .handler(async ({ data, context }): Promise<PullResult> => {
    const { runPull } = await import("./transport.server");
    return runPull(context.supabase as never, data);
  });

/** Push pending local writes with strict validation and durable idempotence. */
export const pushChanges = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validatePush)
  .handler(async ({ data, context }): Promise<PushResult> => {
    const { runPush } = await import("./transport.server");
    return runPush(context.supabase as never, data, context.userId);
  });
