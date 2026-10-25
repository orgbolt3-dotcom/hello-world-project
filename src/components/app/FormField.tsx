import type { ReactNode } from "react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: ReactNode;
  /** Sub-label shown under the main label. */
  hint?: ReactNode;
  /** Error message — when present, switches field to error tone. */
  error?: ReactNode;
  /** Optional inline help shown next to the label. */
  optional?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
  className?: string;
}

/**
 * FormField — generic label/hint/error wrapper.
 * Keeps every form input visually & semantically consistent.
 *
 *   <FormField label="Name" hint="Public" error={err}>
 *     {(p) => <Input {...p} />}
 *   </FormField>
 */
export function FormField({ label, hint, error, optional, children, className }: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          {optional && <span className="text-2xs text-muted-foreground">optional</span>}
        </div>
      )}
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
