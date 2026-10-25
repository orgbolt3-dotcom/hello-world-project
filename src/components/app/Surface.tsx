import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "plain"
  | "elevated"
  | "sunken"
  | "glass"
  | "glass-strong"
  | "glass-soft"
  | "assistant";
type Padding = "none" | "sm" | "md" | "lg";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  padding?: Padding;
  /** Apply a hairline border to delimit without weight. */
  bordered?: boolean;
  /** Use a rounded radius. Defaults to 2xl (28px). */
  radius?: "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | "none";
  /** Adds hover-lift + press feedback + focus ring. */
  interactive?: boolean;
  /** Adds a soft glow halo. Use sparingly. */
  glow?: "none" | "soft" | "ambient" | "focal";
}

const variantClass: Record<Variant, string> = {
  plain: "bg-surface",
  elevated: "bg-surface-elevated shadow-[var(--shadow-elevated)]",
  sunken: "bg-surface-sunken",
  glass: "glass",
  "glass-strong": "glass-strong",
  "glass-soft": "glass-soft",
  assistant: "glass-assistant",
};

const paddingClass: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const radiusClass: Record<NonNullable<SurfaceProps["radius"]>, string> = {
  none: "rounded-none",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

const glowClass = {
  none: "",
  soft: "glow-soft",
  ambient: "glow-ambient",
  focal: "glow-focal",
} as const;

/**
 * Surface — semantic container for any block. Encapsulates the
 * surface/elevation/glass system so components never reach for
 * raw bg/shadow classes.
 *
 * Phase 4/5 — adds `assistant`, `glass-soft`, interactive + glow.
 */
export function Surface({
  variant = "plain",
  padding = "md",
  bordered = false,
  radius = "2xl",
  interactive = false,
  glow = "none",
  className,
  ...rest
}: SurfaceProps) {
  return (
    <div
      className={cn(
        variantClass[variant],
        paddingClass[padding],
        radiusClass[radius],
        bordered && "border border-border-soft",
        interactive && "interactive select-none",
        glowClass[glow],
        className,
      )}
      {...rest}
    />
  );
}
