/**
 * AI-ready foundation.
 *
 * Stable interface for the in-app assistant. Phase 1 ships a mock provider;
 * later phases plug in a real model behind the same shape.
 */

export interface AssistantContext {
  locale: string;
  route?: string;
  /** Lightweight signals the assistant may use (no PII). */
  hints?: Record<string, string | number | boolean>;
}

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AssistantProvider {
  ask(messages: AssistantMessage[], context: AssistantContext): Promise<AssistantMessage>;
}

const mockProvider: AssistantProvider = {
  async ask(messages) {
    const last = messages[messages.length - 1]?.content ?? "";
    return {
      role: "assistant",
      content: `(mock) Je t'ai entendu : « ${last.slice(0, 80)} »`,
    };
  },
};

let provider: AssistantProvider = mockProvider;

export function setAssistantProvider(p: AssistantProvider) {
  provider = p;
}

export function assistant() {
  return provider;
}
