import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Icon } from "./Icon";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — generic placeholder for "no content yet" surfaces.
 * Calm, generous, never frustrating.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "mx-auto flex max-w-sm flex-col items-center gap-3 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
        {icon ?? <Icon as={Inbox} size="lg" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium tracking-tight">{title ?? t("common.empty")}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description ?? t("common.empty.desc")}
        </p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
