import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

type Status = "info" | "success" | "warning" | "error" | "intelligence";

interface StatusBannerProps {
  status?: Status;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const styles: Record<Status, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-[oklch(0.42_0.16_75)] dark:text-warning",
  error: "bg-destructive/10 text-destructive",
  intelligence:
    "bg-[color-mix(in_oklab,var(--intelligence)_14%,transparent)] text-[var(--intelligence)]",
};

const icons: Record<Status, ComponentType<SVGProps<SVGSVGElement>>> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  intelligence: Info,
};

/**
 * StatusBanner — generic inline status block.
 * Use for non-blocking messages above content (offline, success, warning…).
 */
export function StatusBanner({
  status = "info",
  title,
  description,
  action,
  className,
}: StatusBannerProps) {
  const IconCmp = icons[status];
  return (
    <div
      role={status === "error" || status === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-3.5 py-3 text-sm",
        styles[status],
        className,
      )}
    >
      <Icon as={IconCmp} size="md" className="mt-0.5" />
      <div className="flex-1 min-w-0 space-y-0.5">
        {title && <div className="font-medium">{title}</div>}
        {description && (
          <div className="text-[0.8125rem] opacity-90 leading-relaxed">{description}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
