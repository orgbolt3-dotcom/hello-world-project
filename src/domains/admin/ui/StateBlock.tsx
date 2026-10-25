import { useI18n } from "@/lib/i18n/useI18n";

interface StateBlockProps {
  loading: boolean;
  error: boolean;
  empty?: boolean;
  onRetry: () => void;
}

/** Calm loading / error / empty block shared by every module. */
export function StateBlock({ loading, error, empty, onRetry }: StateBlockProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl border border-border/50 bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center">
        <p className="text-sm font-medium">{t("admin.error.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.error.desc")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center">
        <p className="text-sm font-medium">{t("admin.empty.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.empty.desc")}</p>
      </div>
    );
  }

  return null;
}
