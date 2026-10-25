import {
  MANAGEMENT_MODULES,
  roleAtLeast,
  type AppRole,
  type ManagementModuleDefinition,
  type ManagementModuleKey,
} from "@eco/core-contracts";

/**
 * Declarative registry of the management dashboard.
 * Adding a module = adding one entry here + its route. Nothing else changes.
 */
export const MANAGEMENT_REGISTRY: readonly ManagementModuleDefinition[] = [
  m("home", "overview", "LayoutDashboard", "moderator"),
  m("users", "people", "Users", "admin"),
  m("udi", "people", "BadgeCheck", "admin"),
  m("flash", "activity", "Zap", "moderator"),
  m("missions", "activity", "Target", "moderator"),
  m("social", "activity", "MessagesSquare", "moderator"),
  m("trust", "people", "ShieldCheck", "admin"),
  m("intelligence", "overview", "Sparkles", "admin"),
  m("media", "activity", "Images", "moderator"),
  m("notifications", "activity", "Bell", "admin"),
  m("sync", "system", "RefreshCw", "admin"),
  m("analytics", "overview", "BarChart3", "admin"),
  m("security", "governance", "Lock", "owner"),
  m("audit", "governance", "ScrollText", "owner"),
  m("configuration", "system", "SlidersHorizontal", "admin"),
  m("database", "system", "Database", "owner"),
  m("api", "system", "Plug", "owner"),
  m("infrastructure", "system", "Server", "owner"),
  m("support", "governance", "LifeBuoy", "moderator"),
  m("administration", "governance", "Crown", "owner"),
];

function m(
  key: ManagementModuleKey,
  group: ManagementModuleDefinition["group"],
  icon: string,
  minRole: ManagementModuleDefinition["minRole"],
): ManagementModuleDefinition {
  return {
    key,
    path: key === "home" ? "/admin" : `/admin/${key}`,
    group,
    icon,
    minRole,
    labelKey: `admin.${key}.label`,
    descriptionKey: `admin.${key}.description`,
  };
}

/** Modules the given role is allowed to open. */
export function modulesForRole(role: AppRole): ManagementModuleDefinition[] {
  return MANAGEMENT_REGISTRY.filter((module) => roleAtLeast(role, module.minRole));
}

export function moduleByKey(key: ManagementModuleKey): ManagementModuleDefinition {
  const found = MANAGEMENT_REGISTRY.find((module) => module.key === key);
  if (!found) throw new Error(`Unknown management module: ${key}`);
  return found;
}

/** Guarantees the registry stays exhaustive as modules are added. */
export function assertRegistryComplete(): void {
  const missing = MANAGEMENT_MODULES.filter(
    (key) => !MANAGEMENT_REGISTRY.some((module) => module.key === key),
  );
  if (missing.length > 0) {
    throw new Error(`Management registry incomplete: ${missing.join(", ")}`);
  }
}
