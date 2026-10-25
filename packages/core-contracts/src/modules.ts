/**
 * Management dashboard module registry contract.
 * Each module is an independent unit: its own route, its own domain hooks,
 * its own permissions. Adding a module never modifies another one.
 */

export const MANAGEMENT_MODULES = [
  "home",
  "users",
  "udi",
  "flash",
  "missions",
  "social",
  "trust",
  "intelligence",
  "media",
  "notifications",
  "sync",
  "analytics",
  "security",
  "audit",
  "configuration",
  "database",
  "api",
  "infrastructure",
  "support",
  "administration",
] as const;

export type ManagementModuleKey = (typeof MANAGEMENT_MODULES)[number];

export type ManagementModuleGroup = "overview" | "people" | "activity" | "system" | "governance";

export interface ManagementModuleDefinition {
  key: ManagementModuleKey;
  /** Route path under the dashboard shell, e.g. "/admin/users". */
  path: string;
  group: ManagementModuleGroup;
  /** i18n key for the human-facing label. Never a raw string. */
  labelKey: string;
  /** i18n key for the one-line human explanation of what the module does. */
  descriptionKey: string;
  /** Lucide icon name resolved by the UI layer. */
  icon: string;
  /** Minimum role required. Enforced server-side as well. */
  minRole: "moderator" | "admin" | "owner";
}
