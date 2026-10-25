import dictionary from "@/data/vita-dictionary.json";

const combiningMarks = /[\u0300-\u036f]/g;
const punctuation = /[^a-z0-9\s]/g;

export function normalizeAssistantText(value: string): string {
  return value
    .normalize("NFD")
    .replace(combiningMarks, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(punctuation, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapAssistantVocabulary(value: string): string {
  let normalized = normalizeAssistantText(value);
  for (const [canonical, aliases] of Object.entries(dictionary.aliases)) {
    for (const alias of aliases) {
      const candidate = normalizeAssistantText(alias);
      if (candidate && normalized.includes(candidate)) {
        normalized = normalized.replaceAll(candidate, normalizeAssistantText(canonical));
      }
    }
  }
  const stopWords = new Set(dictionary.stopWords.map(normalizeAssistantText));
  return normalized
    .split(" ")
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .join(" ");
}

export function assistantCacheKey(question: string, locale: string, version: number): string {
  return `${locale}:${version}:${mapAssistantVocabulary(question)}`;
}
