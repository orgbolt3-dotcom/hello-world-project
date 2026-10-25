import { describe, expect, it } from "vitest";
import {
  assistantCacheKey,
  normalizeAssistantText,
} from "@/domains/assistant/services/mapping.service";
import { safeAssistantRoute } from "@/lib/ai/assistant-policy";

describe("fondation Vitala", () => {
  it("normalise une question humaine de façon déterministe", () => {
    expect(normalizeAssistantText("  Où est l’ESPACE ?  ")).toBe("ou est l espace");
    expect(assistantCacheKey("Je cherche le Radar", "fr", 1)).toMatch(/^fr:1:/);
  });

  it("ne transmet à Vita que les routes explicitement autorisées", () => {
    expect(safeAssistantRoute("/flash?source=home")).toBe("/flash");
    expect(safeAssistantRoute("/admin/secrets")).toBeUndefined();
  });
});
