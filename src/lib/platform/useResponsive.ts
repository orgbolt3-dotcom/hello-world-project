import { useDevice, type DeviceInfo } from "./useDevice";
import { useNetworkStatus, type NetworkStatus } from "./useNetworkStatus";
import { breakpoint } from "@/lib/design/tokens";

/**
 * useResponsive — single source of truth for responsive + perf gating.
 *
 * Combines device class, viewport, orientation, reduced-motion,
 * low-end hardware and bandwidth into one hook. Components should
 * read from this rather than rolling their own matchMedia logic.
 *
 *   const r = useResponsive();
 *   if (r.shouldReduceEffects) // skip backdrop-filter / glows
 *   if (r.isMobile)            // mobile-first branches
 */
export interface ResponsiveInfo extends DeviceInfo {
  network: NetworkStatus;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** True when we should disable expensive visual effects. */
  shouldReduceEffects: boolean;
  /** True when we should pause decorative animations. */
  shouldReduceMotion: boolean;
  /** Active breakpoint key matching design tokens. */
  bp: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

function bpFromWidth(w: number): ResponsiveInfo["bp"] {
  if (w >= breakpoint["2xl"]) return "2xl";
  if (w >= breakpoint.xl) return "xl";
  if (w >= breakpoint.lg) return "lg";
  if (w >= breakpoint.md) return "md";
  if (w >= breakpoint.sm) return "sm";
  return "xs";
}

export function useResponsive(): ResponsiveInfo {
  const device = useDevice();
  const network = useNetworkStatus();
  const shouldReduceMotion = device.reducedMotion;
  const shouldReduceEffects = device.isLowEnd || network.isLowBandwidth || shouldReduceMotion;
  return {
    ...device,
    network,
    isMobile: device.device === "mobile",
    isTablet: device.device === "tablet",
    isDesktop: device.device === "desktop",
    shouldReduceEffects,
    shouldReduceMotion,
    bp: bpFromWidth(device.width),
  };
}
