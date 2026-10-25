export type WebVitalName = "LCP" | "INP" | "CLS";

export interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  navigationType: string;
}

export type WebVitalsSink = (metric: WebVitalMetric) => void;

let latestMetrics: Partial<Record<WebVitalName, WebVitalMetric>> = {};

function record(metric: WebVitalMetric, sink: WebVitalsSink): void {
  if (!Number.isFinite(metric.value) || metric.value < 0) {
    return;
  }
  latestMetrics = { ...latestMetrics, [metric.name]: metric };
  sink(metric);
}

export function getWebVitalsSnapshot(): Partial<Record<WebVitalName, WebVitalMetric>> {
  return { ...latestMetrics };
}

export function resetWebVitalsSnapshot(): void {
  latestMetrics = {};
}

function navigationType(): string {
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return navigation?.type ?? "unknown";
}

export function startWebVitalsMonitoring(sink: WebVitalsSink): () => void {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return () => undefined;
  }

  const observers: PerformanceObserver[] = [];
  let stopped = false;

  const observe = (
    type: string,
    handler: (entries: PerformanceEntryList) => void,
    options?: PerformanceObserverInit,
  ) => {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!stopped) {
          handler(list.getEntries());
        }
      });
      observer.observe(options ? { type, ...options } : { type, buffered: true });
      observers.push(observer);
    } catch {
      // Unsupported PerformanceObserver entry types are ignored.
    }
  };

  let latestLcp = 0;
  observe("largest-contentful-paint", (entries) => {
    const entry = entries.at(-1);
    if (entry) {
      latestLcp = entry.startTime;
      record({ name: "LCP", value: latestLcp, navigationType: navigationType() }, sink);
    }
  });

  let clsValue = 0;
  let clsSessionValue = 0;
  let clsSessionStart = 0;
  let clsSessionLast = 0;

  observe("layout-shift", (entries) => {
    for (const entry of entries as PerformanceEntry[]) {
      const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
      if (shift.hadRecentInput || !Number.isFinite(shift.value)) {
        continue;
      }

      const timestamp = entry.startTime;
      if (
        clsSessionStart === 0 ||
        timestamp - clsSessionLast > 1_000 ||
        timestamp - clsSessionStart > 5_000
      ) {
        clsSessionStart = timestamp;
        clsSessionValue = 0;
      }

      clsSessionValue += shift.value ?? 0;
      clsSessionLast = timestamp;
      clsValue = Math.max(clsValue, clsSessionValue);
      record({ name: "CLS", value: clsValue, navigationType: navigationType() }, sink);
    }
  });

  let latestInp = 0;
  observe("event", (entries) => {
    for (const entry of entries as PerformanceEntry[]) {
      const event = entry as PerformanceEntry & {
        duration?: number;
        interactionId?: number;
      };
      if (!event.interactionId || !Number.isFinite(event.duration)) {
        continue;
      }
      latestInp = Math.max(latestInp, event.duration ?? 0);
      record({ name: "INP", value: latestInp, navigationType: navigationType() }, sink);
    }
  });

  const stop = () => {
    if (stopped) {
      return;
    }
    stopped = true;
    for (const observer of observers) {
      observer.disconnect();
    }
  };

  return stop;
}
