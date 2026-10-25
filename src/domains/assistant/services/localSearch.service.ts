import Fuse from "fuse.js";
import knowledge from "@/data/knowledge.json";
import type {
  AssistantKnowledgeEntry,
  LocalKnowledgeMatch,
  PromotedAssistantAnswer,
} from "@eco/core-contracts";
import { mapAssistantVocabulary, normalizeAssistantText } from "./mapping.service";

const MIN_FUZZY_CONFIDENCE = 0.72;
export const CURRENT_ASSISTANT_CACHE_VERSION = 1;
export const PROMOTED_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const entries = knowledge.entries as AssistantKnowledgeEntry[];

interface SearchDocument {
  entry: AssistantKnowledgeEntry;
  searchable: string;
  exactQuestions: string[];
  keywords: string[];
}

const documents: SearchDocument[] = entries.map((entry) => ({
  entry,
  exactQuestions: entry.questions.map(normalizeAssistantText),
  keywords: entry.keywords.map(mapAssistantVocabulary),
  searchable: mapAssistantVocabulary(
    [...entry.questions, ...entry.keywords, entry.category].join(" "),
  ),
}));

const fuse = new Fuse(documents, {
  keys: [{ name: "searchable", weight: 1 }],
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
  threshold: 1 - MIN_FUZZY_CONFIDENCE,
  shouldSort: true,
});

export function isPromotedAssistantAnswerFresh(
  answer: PromotedAssistantAnswer,
  now: number = Date.now(),
): boolean {
  if (answer.version !== CURRENT_ASSISTANT_CACHE_VERSION) return false;
  if (!Number.isFinite(answer.updatedAt) || answer.updatedAt <= 0) return false;
  const age = now - answer.updatedAt;
  return age >= 0 && age <= PROMOTED_CACHE_TTL_MS;
}

export function searchLocalKnowledge(
  question: string,
  locale: "fr" | "en" = "fr",
  promoted: readonly PromotedAssistantAnswer[] = [],
): LocalKnowledgeMatch | null {
  const exact = normalizeAssistantText(question);
  if (!exact) return null;

  const promotedMatch = promoted.find(
    (item) =>
      item.locale === locale &&
      item.normalizedQuestion === exact &&
      isPromotedAssistantAnswerFresh(item),
  );
  if (promotedMatch) {
    return {
      answer: promotedMatch.answer,
      entryId: promotedMatch.id,
      confidence: 1,
      source: "local_exact",
    };
  }

  const exactMatch = documents.find(
    (document) => document.entry.locale === locale && document.exactQuestions.includes(exact),
  );
  if (exactMatch) {
    return {
      answer: exactMatch.entry.answer,
      entryId: exactMatch.entry.id,
      confidence: 1,
      source: "local_exact",
    };
  }

  const query = mapAssistantVocabulary(question);
  if (!query) return null;
  const queryWords = new Set(query.split(" "));
  const keywordMatch = documents.find((document) => {
    if (document.entry.locale !== locale) return false;
    const matches = document.keywords.filter((keyword) =>
      keyword.split(" ").every((word) => queryWords.has(word)),
    ).length;
    return matches >= Math.min(2, document.keywords.length);
  });
  if (keywordMatch) {
    return {
      answer: keywordMatch.entry.answer,
      entryId: keywordMatch.entry.id,
      confidence: 0.9,
      source: "local_exact",
    };
  }
  const match = fuse.search(query).find((result) => result.item.entry.locale === locale);
  if (!match) return null;
  const confidence = Math.max(0, Math.min(1, 1 - (match.score ?? 1)));
  if (confidence < MIN_FUZZY_CONFIDENCE) return null;
  return {
    answer: match.item.entry.answer,
    entryId: match.item.entry.id,
    confidence,
    source: "local_fuzzy",
  };
}

export { MIN_FUZZY_CONFIDENCE };
