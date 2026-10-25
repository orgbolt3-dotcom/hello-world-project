// @vitest-environment node

import type { FailedMutation, OutboxEntry } from "@eco/core-contracts";
import { describe, expect, it } from "vitest";
import { getOfflineDiagnostics } from "@/platform/offline/diagnostics";

const now = 1_000_000;

function pending(id: string, mutatedAt: number): OutboxEntry {
  return {
    id,
    ownerId: "user-a",
    table: "posts",
    recordId: id,
    kind: "update",
    patch: {},
    mutatedAt,
    attempts: 1,
    lastAttemptAt: mutatedAt,
    lastError: null,
  };
}

function failed(id: string): FailedMutation {
  return {
    ...pending(id, now - 1000),
    failedAt: now - 500,
    failureCode: "permission_denied",
  };
}

describe("offline diagnostics", () => {
  it("reports pending count and age without exposing mutation data", () => {
    const result = getOfflineDiagnostics(
      [pending("one", now - 10_000), pending("two", now - 3_000)],
      [failed("failed")],
      now,
    );

    expect(result).toEqual({
      pendingCount: 2,
      oldestPendingAgeMs: 10_000,
      quarantinedCount: 1,
    });
    expect(JSON.stringify(result)).not.toContain("one");
    expect(JSON.stringify(result)).not.toContain("posts");
    expect(JSON.stringify(result)).not.toContain("user-a");
  });

  it("returns null age when there is nothing pending", () => {
    expect(getOfflineDiagnostics([], [], now)).toEqual({
      pendingCount: 0,
      oldestPendingAgeMs: null,
      quarantinedCount: 0,
    });
  });

  it("ignores invalid or future mutation timestamps", () => {
    const result = getOfflineDiagnostics(
      [pending("invalid", Number.NaN), pending("future", now + 5_000)],
      [],
      now,
    );

    expect(result.pendingCount).toBe(2);
    expect(result.oldestPendingAgeMs).toBeNull();
  });
});

describe("offline health thresholds", () => {
  it("is healthy when there is no backlog or quarantine", async () => {
    const { classifyOfflineHealth } = await import("@/platform/offline/diagnostics");

    expect(classifyOfflineHealth(0, null, 0)).toBe("healthy");
  });

  it("warns for pending work and at the warning boundary", async () => {
    const { classifyOfflineHealth, OFFLINE_WARNING_AGE_MS } =
      await import("@/platform/offline/diagnostics");

    expect(classifyOfflineHealth(1, 1_000, 0)).toBe("warning");
    expect(classifyOfflineHealth(0, OFFLINE_WARNING_AGE_MS, 0)).toBe("warning");
  });

  it("becomes critical at the critical boundary or with quarantine", async () => {
    const { classifyOfflineHealth, OFFLINE_CRITICAL_AGE_MS } =
      await import("@/platform/offline/diagnostics");

    expect(classifyOfflineHealth(0, OFFLINE_CRITICAL_AGE_MS, 0)).toBe("critical");
    expect(classifyOfflineHealth(0, null, 1)).toBe("critical");
  });

  it("rejects inconsistent diagnostic values", async () => {
    const { classifyOfflineHealth } = await import("@/platform/offline/diagnostics");

    expect(() => classifyOfflineHealth(-1, null, 0)).toThrow();
    expect(() => classifyOfflineHealth(0, -1, 0)).toThrow();
    expect(() => classifyOfflineHealth(0, null, -1)).toThrow();
    expect(() =>
      classifyOfflineHealth(0, null, 0, {
        warningAgeMs: 24,
        criticalAgeMs: 12,
      }),
    ).toThrow();
  });
});
