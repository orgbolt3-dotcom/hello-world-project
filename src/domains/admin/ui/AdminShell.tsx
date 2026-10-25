import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { AppRole, ManagementModuleDefinition } from "@eco/core-contracts";
import { modulesForRole } from "@eco/core-logic";
import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { iconFor } from "./icons";

interface AdminShellProps {
  role: AppRole;
  children: ReactNode;
}

const GROUP_LABELS: Record<ManagementModuleDefinition["group"], MessageKey> = {
  overview: "admin.group.overview",
  people: "admin.group.people",
  activity: "admin.group.activity",
  system: "admin.group.system",
  governance: "admin.group.governance",
};

/** Dashboard chrome: grouped module rail on the left, working area on the right. */
export function AdminShell({ role, children }: AdminShellProps) {
  const { t } = useI18n();
  const [navOpen, setNavOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const modules = modulesForRole(role);

  const groups = (Object.keys(GROUP_LABELS) as ManagementModuleDefinition["group"][])
    .map((group) => ({ group, items: modules.filter((module) => module.group === group) }))
    .filter((entry) => entry.items.length > 0);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
        <button
          type="button"
          onClick={() => setNavOpen((open) => !open)}
          aria-label={t(navOpen ? "admin.nav.close" : "admin.nav.open")}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          {navOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{t("admin.title")}</p>
          <p className="truncate text-xs text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <span className="ml-auto rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
          {t(`admin.role.${role}` as MessageKey)}
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-[110rem] gap-6 px-4 py-6 lg:px-8">
        <nav
          aria-label={t("admin.title")}
          className={`${navOpen ? "block" : "hidden"} fixed inset-x-0 bottom-0 top-[57px] z-20 overflow-y-auto border-r border-border/60 bg-background p-4 lg:static lg:block lg:w-64 lg:shrink-0 lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <div className="space-y-6">
            {groups.map(({ group, items }) => (
              <div key={group} className="space-y-1">
                <p className="px-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {t(GROUP_LABELS[group])}
                </p>
                {items.map((module) => {
                  const ModuleIcon = iconFor(module.icon);
                  const active =
                    module.path === "/admin" ? pathname === "/admin" : pathname === module.path;
                  return (
                    <Link
                      key={module.key}
                      {...(module.key === "home"
                        ? ({ to: "/admin" } as const)
                        : ({
                            to: "/admin/$module",
                            params: { module: module.key },
                          } as const))}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <ModuleIcon className="size-4 shrink-0" />
                      <span className="truncate">{t(module.labelKey as MessageKey)}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <main className="min-w-0 flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
