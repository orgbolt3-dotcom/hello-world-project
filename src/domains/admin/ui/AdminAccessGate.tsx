import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/useI18n";

interface Props {
  loading: boolean;
  error: boolean;
  allowed: boolean;
  onRetry: () => void;
  children: ReactNode;
}

/** Renders the dashboard only when the server confirmed the role. */
export function AdminAccessGate({ loading, error, allowed, onRetry, children }: Props) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background text-sm text-muted-foreground">
        {t("app.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <Notice title={t("admin.error.title")} desc={t("admin.error.desc")}>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          {t("common.retry")}
        </button>
      </Notice>
    );
  }

  if (!allowed) {
    return (
      <Notice title={t("admin.denied.title")} desc={t("admin.denied.desc")}>
        <Link to="/" className="rounded-lg border border-border/60 px-3 py-1.5 text-sm">
          {t("nav.home")}
        </Link>
      </Notice>
    );
  }

  return <>{children}</>;
}

function Notice({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="max-w-sm rounded-2xl border border-border/60 bg-card/40 p-6 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        <div className="mt-4 flex justify-center">{children}</div>
      </div>
    </div>
  );
}
