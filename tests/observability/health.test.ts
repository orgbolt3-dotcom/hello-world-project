// @vitest-environment node

import { describe, expect, it } from "vitest";
import { healthResponse } from "@/routes/api/health";

describe("health endpoint", () => {
  it("returns a non-cached, dependency-free healthy response", async () => {
    const response = healthResponse();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      service: "vitala",
    });
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});
