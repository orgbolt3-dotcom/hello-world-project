import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";

interface PlaceholderPageProps {
  titleKey: MessageKey;
  descKey: MessageKey;
}

/**
 * Generic placeholder shell for routes that have no business UI yet.
 * Visual continuity with the rest of the shell; no domain logic.
 *
 * Phase 5/5: harmonized with semantic typography + safe-area aware
 * stage-center utility.
 */
export function PlaceholderPage({ titleKey, descKey }: PlaceholderPageProps) {
  const { t } = useI18n();
  return (
    <section className="stage-center text-center">
      <span className="eyebrow mb-4 inline-flex items-center rounded-full border border-border-soft bg-surface px-3 py-1">
        {t("common.soon")}
      </span>
      <h1 className="text-fluid-display-sm">{t(titleKey)}</h1>
      <p className="text-subtitle mt-3 max-w-prose">{t(descKey)}</p>
    </section>
  );
}
