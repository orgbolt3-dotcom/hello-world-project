import { describe, expect, it } from "vitest";
import {
  CURRENT_ASSISTANT_CACHE_VERSION,
  PROMOTED_CACHE_TTL_MS,
  isPromotedAssistantAnswerFresh,
  searchLocalKnowledge,
} from "@/domains/assistant/services/localSearch.service";

const now = 1_800_000_000_000;

function promoted(
  overrides: Partial<{
    id: string;
    normalizedQuestion: string;
    answer: string;
    locale: "fr" | "en";
    category: string;
    version: number;
    updatedAt: number;
  }>,
) {
  return {
    id: "promoted-01",
    normalizedQuestion: "comment activer ma veille",
    answer: "Ouvre Radar puis active la veille.",
    locale: "fr" as const,
    category: "feature",
    version: CURRENT_ASSISTANT_CACHE_VERSION,
    updatedAt: now,
    ...overrides,
  };
}

describe("règles du cache local de Vita", () => {
  it("accepte une réponse promue fraîche et de la version courante", () => {
    expect(isPromotedAssistantAnswerFresh(promoted({}), now)).toBe(true);
  });

  it("refuse une réponse promue plus ancienne que le TTL", () => {
    expect(
      isPromotedAssistantAnswerFresh(promoted({ updatedAt: now - PROMOTED_CACHE_TTL_MS - 1 }), now),
    ).toBe(false);
  });

  it("refuse une réponse promue d'une version obsolète", () => {
    expect(
      isPromotedAssistantAnswerFresh(
        promoted({ version: CURRENT_ASSISTANT_CACHE_VERSION - 1 }),
        now,
      ),
    ).toBe(false);
  });

  it("refuse une date de mise à jour invalide ou future", () => {
    expect(isPromotedAssistantAnswerFresh(promoted({ updatedAt: Number.NaN }), now)).toBe(false);
    expect(isPromotedAssistantAnswerFresh(promoted({ updatedAt: now + 1 }), now)).toBe(false);
  });

  it("n'utilise pas une réponse promue obsolète pour répondre localement", () => {
    const result = searchLocalKnowledge("Comment activer ma veille ?", "fr", [
      promoted({ updatedAt: now - PROMOTED_CACHE_TTL_MS - 1 }),
    ]);

    expect(result?.entryId).toBe("radar-01");
    expect(result?.answer).not.toBe("Ouvre Radar puis active la veille.");
  });
});
