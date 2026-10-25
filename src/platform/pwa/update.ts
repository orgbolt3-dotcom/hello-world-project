/**
 * Service worker update awareness: exposes "a new version is ready" as
 * reactive state, plus the action that applies it. No UI, no business logic.
 */
import { useEffect, useState } from "react";

let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<(ready: boolean) => void>();

function announce(worker: ServiceWorker | null) {
  waitingWorker = worker;
  listeners.forEach((listener) => listener(worker !== null));
}

/** Called once by the registration layer, with the fresh registration. */
export function watchForUpdates(registration: ServiceWorkerRegistration): void {
  if (registration.waiting && navigator.serviceWorker.controller) {
    announce(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener("statechange", () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        announce(installing);
      }
    });
  });

  // Periodic check so long-lived sessions still learn about new releases.
  const interval = window.setInterval(
    () => {
      void registration.update().catch(() => undefined);
    },
    60 * 60 * 1000,
  );
  window.addEventListener("pagehide", () => window.clearInterval(interval), { once: true });
}

export function useAppUpdate() {
  const [ready, setReady] = useState(waitingWorker !== null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const listener = (value: boolean) => setReady(value);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  function apply() {
    if (!waitingWorker) return;
    setApplying(true);
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
    // Safety net if the takeover event never arrives.
    window.setTimeout(() => {
      if (!reloaded) window.location.reload();
    }, 3000);
  }

  return { ready, applying, apply };
}
