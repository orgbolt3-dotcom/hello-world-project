import { describe, expect, it } from "vitest";
import { validateMutationPatch, type PublicFlash } from "@eco/core-contracts";

const publicKeys = [
  "areaLabel",
  "category",
  "createdAt",
  "expiresAt",
  "id",
  "kind",
  "timeSlot",
  "title",
] as const;

describe("public Flash feed contract", () => {
  it("contains only fields safe for visitors", () => {
    const row: PublicFlash = {
      id: "flash-1",
      kind: "need",
      category: "personal",
      title: "Besoin rapide",
      timeSlot: "now",
      areaLabel: "Centre",
      expiresAt: 2,
      createdAt: 1,
    };

    expect(Object.keys(row).sort()).toEqual([...publicKeys].sort());
    expect(row).not.toHaveProperty("body");
    expect(row).not.toHaveProperty("authorId");
    expect(row).not.toHaveProperty("latitude");
    expect(row).not.toHaveProperty("longitude");
  });

  it("keeps the response limit aligned with the Flash contract", () => {
    expect(validateMutationPatch("flashes", "update", { responseLimit: 12 })).toEqual({
      responseLimit: 12,
    });
    expect(() => validateMutationPatch("flashes", "update", { responseLimit: 13 })).toThrow();
  });
});
