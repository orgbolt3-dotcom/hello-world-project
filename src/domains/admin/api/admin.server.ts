import type { SupabaseClient } from "@supabase/supabase-js";
import { roleAtLeast, type AppRole, type ManagementModuleKey } from "@eco/core-contracts";
import { moduleByKey } from "@eco/core-logic";
import type { Database } from "@/integrations/supabase/types";
import {
  ADMIN_PAGE_SIZE,
  ADMIN_TABLES,
  datasetForModule,
  type AdminTable,
} from "../model/datasets";
import type {
  AdminOverview,
  AdminRecordsQuery,
  AdminRecordsResult,
  AdminRow,
} from "../model/queries";

export interface AdminViewer {
  userId: string;
  role: AppRole;
  canOpenDashboard: boolean;
}

const ROLE_ORDER: AppRole[] = ["member", "moderator", "admin", "owner"];

/**
 * Reads the caller's role through their own authenticated client (RLS applies:
 * a user can only see their own role rows). Never trust a role sent by the UI.
 */
export async function readViewerRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AdminViewer> {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);

  const roles = (data ?? []).map((row) => row.role as AppRole);
  const role = ROLE_ORDER.reduce<AppRole>(
    (best, candidate) => (roles.includes(candidate) ? candidate : best),
    "member",
  );

  return { userId, role, canOpenDashboard: roleAtLeast(role, "moderator") };
}

function assertModuleAccess(viewer: AdminViewer, key: ManagementModuleKey) {
  const module = moduleByKey(key);
  if (!roleAtLeast(viewer.role, module.minRole)) throw new Error("Forbidden");
  return module;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Aggregated, read-only picture of the platform. Counters only, never row content. */
export async function readAdminOverview(viewer: AdminViewer): Promise<AdminOverview> {
  if (!viewer.canOpenDashboard) throw new Error("Forbidden");
  const db = await admin();

  const counts: Record<string, number> = {};
  await Promise.all(
    ADMIN_TABLES.map(async (table) => {
      const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      counts[table] = count ?? 0;
    }),
  );

  const since = Date.now() - WEEK_MS;
  const { count: activeThisWeek, error: activeError } = await db
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("updated_at", since);
  if (activeError) throw new Error(activeError.message);

  const { data: revisionRow, error: revisionError } = await db
    .from("audit")
    .select("revision")
    .order("revision", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (revisionError) throw new Error(revisionError.message);

  const { data: mediaRows, error: mediaError } = await db
    .from("media")
    .select("byte_size")
    .is("deleted_at", null)
    .limit(5000);
  if (mediaError) throw new Error(mediaError.message);

  const { data: auditRows, error: auditError } = await db
    .from("audit")
    .select("id, action, target_table, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (auditError) throw new Error(auditError.message);

  return {
    counts,
    activeThisWeek: activeThisWeek ?? 0,
    syncRevision: Number(revisionRow?.revision ?? 0),
    storageBytes: (mediaRows ?? []).reduce((sum, row) => sum + Number(row.byte_size ?? 0), 0),
    recentAudit: (auditRows ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      targetTable: row.target_table,
      summary: row.summary,
      createdAt: Number(row.created_at),
    })),
    generatedAt: Date.now(),
  };
}

/** Paginated rows for one records module, with the table fixed by the registry. */
export async function readAdminRecords(
  viewer: AdminViewer,
  query: AdminRecordsQuery,
): Promise<AdminRecordsResult> {
  assertModuleAccess(viewer, query.module);

  const dataset = datasetForModule(query.module);
  if (!dataset) throw new Error("This module has no record list");

  const table: AdminTable = dataset.table;
  const columns = ["id", ...dataset.columns.map((column) => column.key)];
  const select = Array.from(new Set(columns)).join(", ");

  const from = query.page * ADMIN_PAGE_SIZE;
  const db = await admin();

  let request = db
    .from(table)
    .select(select, { count: "exact" })
    .order(dataset.orderBy, { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);

  if (query.search && dataset.searchColumn) {
    request = request.ilike(dataset.searchColumn, `%${query.search}%`);
  }

  const { data, count, error } = await request;
  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []) as unknown as AdminRow[],
    total: count ?? 0,
    page: query.page,
    pageSize: ADMIN_PAGE_SIZE,
  };
}
