import { useResponsive } from "@/lib/platform/useResponsive";
import { MobileLayout } from "./mobile";
import { TabletLayout } from "./tablet";
import { DesktopLayout } from "./desktop";
import type { ReactNode } from "react";

/**
 * Adaptive layout resolver — picks the right shell per device class.
 * Phase 3: all variants currently delegate to AppShell. Swap freely later.
 */
export function AdaptiveLayout({ children }: { children: ReactNode }) {
  const { isDesktop, isTablet } = useResponsive();
  const Layout = isDesktop ? DesktopLayout : isTablet ? TabletLayout : MobileLayout;
  return <Layout>{children}</Layout>;
}
