import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Zap, Radar, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/useI18n";
import { useReducedMotion } from "@/lib/design/useReducedMotion";
import { cn } from "@/lib/utils";

type Tab = {
  key: "home" | "flash" | "radar" | "menu";
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: "nav.home" | "nav.flash" | "nav.radar" | "nav.menu";
};

const TABS: Tab[] = [
  { key: "home", to: "/", icon: Home, labelKey: "nav.home" },
  { key: "flash", to: "/flash", icon: Zap, labelKey: "nav.flash" },
  { key: "radar", to: "/radar", icon: Radar, labelKey: "nav.radar" },
  { key: "menu", icon: LayoutGrid, labelKey: "nav.menu" },
];

interface BottomNavProps {
  onOpenMenu: () => void;
  menuOpen: boolean;
}

/**
 * Floating bottom navigation — calm, glassy, breathing.
 * 4 tabs. The "menu" tab is a 2x2 grid that opens the MenuSheet.
 * Pure presentation; no business logic.
 */
export function BottomNav({ onOpenMenu, menuOpen }: BottomNavProps) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label={t("nav.menu")}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),0.75rem)] pointer-events-none"
    >
      <ul
        role="tablist"
        className="glass pointer-events-auto flex items-center gap-1 rounded-full border border-border-soft px-2 py-2 shadow-[var(--shadow-float)]"
      >
        {TABS.map((tab) => {
          const isMenu = tab.key === "menu";
          const active = isMenu ? menuOpen : tab.to === pathname;
          const Icon = tab.icon;
          const label = t(tab.labelKey);

          const inner = (
            <span
              className={cn(
                "relative flex h-11 min-w-11 items-center justify-center rounded-full px-3 transition-colors",
                "text-muted-foreground hover:text-foreground",
                active && "text-primary-foreground",
              )}
            >
              {active &&
                (reduce ? (
                  <span className="absolute inset-0 rounded-full bg-primary" aria-hidden />
                ) : (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary"
                    aria-hidden
                  />
                ))}
              <Icon className="relative h-5 w-5" aria-hidden />
              <span className="sr-only">{label}</span>
            </span>
          );

          return (
            <li key={tab.key} role="presentation">
              {isMenu ? (
                <button
                  type="button"
                  onClick={onOpenMenu}
                  aria-label={t("nav.open_menu")}
                  aria-haspopup="dialog"
                  aria-expanded={menuOpen}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {inner}
                </button>
              ) : (
                <Link
                  to={tab.to!}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
