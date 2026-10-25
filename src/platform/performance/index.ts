/**
 * platform/performance — lightweight web-vitals sampling.
 * Observes paint/layout metrics when the browser supports it; no-op on SSR.
 */
export function startWebVitals() {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;

  const observe = (type: string, handler: (entry: PerformanceEntry) => void) => {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) handler(entry);
      });
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
      return observer;
    } catch {
      return null;
    }
  };

  observe("largest-contentful-paint", (entry) => {
    window.dispatchEvent(
      new CustomEvent("eco:web-vital", { detail: { name: "LCP", value: entry.startTime } }),
    );
  });

  observe("layout-shift", (entry) => {
    const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
    if (shift.hadRecentInput) return;
    window.dispatchEvent(
      new CustomEvent("eco:web-vital", { detail: { name: "CLS", value: shift.value ?? 0 } }),
    );
  });
}
