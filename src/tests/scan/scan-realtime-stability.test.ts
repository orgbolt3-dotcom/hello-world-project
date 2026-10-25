import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Scan realtime lifecycle", () => {
  it("keeps the latest query in a ref and cleans the subscription", () => {
    const hook = readFileSync(resolve("src/domains/scan/hooks/useScan.ts"), "utf8");
    expect(hook).toContain("queryRef.current = query");
    expect(hook).toContain("subscribeToFlashChanges");
    expect(hook).toContain("[execute]");
    expect(hook).toContain("inFlightRef.current");
  });

  it("removes the Supabase channel during cleanup", () => {
    const service = readFileSync(
      resolve("src/domains/scan/services/scan-realtime.service.ts"),
      "utf8",
    );
    expect(service).toContain("supabase.removeChannel(channel)");
  });
});
