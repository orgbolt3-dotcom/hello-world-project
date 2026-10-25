import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useAppUpdate } from "@/platform/pwa";
import { useI18n } from "@/lib/i18n/useI18n";

/** Tells the person a newer version is ready and reloads on demand. */
export function UpdateBanner() {
  const { t } = useI18n();
  const { ready, applying, apply } = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!ready || dismissed) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 z-50 rounded-2xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur"
      style={{ bottom: "calc(6.5rem + var(--safe-bottom))" }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RefreshCw className={applying ? "size-4 animate-spin" : "size-4"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("update.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("update.subtitle")}</p>
          <button
            type="button"
            onClick={apply}
            disabled={applying}
            className="mt-2 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {t("update.action")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("update.dismiss")}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
