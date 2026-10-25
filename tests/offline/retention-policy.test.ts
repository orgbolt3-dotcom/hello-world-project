// @vitest-environment node

import { describe, expect, it } from "vitest";
import { isOlderThanRetention, retentionCutoff } from "@/lib/maintenance/retention-policy";

describe("retention policy", () => {
  it("computes a deterministic cutoff", () => {
    expect(retentionCutoff(1_000_000, 2)).toBe(1_000_000 - 172_800_000);
  });

  it("keeps records exactly on the cutoff boundary", () => {
    const cutoff = retentionCutoff(1_000_000, 2);

    expect(isOlderThanRetention(cutoff, cutoff)).toBe(false);
    expect(isOlderThanRetention(cutoff - 1, cutoff)).toBe(true);
  });

  it("rejects invalid retention inputs", () => {
    expect(() => retentionCutoff(Number.NaN, 2)).toThrow();
    expect(() => retentionCutoff(1_000_000, -1)).toThrow();
  });

  it("does not classify invalid timestamps as expired", () => {
    expect(isOlderThanRetention(Number.NaN, 0)).toBe(false);
    expect(isOlderThanRetention(Number.POSITIVE_INFINITY, 0)).toBe(false);
  });
});
