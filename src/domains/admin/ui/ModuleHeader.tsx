import type { ManagementModuleDefinition } from "@eco/core-contracts";
import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { iconFor } from "./icons";

/** Shared heading for every dashboard module. */
export function ModuleHeader({ module }: { module: ManagementModuleDefinition }) {
  const { t } = useI18n();
  const ModuleIcon = iconFor(module.icon);
  return (
    <header className="mb-6 flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ModuleIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{t(module.labelKey as MessageKey)}</h1>
        <p className="text-sm text-muted-foreground">{t(module.descriptionKey as MessageKey)}</p>
      </div>
    </header>
  );
}
