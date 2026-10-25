// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  classifyServiceHealth,
  SERVICE_HEALTH_CRITICAL_LATENCY_MS,
  SERVICE_HEALTH_WARNING_LATENCY_MS,
} from "@/lib/observability/health-policy";

describe("service health thresholds", () => {
  it("is healthy for a fast successful health response", () => {
    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: SERVICE_HEALTH_WARNING_LATENCY_MS - 1,
      }),
    ).toBe("healthy");
  });

  it("warns at the latency warning boundary", () => {
    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: SERVICE_HEALTH_WARNING_LATENCY_MS,
      }),
    ).toBe("warning");
  });

  it("warns for client errors or a slow response", () => {
    expect(
      classifyServiceHealth({
        httpStatus: 404,
        latencyMs: 50,
      }),
    ).toBe("warning");

    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: SERVICE_HEALTH_CRITICAL_LATENCY_MS - 1,
      }),
    ).toBe("warning");
  });

  it("becomes critical at the latency critical boundary or on server errors", () => {
    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: SERVICE_HEALTH_CRITICAL_LATENCY_MS,
      }),
    ).toBe("critical");

    expect(
      classifyServiceHealth({
        httpStatus: 503,
        latencyMs: 10,
      }),
    ).toBe("critical");
  });

  it("escalates offline critical state and preserves offline warning state", () => {
    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: 10,
        offlineLevel: "critical",
      }),
    ).toBe("critical");

    expect(
      classifyServiceHealth({
        httpStatus: 200,
        latencyMs: 10,
        offlineLevel: "warning",
      }),
    ).toBe("warning");
  });

  it("rejects invalid observations", () => {
    expect(() => classifyServiceHealth({ httpStatus: 99, latencyMs: 10 })).toThrow();
    expect(() => classifyServiceHealth({ httpStatus: 200, latencyMs: -1 })).toThrow();
    expect(() => classifyServiceHealth({ httpStatus: 200, latencyMs: Number.NaN })).toThrow();
  });
});
