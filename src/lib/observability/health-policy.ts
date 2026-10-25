import type { OfflineHealthLevel } from "@/platform/offline/diagnostics";

export const SERVICE_HEALTH_WARNING_LATENCY_MS = 500;
export const SERVICE_HEALTH_CRITICAL_LATENCY_MS = 2_000;

export type ServiceHealthLevel = "healthy" | "warning" | "critical";

export interface HealthObservation {
  httpStatus: number;
  latencyMs: number;
  offlineLevel?: OfflineHealthLevel;
}

export function classifyServiceHealth(observation: HealthObservation): ServiceHealthLevel {
  const { httpStatus, latencyMs, offlineLevel = "healthy" } = observation;

  if (
    !Number.isInteger(httpStatus) ||
    httpStatus < 100 ||
    httpStatus > 599 ||
    !Number.isFinite(latencyMs) ||
    latencyMs < 0
  ) {
    throw new Error("Invalid service health observation.");
  }

  if (httpStatus >= 500 || offlineLevel === "critical") {
    return "critical";
  }

  if (
    offlineLevel === "warning" ||
    httpStatus >= 400 ||
    latencyMs >= SERVICE_HEALTH_WARNING_LATENCY_MS
  ) {
    return latencyMs >= SERVICE_HEALTH_CRITICAL_LATENCY_MS ? "critical" : "warning";
  }

  return "healthy";
}
