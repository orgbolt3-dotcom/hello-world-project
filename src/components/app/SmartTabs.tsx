import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { spring } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

export interface SmartTab {
  id: string;
  label: ReactNode;
  /** Optional trailing pill (count, dot). */
  badge?: ReactNode;
}

interface SmartTabsProps {
  tabs: SmartTab[];
  value: string;
  onChange: (id: string) => void;
  /** Visual style. "pill" = segmented; "underline" = minimal. */
  variant?: "pill" | "underline";
  className?: string;
  "aria-label"?: string;
}

/**
 * SmartTabs — generic, animated tab selector.
 * Uses framer-motion layoutId so the active indicator glides between tabs.
 */
export function SmartTabs({
  tabs,
  value,
  onChange,
  variant = "pill",
  className,
  ...rest
}: SmartTabsProps) {
  const layoutId = useId();

  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={cn("flex gap-5 hairline", className)}
        aria-label={rest["aria-label"]}
      >
        {tabs.map((tab) => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium tap focus-visible:outline-none",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.badge}
              </span>
              {active && (
                <motion.span
                  layoutId={layoutId}
                  transition={spring.smooth}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cn(
        "relative inline-flex items-center gap-1 rounded-full bg-surface p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium tap focus-visible:outline-none",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={spring.smooth}
                className="absolute inset-0 rounded-full bg-surface-elevated shadow-[var(--shadow-soft)]"
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {tab.label}
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
