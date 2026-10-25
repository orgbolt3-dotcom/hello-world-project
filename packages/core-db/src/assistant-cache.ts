import type { PromotedAssistantAnswer } from "@eco/core-contracts";
import { getDb } from "./schema";

export function listPromotedAssistantAnswers(
  locale: "fr" | "en",
): Promise<PromotedAssistantAnswer[]> {
  return getDb().assistantKnowledge.where("locale").equals(locale).toArray();
}

export async function savePromotedAssistantAnswer(answer: PromotedAssistantAnswer): Promise<void> {
  await getDb().assistantKnowledge.put(answer);
}

export async function savePromotedAssistantAnswers(
  answers: readonly PromotedAssistantAnswer[],
): Promise<void> {
  if (answers.length === 0) return;
  await getDb().assistantKnowledge.bulkPut([...answers]);
}
