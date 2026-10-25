import type { ReactNode } from "react";
import { Surface } from "./Surface";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  /** Small label above the value, e.g. "Solde" or "Crédits". */
  label: ReactNode;
  /** Main value — already formatted by the caller. */
  value: ReactNode;
  /** Optional secondary line (delta, currency, period). */
  meta?: ReactNode;
  /** Optional trailing action — usually a button or icon. */
  trailing?: ReactNode;
  className?: string;
}

/**
 * WalletCard — generic balance/value card.
 * Composes a calm display surface for any numeric value.
 */
export function WalletCard({ label, value, meta, trailing, className }: WalletCardProps) {
  return (
    <Surface
      variant="elevated"
      padding="lg"
      radius="3xl"
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-[color-mix(in_oklab,var(--primary)_10%,var(--surface-elevated))] to-[var(--surface-elevated)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="eyebrow">{label}</div>
          <div className="font-display text-4xl leading-none text-foreground">{value}</div>
          {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    </Surface>
  );
}
