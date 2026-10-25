import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { transition } from "@/lib/design/motion";
import { useReducedMotion } from "@/lib/design/useReducedMotion";
import { cn } from "@/lib/utils";

type MotionButtonProps = Omit<HTMLMotionProps<"button">, "ref">;

interface FloatingButtonProps extends MotionButtonProps {
  icon: ReactNode;
  label?: string;
  /** Visual position. Anchored is fixed to viewport; inline lets parent place it. */
  position?: "bottom-right" | "bottom-center" | "inline";
  size?: "md" | "lg";
  /** Accent family. Default primary; "assistant" tints with intelligence violet. */
  tone?: "primary" | "warm" | "trust" | "assistant";
  /** Ambient glow halo around the FAB. */
  glow?: boolean;
  /** Soft breathing presence loop. */
  breathing?: boolean;
}

const sizes = {
  md: "h-12 w-12",
  lg: "h-14 w-14",
} as const;

const positions = {
  "bottom-right": "fixed right-4 bottom-[max(calc(env(safe-area-inset-bottom)+5.5rem),6rem)] z-40",
  "bottom-center":
    "fixed left-1/2 -translate-x-1/2 bottom-[max(calc(env(safe-area-inset-bottom)+5.5rem),6rem)] z-40",
  inline: "",
} as const;

const tones = {
  primary: "bg-primary text-primary-foreground",
  warm: "bg-[var(--warm)] text-[var(--background)]",
  trust: "bg-[var(--trust)] text-[var(--background)]",
  assistant:
    "bg-[color-mix(in_oklab,var(--intelligence)_22%,var(--surface-floating))] text-foreground border border-[color-mix(in_oklab,var(--intelligence)_30%,transparent)]",
} as const;

/**
 * FloatingButton — generic FAB primitive.
 * Phase 4/5 — adds tone families, optional glow + breathing presence.
 */
export const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  (
    {
      icon,
      label,
      position = "bottom-right",
      size = "md",
      tone = "primary",
      glow = false,
      breathing = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const reduced = useReducedMotion();
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.94 }}
        transition={transition.spring}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          "shadow-[var(--shadow-float)]",
          "tap focus-ring",
          tones[tone],
          glow && "glow-ambient",
          breathing && !reduced && "motion-breathe",
          sizes[size],
          positions[position],
          className,
        )}
        {...rest}
      >
        {icon}
      </motion.button>
    );
  },
);
FloatingButton.displayName = "FloatingButton";
