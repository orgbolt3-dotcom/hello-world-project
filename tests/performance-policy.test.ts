import { describe, expect, it } from "vitest";
import { classifyWebVitals, PERFORMANCE_BUDGETS } from "@/lib/performance/performance-policy";

describe("performance policy", () => {
  it("keeps the healthy Web Vitals budgets explicit", () => {
    expect(PERFORMANCE_BUDGETS).toMatchObject({
      lcpHealthyMs: 2500,
      inpHealthyMs: 200,
      clsHealthy: 0.1,
    });
  });

  it("classifies an observation inside the healthy budgets", () => {
    expect(
      classifyWebVitals({
        lcpMs: 1800,
        inpMs: 120,
        cls: 0.05,
      }),
    ).toBe("healthy");
  });

  it("classifies the healthy boundaries as warning", () => {
    expect(
      classifyWebVitals({
        lcpMs: 2500,
        inpMs: 200,
        cls: 0.1,
      }),
    ).toBe("warning");
  });

  it("classifies a critical Web Vital over the critical threshold", () => {
    expect(
      classifyWebVitals({
        lcpMs: 4001,
        inpMs: 120,
        cls: 0.05,
      }),
    ).toBe("critical");
  });

  it("rejects invalid observations", () => {
    expect(() =>
      classifyWebVitals({
        lcpMs: -1,
        inpMs: 120,
        cls: 0.05,
      }),
    ).toThrow("Invalid Web Vitals observation.");
  });
});
