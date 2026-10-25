import { Check, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/useI18n";
import { useSyncStatus } from "@/platform/offline";

/**
 * Tells the person, in plain words, whether their work is safe.
 * Presentation only: it reads the sync state, it never triggers a sync.
 */
export function SyncIndicator({ className }: { className?: string }) {
  const { t } = useI18n();
  const { phase, messageKey, pendingCount, isSettled } = useSyncStatus();

  const Icon =
    phase === "offline" ? CloudOff : phase === "error" ? RefreshCw : isSettled ? Check : Loader2;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs",
        "bg-surface-elevated/70 text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-3.5",
          !isSettled && phase !== "offline" && phase !== "error" && "animate-spin",
          phase === "offline" && "text-warning",
          isSettled && "text-success",
        )}
      />
      <span>{t(messageKey)}</span>
      {pendingCount > 0 && (
        <span className="tabular-nums">
          {pendingCount === 1 ? t("sync.pending.one") : `${pendingCount} ${t("sync.pending.many")}`}
        </span>
      )}
    </div>
  );
}
