import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Modal — generic dialog wrapper.
 * Use for focused decisions: confirmations, short forms, single tasks.
 * For long content prefer a Sheet.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-border-soft rounded-3xl glass-strong p-6 sm:max-w-md",
          "shadow-[var(--shadow-elevated)]",
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="space-y-1.5">
            {title && <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>}
            {description && (
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children && <div className="py-2">{children}</div>}
        {footer && <DialogFooter className="gap-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
