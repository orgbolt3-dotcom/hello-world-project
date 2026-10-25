import { useEffect, useState } from "react";

/**
 * Device awareness — multi-device foundation & low-end optimization.
 * Single source of truth. Components must NOT read window directly.
 */
export type DeviceClass = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  device: DeviceClass;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  touch: boolean;
  reducedMotion: boolean;
  /** Approximate hardware capability — used to gate heavy effects. */
  isLowEnd: boolean;
}

function read(): DeviceInfo {
  if (typeof window === "undefined") {
    return {
      device: "mobile",
      width: 390,
      height: 844,
      orientation: "portrait",
      touch: true,
      reducedMotion: false,
      isLowEnd: false,
    };
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  const device: DeviceClass = w < 768 ? "mobile" : w < 1280 ? "tablet" : "desktop";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  return {
    device,
    width: w,
    height: h,
    orientation: w >= h ? "landscape" : "portrait",
    touch: matchMedia("(pointer: coarse)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    isLowEnd: cores <= 4 && memory <= 2,
  };
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => read());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setInfo(read());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return info;
}
