/**
 * Installability platform layer: registers the service worker and exposes the
 * native install prompt as reactive state. No UI, no business logic.
 */
import { useEffect, useState } from "react";

import { watchForUpdates } from "./update";
import { isAppShellWorker, shouldDisableServiceWorker } from "./policy";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

let registrationScheduled = false;

/** One registrar, including cleanup in dev, iframe previews and the kill-switch URL. */
export function registerServiceWorker(): void {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (shouldDisableServiceWorker({
    production: import.meta.env.PROD,
    hostname: window.location.hostname,
    embedded: window.self !== window.top,
    search: window.location.search,
  })) {
    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      await Promise.allSettled(registrations.filter((registration) =>
        [registration.active, registration.waiting, registration.installing].some(
          (worker) => worker && isAppShellWorker(worker.scriptURL, window.location.origin),
        ),
      ).map((registration) => registration.unregister()));
    }).catch(() => undefined);
    return;
  }
  if (registrationScheduled) return;
  registrationScheduled = true;
  const register = () => {
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => watchForUpdates(registration))
      .catch(() => undefined);
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

export function useInstallPrompt() {
  const [available, setAvailable] = useState(deferredPrompt !== null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onListener = () => setAvailable(deferredPrompt !== null);
    listeners.add(onListener);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      notify();
    };
    const onInstalled = () => {
      deferredPrompt = null;
      setInstalled(true);
      notify();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    setInstalled(isStandalone());

    return () => {
      listeners.delete(onListener);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install(): Promise<"accepted" | "dismissed" | "unavailable"> {
    if (!deferredPrompt) return "unavailable";
    const prompt = deferredPrompt;
    deferredPrompt = null;
    notify();
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome;
  }

  return { available: available && !installed, installed, install };
}
