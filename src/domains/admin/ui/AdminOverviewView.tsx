import type { ManagementModuleDefinition } from "@eco/core-contracts";
import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminOverview } from "../model/queries";
import { ModuleHeader } from "./ModuleHeader";
import { StatCard } from "./StatCard";
import { StateBlock } from "./StateBlock";
import { formatBytes, formatDate } from "./format";

interface Props {
  module: ManagementModuleDefinition;
  overview: AdminOverview | undefined;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

const COUNTER_LABELS: Array<{ table: string; labelKey: MessageKey }> = [
  { table: "profiles", labelKey: "admin.kpi.people" },
  { table: "udi", labelKey: "admin.kpi.identities" },
  { table: "flashes", labelKey: "admin.kpi.flashes" },
  { table: "missions", labelKey: "admin.kpi.missions" },
  { table: "posts", labelKey: "admin.kpi.posts" },
  { table: "media", labelKey: "admin.kpi.media" },
  { table: "notifications", labelKey: "admin.kpi.notifications" },
  { table: "audit", labelKey: "admin.kpi.audit" },
];

/** Dashboard home: the platform in one glance. */
export function AdminOverviewView({ module, overview, loading, error, onRetry }: Props) {
  const { t, locale } = useI18n();

  return (
    <div>
      <ModuleHeader module={module} />

      {loading || error || !overview ? (
        <StateBlock loading={loading} error={error} onRetry={onRetry} />
      ) : (
        <div className="space-y-8">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <StatCard labelKey="admin.kpi.activeWeek" value={overview.activeThisWeek} />
            {COUNTER_LABELS.map((counter) => (
              <StatCard
                key={counter.table}
                labelKey={counter.labelKey}
                value={overview.counts[counter.table] ?? 0}
              />
            ))}
            <StatCard
              labelKey="admin.kpi.storage"
              value={formatBytes(overview.storageBytes, locale)}
              raw
            />
            <StatCard labelKey="admin.kpi.revision" value={overview.syncRevision} />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium">{t("admin.audit.recent")}</h2>
            {overview.recentAudit.length === 0 ? (
              <p className="rounded-2xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
                {t("admin.audit.empty")}
              </p>
            ) : (
              <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/40">
                {overview.recentAudit.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 p-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {entry.action}
                    </span>
                    <span className="text-sm">{entry.summary || entry.targetTable}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDate(entry.createdAt, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-xs text-muted-foreground">
            {t("admin.updatedAt")} {formatDate(overview.generatedAt, locale)}
          </p>
        </div>
      )}
    </div>
  );
}
