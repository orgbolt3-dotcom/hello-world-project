import type { ManagementModuleDefinition } from "@eco/core-contracts";
import { useI18n } from "@/lib/i18n/useI18n";
import type { AdminOverview } from "../model/queries";
import { systemFactsFor } from "../model/system-facts";
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

/** Modules that answer a question about the platform rather than list rows. */
export function AdminSystemView({ module, overview, loading, error, onRetry }: Props) {
  const { t, locale } = useI18n();

  if (loading || error || !overview) {
    return (
      <div>
        <ModuleHeader module={module} />
        <StateBlock loading={loading} error={error} onRetry={onRetry} />
      </div>
    );
  }

  const facts = systemFactsFor(module.key, overview, formatBytes(overview.storageBytes, locale));

  return (
    <div>
      <ModuleHeader module={module} />
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {facts.map((fact) => (
          <StatCard
            key={fact.labelKey}
            labelKey={fact.labelKey}
            value={fact.value}
            raw={fact.raw ?? false}
          />
        ))}
      </section>
      <p className="mt-6 text-xs text-muted-foreground">
        {t("admin.updatedAt")} {formatDate(overview.generatedAt, locale)}
      </p>
    </div>
  );
}
