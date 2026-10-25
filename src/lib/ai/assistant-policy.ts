import type { AssistantRequest } from "@eco/core-contracts";

export const MAX_ASSISTANT_MESSAGES = 8;
export const MAX_ASSISTANT_MESSAGE_CHARS = 600;
export const MAX_ASSISTANT_INPUT_CHARS = 4_000;
export const MAX_ASSISTANT_OUTPUT_CHARS = 2_000;
export const MAX_SHARED_CACHE_ANSWER_CHARS = 2_000;

const SAFE_ROUTES = new Set([
  "/",
  "/flash",
  "/radar",
  "/espace",
  "/talents",
  "/profile",
  "/notifications",
]);

const SENSITIVE_PATTERNS = [
  /\b(?:mot de passe|password|code secret|code pin|cvv|otp)\b/i,
  /\b(?:seed phrase|phrase de recuperation|private key|cle privee)\b/i,
  /\b\d{13,19}\b/,
];

const PERSONAL_PATTERNS = [
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
  /(?:\+?237)?\s*[26]\d(?:[\s.-]*\d{2}){4}\b/,
  /\b(?:mon|ma|mes|moi|my|mine)\b/i,
  /\d{3,}/,
];

export function safeAssistantRoute(route: string | undefined): string | undefined {
  if (!route) return undefined;
  const normalized = route.split(/[?#]/, 1)[0]?.replace(/\/$/, "") || "/";
  return SAFE_ROUTES.has(normalized) ? normalized : undefined;
}

export function validateConversation(request: AssistantRequest): string | null {
  if (request.messages.length < 1 || request.messages.length > MAX_ASSISTANT_MESSAGES) {
    return "invalid_message_count";
  }
  let total = 0;
  for (let index = 0; index < request.messages.length; index += 1) {
    const message = request.messages[index]!;
    const content = message.content.trim();
    if (!content || content.length > MAX_ASSISTANT_MESSAGE_CHARS) return "invalid_message";
    if (index > 0 && message.role === request.messages[index - 1]!.role) {
      return "invalid_role_order";
    }
    total += content.length;
  }
  if (request.messages.at(-1)?.role !== "user" || total > MAX_ASSISTANT_INPUT_CHARS) {
    return "invalid_conversation";
  }
  return null;
}

export function containsSensitiveSecret(content: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(content));
}

export function isSharedCacheAnswerEligible(answer: string): boolean {
  return (
    answer.length >= 3 &&
    answer.length <= MAX_SHARED_CACHE_ANSWER_CHARS &&
    !containsSensitiveSecret(answer) &&
    !PERSONAL_PATTERNS.some((pattern) => pattern.test(answer))
  );
}

export function isSharedCacheEligible(question: string): boolean {
  return (
    question.length >= 3 &&
    question.length <= 300 &&
    !containsSensitiveSecret(question) &&
    !PERSONAL_PATTERNS.some((pattern) => pattern.test(question))
  );
}

export function classifyAssistantQuestion(
  question: string,
): "navigation" | "feature" | "account" | "safety" | "other" {
  if (/\b(?:ou|où|ouvrir|trouver|aller|page|onglet)\b/i.test(question)) return "navigation";
  if (/\b(?:compte|profil|inscri|connexion|identite)\b/i.test(question)) return "account";
  if (/\b(?:secur|fraude|abus|signaler|danger|confident)\b/i.test(question)) return "safety";
  if (/\b(?:flash|scan|radar|mission|notification|offline|hors ligne)\b/i.test(question))
    return "feature";
  return "other";
}
