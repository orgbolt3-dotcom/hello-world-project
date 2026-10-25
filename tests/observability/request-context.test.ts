// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import {
  getRequestContext,
  requestDurationMs,
  withRequestContext,
} from "@/lib/request-context.server";

describe("request correlation", () => {
  it("preserves a bounded incoming request id", () => {
    const request = new Request("https://example.test/api/health", {
      headers: { "x-request-id": "req-123" },
    });

    expect(getRequestContext(request)).toMatchObject({
      requestId: "req-123",
      method: "GET",
      path: "/api/health",
    });
  });

  it("replaces an oversized incoming request id", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "generated-id" });
    const request = new Request("https://example.test/", {
      headers: { "x-request-id": "x".repeat(129) },
    });

    expect(getRequestContext(request).requestId).toBe("generated-id");
  });

  it("echoes the correlation id without changing the response", () => {
    const response = withRequestContext(new Response("ok", { status: 200 }), {
      requestId: "req-123",
      method: "GET",
      path: "/",
      startedAt: Date.now(),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req-123");
  });

  it("never reports a negative request duration", () => {
    const now = Date.now();
    expect(
      requestDurationMs({
        requestId: "req-123",
        method: "GET",
        path: "/",
        startedAt: now + 10_000,
      }),
    ).toBe(0);
  });
});
