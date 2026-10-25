import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "info" | "destructive" | "intelligence";

interface IndicatorProps {
  tone?: Tone;
  /** Small label inside the pill. */
  label?: ReactNode;
  /** Show a leading dot. */
  dot?: boolean;
  /** Render as a tiny solid dot only (no pill). */
  dotOnly?: boolean;
  /** Pulse the dot — for live / presence / AI states. */
  pulse?: boolean;
  className?: string;
}

const toneRing: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-[oklch(0.45_0.16_75)] dark:text-warning",
  info: "bg-info/15 text-info",
  destructive: "bg-destructive/15 text-destructive",
  intelligence:
    "bg-[color-mix(in_oklab,var(--intelligence)_16%,transparent)] text-[var(--intelligence)]",
};

const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  intelligence: "bg-[var(--intelligence)]",
};

/**
 * Indicator — generic status pill / dot.
 * Phase 4/5 — adds intelligence tone + pulse loop.
 */
export function Indicator({
  tone = "neutral",
  label,
  dot,
  dotOnly,
  pulse,
  className,
}: IndicatorProps) {
  const dotEl = (
    <span
      aria-hidden
      className={cn(
        "relative inline-block h-1.5 w-1.5 rounded-full",
        toneDot[tone],
        pulse && "motion-glow-pulse",
      )}
    >
      {pulse && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full opacity-60 motion-radar-ping",
            toneDot[tone],
          )}
        />
      )}
    </span>
  );

  if (dotOnly) {
    return <span className={cn("inline-block", className)}>{dotEl}</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium",
        toneRing[tone],
        className,
      )}
    >
      {dot && dotEl}
      {label}
    </span>
  );
}
