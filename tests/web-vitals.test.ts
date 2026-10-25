import { describe, expect, it, vi } from "vitest";
import {
  getWebVitalsSnapshot,
  resetWebVitalsSnapshot,
  startWebVitalsMonitoring,
} from "@/lib/performance/web-vitals";

describe("real Web Vitals monitoring", () => {
  it("is browser-safe when PerformanceObserver is unavailable", () => {
    const original = globalThis.PerformanceObserver;
    Object.defineProperty(globalThis, "PerformanceObserver", {
      configurable: true,
      value: undefined,
    });

    const sink = vi.fn();
    expect(startWebVitalsMonitoring(sink)).toBeTypeOf("function");
    expect(sink).not.toHaveBeenCalled();

    Object.defineProperty(globalThis, "PerformanceObserver", {
      configurable: true,
      value: original,
    });
  });

  it("stores and emits valid observations", () => {
    resetWebVitalsSnapshot();
    const sink = vi.fn();

    const originalObserver = globalThis.PerformanceObserver;
    const observe = vi.fn();
    const disconnect = vi.fn();
    const Observer = class {
      constructor(private readonly callback: PerformanceObserverCallback) {}
      observe = observe;
      disconnect = disconnect;
    };

    Object.defineProperty(globalThis, "PerformanceObserver", {
      configurable: true,
      value: Observer,
    });

    const stop = startWebVitalsMonitoring(sink);
    expect(stop).toBeTypeOf("function");

    // Unsupported test doubles do not fabricate browser timing entries.
    expect(getWebVitalsSnapshot()).toEqual({});
    expect(sink).not.toHaveBeenCalled();

    stop();
    expect(disconnect).toHaveBeenCalledTimes(3);

    Object.defineProperty(globalThis, "PerformanceObserver", {
      configurable: true,
      value: originalObserver,
    });
  });
});
