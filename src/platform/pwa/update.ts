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

  void registration.update().catch(() => undefined);
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
    }, { once: true });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  return { ready, applying, apply };
}
