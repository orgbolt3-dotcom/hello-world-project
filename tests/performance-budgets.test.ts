import { describe, expect, it } from "vitest";
import {
  assertPerformanceBudgets,
  type PerformanceBudgetResult,
} from "@/lib/performance/performance-budget-policy";

describe("performance budgets", () => {
  it("accepts measurements inside all budgets", () => {
    const result: PerformanceBudgetResult = {
      initialJavaScriptGzipKb: 100,
      initialCssGzipKb: 20,
      criticalResourcesGzipKb: 250,
    };

    expect(() => assertPerformanceBudgets(result)).not.toThrow();
  });

  it("rejects a critical JavaScript budget regression", () => {
    const result: PerformanceBudgetResult = {
      initialJavaScriptGzipKb: 251,
      initialCssGzipKb: 20,
      criticalResourcesGzipKb: 250,
    };

    expect(() => assertPerformanceBudgets(result)).toThrow(/initial JavaScript gzip/);
  });
});
