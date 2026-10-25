import type { ReactNode } from "react";
import { SkeletonList } from "@/components/app/Skeletons";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusBanner } from "@/components/app/StatusBanner";
import { useI18n } from "@/lib/i18n/useI18n";

interface SmartStateViewProps<T> {
  loading?: boolean;
  error?: unknown;
  data?: T | undefined | null;
  /** Treat as empty when this returns true. */
  isEmpty?: (data: T) => boolean;
  /** Render once data is present and non-empty. */
  children: (data: T) => ReactNode;
  /** Override the default loading skeleton. */
  loadingFallback?: ReactNode;
  /** Override the default empty state. */
  emptyFallback?: ReactNode;
  onRetry?: () => void;
}

/**
 * SmartStateView — generic loading / error / empty / ready orchestrator.
 *
 * Centralises smart-state UX so every screen behaves the same way.
 */
export function SmartStateView<T>({
  loading,
  error,
  data,
  isEmpty,
  children,
  loadingFallback,
  emptyFallback,
  onRetry,
}: SmartStateViewProps<T>) {
  const { t } = useI18n();

  if (loading) return <>{loadingFallback ?? <SkeletonList />}</>;
  if (error) {
    return (
      <StatusBanner
        status="error"
        title={t("common.error")}
        description={t("common.error.desc")}
        action={
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium tap"
            >
              {t("common.retry")}
            </button>
          )
        }
      />
    );
  }
  if (data == null || (isEmpty && isEmpty(data))) {
    return <>{emptyFallback ?? <EmptyState />}</>;
  }
  return <>{children(data)}</>;
}
