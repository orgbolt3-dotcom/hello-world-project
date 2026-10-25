export type AssistantRole = "user" | "assistant";
export type AssistantSource =
  | "local_exact"
  | "local_fuzzy"
  | "promoted_cache"
  | "gateway"
  | "offline_fallback";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  source?: AssistantSource;
}

export interface AssistantKnowledgeEntry {
  id: string;
  locale: "fr" | "en";
  questions: string[];
  keywords: string[];
  answer: string;
  category: string;
  version: number;
}

export interface AssistantRequest {
  requestId: string;
  locale: "fr" | "en";
  route?: string;
  messages: Pick<AssistantMessage, "role" | "content">[];
}

export type AssistantFailure =
  | "auth_required"
  | "rate_limited"
  | "daily_limit"
  | "unavailable"
  | "invalid_request"
  | "unsafe_request"
  | "provider_error";

export type AssistantResult =
  | {
      ok: true;
      content: string;
      source: "promoted_cache" | "gateway";
      requestId: string;
      promoted?: PromotedAssistantAnswer;
    }
  | { ok: false; reason: AssistantFailure; requestId: string };

export interface LocalKnowledgeMatch {
  answer: string;
  entryId: string;
  confidence: number;
  source: "local_exact" | "local_fuzzy";
}

export interface PromotedAssistantAnswer {
  id: string;
  normalizedQuestion: string;
  answer: string;
  locale: "fr" | "en";
  category: string;
  version: number;
  updatedAt: number;
}
