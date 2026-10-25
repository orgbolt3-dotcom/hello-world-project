import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n/useI18n";

interface MenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Bottom sheet exposing the two ecosystem entry-points:
 * Espace and Talents — Savoirs Vivants.
 * Pure navigation surface, no business content yet.
 */
export function MenuSheet({ open, onOpenChange }: MenuSheetProps) {
  const { t } = useI18n();

  const cards = [
    {
      to: "/espace",
      icon: MapPin,
      title: t("menu.espace"),
      desc: t("menu.espace.desc"),
    },
    {
      to: "/talents",
      icon: Sparkles,
      title: t("menu.talents"),
      desc: t("menu.talents.desc"),
    },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] border-t border-border-soft bg-surface-elevated p-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-medium tracking-tight">{t("menu.title")}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t("menu.subtitle")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-3">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                onClick={() => onOpenChange(false)}
                className="group flex items-center gap-4 rounded-3xl border border-border-soft bg-surface p-4 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-medium">{c.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.desc}</span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
