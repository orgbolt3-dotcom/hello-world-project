import type { ReactNode } from "react";
import {
  Sheet as UISheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface AppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Sheet anchor side. Default = bottom (mobile-first). */
  side?: "top" | "right" | "bottom" | "left";
  children?: ReactNode;
  className?: string;
}

/**
 * Sheet — generic bottom/side sheet wrapper.
 * Wraps shadcn's Sheet with our radius + glass tone.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  side = "bottom",
  className,
  children,
}: AppSheetProps) {
  return (
    <UISheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "border-border-soft glass-strong",
          side === "bottom" && "rounded-t-3xl pb-[max(env(safe-area-inset-bottom),1rem)]",
          side === "top" && "rounded-b-3xl",
          className,
        )}
      >
        {(title || description) && (
          <SheetHeader className="space-y-1 pb-2">
            {title && <SheetTitle className="text-xl tracking-tight">{title}</SheetTitle>}
            {description && <SheetDescription className="text-sm">{description}</SheetDescription>}
          </SheetHeader>
        )}
        {side === "bottom" && (
          <span
            aria-hidden
            className="mx-auto -mt-2 mb-3 block h-1 w-10 rounded-full bg-border-strong"
          />
        )}
        <div>{children}</div>
      </SheetContent>
    </UISheet>
  );
}
