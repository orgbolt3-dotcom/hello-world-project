import { useEffect, useState } from "react";

/**
 * useReducedMotion — graceful degradation hook.
 *
 * Returns `true` when the user (or OS) requests reduced motion.
 * Components should branch on this to skip decorative loops,
 * shorten transitions, or swap motion variants for static ones.
 *
 *   const reduced = useReducedMotion();
 *   <motion.div animate={reduced ? undefined : breathingLoop} />
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
