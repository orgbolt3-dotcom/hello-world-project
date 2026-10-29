import { describe, expect, it } from "vitest";
import type { FlashRecord } from "@eco/core-contracts";
import { searchSavedFlashes } from "@/domains/scan/model/search";

const now = 1000;
const flash = { id: "real-flash", authorId: "private-author", title: "Aide en couture", body: "private detail",
  kind: "offer", category: "professional", timeSlot: "today", areaLabel: "Douala", status: "live",
  createdAt: 100, updatedAt: 100, revision: 1, deletedAt: null, expiresAt: 2000, mediaIds: [] } as FlashRecord;
const criteria = { text: "couture", category: null, area: "Douala" };

describe("Scan documentation rules", () => {
  it("never invents matches when no actual Flashes exist", () => {
    expect(searchSavedFlashes([], criteria, now)).toEqual([]);
  });
  it("matches only the explicitly entered search and area", () => {
    expect(searchSavedFlashes([flash], criteria, now).map((r) => r.id)).toEqual(["real-flash"]);
    expect(searchSavedFlashes([flash], { ...criteria, text: "transport" }, now)).toEqual([]);
    expect(searchSavedFlashes([flash], { ...criteria, area: "Yaoundé" }, now)).toEqual([]);
  });
  it("respects the explicitly chosen category", () => {
    expect(searchSavedFlashes([flash], { ...criteria, category: "transport" }, now)).toEqual([]);
  });
  it("excludes closed, deleted and expired Flashes", () => {
    for (const patch of [{ status: "archived" }, { status: "draft" }, { deletedAt: 900 }, { expiresAt: now }]) {
      expect(searchSavedFlashes([{ ...flash, ...patch } as FlashRecord], criteria, now)).toEqual([]);
    }
  });
  it("does not invent missing public metadata or publication", () => {
    for (const patch of [{ category: undefined }, { kind: undefined }, { areaLabel: undefined },
      { timeSlot: undefined }, { expiresAt: null }, { revision: null }]) {
      expect(searchSavedFlashes([{ ...flash, ...patch }], criteria, now)).toEqual([]);
    }
  });
  it("projects only public preview fields, never private author or contact detail", () => {
    const [result] = searchSavedFlashes([flash], criteria, now);
    expect(result).toEqual({ id: "real-flash", title: "Aide en couture", kind: "offer", category: "professional",
      timeSlot: "today", areaLabel: "Douala", createdAt: 100, expiresAt: 2000 });
  });
});