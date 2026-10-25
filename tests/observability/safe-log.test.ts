// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { logServerError } from "@/lib/safe-log.server";

describe("safe server logging", () => {
  it("redacts credentials and bounds logged messages", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    logServerError(
      "request.failed",
      new Error("Bearer abc.def.ghi password=hunter2 token=secret-value " + "x".repeat(2000)),
      {
        requestId: "req-123",
        method: "POST",
        path: "/api/private?token=visible",
        durationMs: -5,
      },
    );

    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]));
    const serialized = JSON.stringify(payload);

    expect(serialized).not.toContain("abc.def.ghi");
    expect(serialized).not.toContain("hunter2");
    expect(serialized).not.toContain("secret-value");
    expect(serialized).not.toContain("?token=visible");
    expect(payload.requestId).toBe("req-123");
    expect(payload.durationMs).toBe(0);
    expect(payload.error.message.length).toBeLessThanOrEqual(1000);

    spy.mockRestore();
  });
});
