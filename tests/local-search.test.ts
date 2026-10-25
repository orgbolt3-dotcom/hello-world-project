import { describe, expect, it } from "vitest";
import {
  MIN_FUZZY_CONFIDENCE,
  searchLocalKnowledge,
} from "@/domains/assistant/services/localSearch.service";

describe("connaissance locale de Vita", () => {
  it("répond exactement hors ligne à une question connue", () => {
    const result = searchLocalKnowledge("Qu'est-ce que Vitala ?", "fr");

    expect(result).toMatchObject({
      entryId: "about-01",
      confidence: 1,
      source: "local_exact",
    });
    expect(result?.answer.length).toBeGreaterThan(20);
  });

  it("utilise une réponse promue avant la recherche fuzzy", () => {
    const result = searchLocalKnowledge("Comment activer ma veille ?", "fr", [
      {
        id: "promoted-01",
        normalizedQuestion: "comment activer ma veille",
        answer: "Ouvre Radar puis active la veille.",
        locale: "fr",
        category: "feature",
        version: 1,
        updatedAt: Date.now(),
      },
    ]);

    expect(result?.entryId).toBe("promoted-01");
    expect(result?.source).toBe("local_exact");
  });

  it("ne répond pas à une question vide", () => {
    expect(searchLocalKnowledge("   ", "fr")).toBeNull();
    expect(MIN_FUZZY_CONFIDENCE).toBeGreaterThanOrEqual(0.7);
  });
});
