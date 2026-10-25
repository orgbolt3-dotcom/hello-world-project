import { PERFORMANCE_BUDGETS } from "./performance-policy";

export interface PerformanceBudgetResult {
  initialJavaScriptGzipKb: number;
  initialCssGzipKb: number;
  criticalResourcesGzipKb: number;
}

export function assertPerformanceBudgets(result: PerformanceBudgetResult): void {
  const violations: string[] = [];

  if (result.initialJavaScriptGzipKb > PERFORMANCE_BUDGETS.initialJavaScriptGzipKb) {
    violations.push(
      `initial JavaScript gzip ${result.initialJavaScriptGzipKb.toFixed(1)} kB > ${PERFORMANCE_BUDGETS.initialJavaScriptGzipKb} kB`,
    );
  }

  if (result.initialCssGzipKb > PERFORMANCE_BUDGETS.initialCssGzipKb) {
    violations.push(
      `initial CSS gzip ${result.initialCssGzipKb.toFixed(1)} kB > ${PERFORMANCE_BUDGETS.initialCssGzipKb} kB`,
    );
  }

  if (result.criticalResourcesGzipKb > PERFORMANCE_BUDGETS.criticalResourcesGzipKb) {
    violations.push(
      `critical resources gzip ${result.criticalResourcesGzipKb.toFixed(1)} kB > ${PERFORMANCE_BUDGETS.criticalResourcesGzipKb} kB`,
    );
  }

  if (violations.length > 0) {
    throw new Error(`Performance budget exceeded: ${violations.join("; ")}`);
  }
}
