import {
  BadgeCheck,
  BarChart3,
  Bell,
  Crown,
  Database,
  Images,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MessagesSquare,
  Plug,
  RefreshCw,
  ScrollText,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Resolves the registry's icon name to a real component. UI-layer concern only. */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Zap,
  Target,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Images,
  Bell,
  RefreshCw,
  BarChart3,
  Lock,
  ScrollText,
  SlidersHorizontal,
  Database,
  Plug,
  Server,
  LifeBuoy,
  Crown,
};

export function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? LayoutDashboard;
}
