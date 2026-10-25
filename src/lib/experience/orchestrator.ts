/**
 * Experience orchestrator — single boot point for the foundation layer.
 *
 * Called once from AppShell. Hydrates stores, primes realtime, and
 * leaves the door open for future extensions (analytics, ai, sync).
 */
import { useEffect } from "react";
import { initTheme } from "@/lib/app/theme";
import { initI18n } from "@/lib/i18n/useI18n";
import { useOnboarding } from "./onboarding";

export function useExperienceBoot() {
  const hydrate = useOnboarding((s) => s.hydrate);
  useEffect(() => {
    initTheme();
    initI18n();
    hydrate();
  }, [hydrate]);
}
