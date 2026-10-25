import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { MenuSheet } from "./MenuSheet";
import { useExperienceBoot } from "@/lib/experience/orchestrator";
import { useSyncEngine } from "@/platform/offline";
import { OfflineBanner } from "@/components/experience/OfflineBanner";
import { AppHeader } from "@/components/experience/AppHeader";
import { CommunicationSheet } from "@/components/experience/CommunicationSheet";
import { OnboardingSheet } from "@/components/experience/OnboardingSheet";
import { InstallBanner } from "@/components/experience/InstallBanner";
import { UpdateBanner } from "@/components/experience/UpdateBanner";
import { AILayer } from "@/components/experience/AILayer";
import { registerServiceWorker } from "@/platform/pwa";
import { useResponsive } from "@/lib/platform/useResponsive";
import { duration, easing } from "@/lib/design/tokens";
import { startWebVitals } from "@/platform/performance";

/**
 * AppShell — single mount-point that boots foundation services
 * (theme, i18n, onboarding hydration) and provides the calm canvas:
 *  - global navigation (floating bottom nav + menu sheet)
 *  - ambient AI layer
 *  - offline awareness
 *  - first-run onboarding sheet
 *  - low-end / reduced-motion gating (Phase 5/5)
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const responsive = useResponsive();

  useExperienceBoot();
  useSyncEngine();

  useEffect(() => {
    registerServiceWorker();
    startWebVitals();
  }, []);

  // Apply low-end gating on <html> so the CSS effects fall back.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("low-end", responsive.shouldReduceEffects);
  }, [responsive.shouldReduceEffects]);

  // Close menu on route change for clean continuity.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Screens that own their own chrome (management dashboard, sign-in).
  const bareChrome = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  const reduce = responsive.shouldReduceMotion;
  const pageTransition = reduce
    ? { duration: 0 }
    : { duration: duration.base, ease: easing.standard };

  if (bareChrome) {
    return (
      <div className="relative min-h-dvh bg-background text-foreground antialiased">{children}</div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground antialiased">
      <OfflineBanner />
      <AppHeader onOpenCommunication={() => setCommunicationOpen(true)} />
      <main
        id="main"
        className="mx-auto w-full max-w-screen-md pb-28"
        style={{ paddingBottom: "calc(7rem + var(--safe-bottom))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav onOpenMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
      <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
      <CommunicationSheet open={communicationOpen} onOpenChange={setCommunicationOpen} />
      <InstallBanner />
      <UpdateBanner />
      <AILayer />
      <OnboardingSheet />
    </div>
  );
}
