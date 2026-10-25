import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";
import { formatNumber } from "./format";

interface StatCardProps {
  labelKey: MessageKey;
  value: number | string;
  hint?: string;
  raw?: boolean;
}

/** One calm counter. No logic beyond formatting. */
export function StatCard({ labelKey, value, hint, raw = false }: StatCardProps) {
  const { t, locale } = useI18n();
  const display = raw || typeof value === "string" ? value : formatNumber(value, locale);
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{display}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
