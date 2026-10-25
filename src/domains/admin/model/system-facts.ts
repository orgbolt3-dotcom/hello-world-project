import type { ManagementModuleKey } from "@eco/core-contracts";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminOverview } from "./queries";

export interface AdminFact {
  labelKey: MessageKey;
  value: number | string;
  /** True when the value is already formatted for humans. */
  raw?: boolean;
}

/**
 * Modules without a record list still answer a question about the platform.
 * This maps each of them to the facts that answer it, using the same
 * aggregated overview payload. Pure function — no component ever computes this.
 */
export function systemFactsFor(
  key: ManagementModuleKey,
  overview: AdminOverview,
  storage: string,
): AdminFact[] {
  const c = overview.counts;
  const totalRows = Object.values(c).reduce((sum, value) => sum + value, 0);

  switch (key) {
    case "database":
      return [
        { labelKey: "admin.kpi.tables", value: Object.keys(c).length },
        { labelKey: "admin.kpi.rows", value: totalRows },
        { labelKey: "admin.kpi.storage", value: storage, raw: true },
      ];
    case "sync":
      return [
        { labelKey: "admin.kpi.revision", value: overview.syncRevision },
        { labelKey: "admin.kpi.rows", value: totalRows },
        { labelKey: "admin.kpi.audit", value: c["audit"] ?? 0 },
      ];
    case "analytics":
      return [
        { labelKey: "admin.kpi.activeWeek", value: overview.activeThisWeek },
        { labelKey: "admin.kpi.people", value: c["profiles"] ?? 0 },
        { labelKey: "admin.kpi.posts", value: c["posts"] ?? 0 },
        { labelKey: "admin.kpi.flashes", value: c["flashes"] ?? 0 },
      ];
    case "intelligence":
      return [
        { labelKey: "admin.kpi.people", value: c["profiles"] ?? 0 },
        { labelKey: "admin.kpi.posts", value: c["posts"] ?? 0 },
        { labelKey: "admin.kpi.missions", value: c["missions"] ?? 0 },
      ];
    case "security":
      return [
        { labelKey: "admin.kpi.roles", value: c["user_roles"] ?? 0 },
        { labelKey: "admin.kpi.identities", value: c["udi"] ?? 0 },
        { labelKey: "admin.kpi.audit", value: c["audit"] ?? 0 },
      ];
    case "configuration":
      return [
        { labelKey: "admin.kpi.people", value: c["profiles"] ?? 0 },
        { labelKey: "admin.kpi.identities", value: c["udi"] ?? 0 },
        { labelKey: "admin.kpi.revision", value: overview.syncRevision },
      ];
    case "api":
      return [
        { labelKey: "admin.kpi.revision", value: overview.syncRevision },
        { labelKey: "admin.kpi.audit", value: c["audit"] ?? 0 },
        { labelKey: "admin.kpi.rows", value: totalRows },
      ];
    case "infrastructure":
      return [
        { labelKey: "admin.kpi.storage", value: storage, raw: true },
        { labelKey: "admin.kpi.media", value: c["media"] ?? 0 },
        { labelKey: "admin.kpi.rows", value: totalRows },
      ];
    case "support":
      return [
        { labelKey: "admin.kpi.notifications", value: c["notifications"] ?? 0 },
        { labelKey: "admin.kpi.missions", value: c["missions"] ?? 0 },
        { labelKey: "admin.kpi.people", value: c["profiles"] ?? 0 },
      ];
    default:
      return [
        { labelKey: "admin.kpi.activeWeek", value: overview.activeThisWeek },
        { labelKey: "admin.kpi.rows", value: totalRows },
      ];
  }
}
