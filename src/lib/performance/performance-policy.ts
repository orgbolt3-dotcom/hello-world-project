export const PERFORMANCE_BUDGETS = {
  lcpHealthyMs: 2500,
  lcpCriticalMs: 4000,
  inpHealthyMs: 200,
  inpCriticalMs: 500,
  clsHealthy: 0.1,
  clsCritical: 0.25,
  initialJavaScriptGzipKb: 250,
  initialCssGzipKb: 75,
  criticalResourcesGzipKb: 500,
  initialDocumentMs: 1500,
} as const;

export type PerformanceHealthLevel = "healthy" | "warning" | "critical";

export interface WebVitalsObservation {
  lcpMs: number;
  inpMs: number;
  cls: number;
}

export function classifyWebVitals(observation: WebVitalsObservation): PerformanceHealthLevel {
  const { lcpMs, inpMs, cls } = observation;

  if (
    !Number.isFinite(lcpMs) ||
    lcpMs < 0 ||
    !Number.isFinite(inpMs) ||
    inpMs < 0 ||
    !Number.isFinite(cls) ||
    cls < 0
  ) {
    throw new Error("Invalid Web Vitals observation.");
  }

  if (
    lcpMs > PERFORMANCE_BUDGETS.lcpCriticalMs ||
    inpMs > PERFORMANCE_BUDGETS.inpCriticalMs ||
    cls > PERFORMANCE_BUDGETS.clsCritical
  ) {
    return "critical";
  }

  if (
    lcpMs >= PERFORMANCE_BUDGETS.lcpHealthyMs ||
    inpMs >= PERFORMANCE_BUDGETS.inpHealthyMs ||
    cls >= PERFORMANCE_BUDGETS.clsHealthy
  ) {
    return "warning";
  }

  return "healthy";
}
