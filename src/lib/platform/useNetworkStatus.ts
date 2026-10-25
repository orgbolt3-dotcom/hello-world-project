import { useEffect, useState } from "react";

/**
 * Network awareness — foundation for offline-first & low-end device behavior.
 * Exposes online state, connection effective type, and save-data preference.
 */
export interface NetworkStatus {
  online: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  saveData: boolean;
  isLowBandwidth: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: NetworkStatus["effectiveType"];
    saveData?: boolean;
    addEventListener?: (event: string, cb: () => void) => void;
    removeEventListener?: (event: string, cb: () => void) => void;
  };
};

function read(): NetworkStatus {
  if (typeof navigator === "undefined") {
    return { online: true, effectiveType: "unknown", saveData: false, isLowBandwidth: false };
  }
  const nav = navigator as NavigatorWithConnection;
  const conn = nav.connection;
  const effectiveType = conn?.effectiveType ?? "unknown";
  const saveData = !!conn?.saveData;
  const isLowBandwidth = saveData || effectiveType === "2g" || effectiveType === "slow-2g";
  return { online: navigator.onLine, effectiveType, saveData, isLowBandwidth };
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => read());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setStatus(read());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as NavigatorWithConnection).connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  return status;
}
