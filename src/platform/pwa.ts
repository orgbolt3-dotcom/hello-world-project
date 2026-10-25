import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let registrationScheduled = false;
let activeRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(): void {
  if (registrationScheduled || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  registrationScheduled = true;

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  });
}

export function useInstallPrompt(): {
  available: boolean;
  install: () => Promise<void>;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      return;
    }

    const prompt = deferredPrompt;
    setDeferredPrompt(null);
    await prompt.prompt();
    await prompt.userChoice;
  };

  return {
    available: deferredPrompt !== null,
    install,
  };
}

export function useAppUpdate(): {
  ready: boolean;
  applying: boolean;
  apply: () => void;
} {
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);
  const applyingRef = useRef(false);

  useEffect(() => {
    applyingRef.current = applying;
  }, [applying]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let disposed = false;

    const markWaiting = (worker: ServiceWorker | null) => {
      if (worker && !disposed) {
        setReady(true);
      }
    };

    const watchRegistration = async () => {
      const registration = await navigator.serviceWorker.ready;
      if (disposed) {
        return;
      }

      activeRegistration = registration;
      markWaiting(registration.waiting);

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) {
          return;
        }

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed") {
            markWaiting(registration.waiting);
          }
        });
      });

      await registration.update().catch(() => undefined);
      markWaiting(registration.waiting);
    };

    void watchRegistration();

    const handleControllerChange = () => {
      if (applyingRef.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const apply = () => {
    const worker = activeRegistration?.waiting;
    if (!worker) {
      return;
    }

    setApplying(true);
    worker.postMessage({ type: "SKIP_WAITING" });
  };

  return {
    ready,
    applying,
    apply,
  };
}
