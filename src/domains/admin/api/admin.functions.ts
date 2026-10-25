import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readAdminOverview, readAdminRecords, readViewerRole } from "./admin.server";
import { parseRecordsInput, type AdminRecordsInput } from "../model/queries";

/** Who is looking, and what the dashboard is allowed to show them. */
export const getAdminViewer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readViewerRole(context.supabase, context.userId));

/** Live counters and recent governance activity for the dashboard home. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const viewer = await readViewerRole(context.supabase, context.userId);
    return readAdminOverview(viewer);
  });

/** Paginated rows for a records module. The module — not the caller — picks the table. */
export const listAdminRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AdminRecordsInput) => parseRecordsInput(input))
  .handler(async ({ data, context }) => {
    const viewer = await readViewerRole(context.supabase, context.userId);
    return readAdminRecords(viewer, data);
  });
