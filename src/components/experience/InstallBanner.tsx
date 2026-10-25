import { useState } from "react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/platform/pwa";
import { useI18n } from "@/lib/i18n/useI18n";

/** Gentle invitation to keep the app on the home screen. Presentation only. */
export function InstallBanner() {
  const { t } = useI18n();
  const { available, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!available || dismissed) return null;

  return (
    <div
      className="fixed inset-x-3 z-40 rounded-2xl border border-border/60 bg-background/90 p-3 shadow-lg backdrop-blur"
      style={{ bottom: "calc(6.5rem + var(--safe-bottom))" }}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("install.title")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("install.subtitle")}</p>
          <button
            type="button"
            onClick={() => void install()}
            className="mt-2 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("install.action")}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("install.dismiss")}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
