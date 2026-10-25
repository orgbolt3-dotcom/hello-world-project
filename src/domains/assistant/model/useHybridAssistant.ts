/**
 * Hybrid assistant: instant local answers first, then a streamed AI answer.
 * One conversation, kept on this device.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import type {
  AssistantFailure,
  AssistantMessage,
  PromotedAssistantAnswer,
} from "@eco/core-contracts";
import { listPromotedAssistantAnswers } from "@eco/core-db";
import { useI18n } from "@/lib/i18n/useI18n";
import { useNetworkStatus } from "@/lib/platform/useNetworkStatus";
import { useAuth } from "@/domains/auth";
import { searchLocalKnowledge } from "../services/localSearch.service";
import { AssistantStreamError, streamAssistant } from "../services/assistant-stream.service";

const LEGACY_STORAGE_KEY = "eco.assistant.conversation.v1";
const STORAGE_KEY_PREFIX = "eco.assistant.conversation.v2";

export function assistantConversationStorageKey(userId: string | null): string | null {
  if (!userId) return null;
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export interface HybridAssistantState {
  signedIn: boolean;
  authLoading: boolean;
  messages: AssistantMessage[];
  pending: boolean;
  streaming: boolean;
  failure: AssistantFailure | "offline" | null;
  send: (question: string) => Promise<void>;
  reset: () => void;
}

function persist(storageKey: string | null, messages: AssistantMessage[]) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40)));
  } catch {
    /* storage full or unavailable */
  }
}

export function useHybridAssistant(): HybridAssistantState {
  const { locale } = useI18n();
  const language = locale === "en" ? "en" : "fr";
  const online = useNetworkStatus().online;
  const { session, loading: authLoading } = useAuth();
  const token = session?.access_token ?? null;
  const userId = session?.user?.id ?? null;
  const storageKey = assistantConversationStorageKey(userId);
  const route = useRouterState({ select: (state) => state.location.pathname });
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [promoted, setPromoted] = useState<PromotedAssistantAnswer[]>([]);
  const [pending, setPending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [failure, setFailure] = useState<AssistantFailure | "offline" | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    setMessages([]);
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      if (!storageKey) return;
      const saved = localStorage.getItem(storageKey);
      if (saved) setMessages(JSON.parse(saved) as AssistantMessage[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, [storageKey]);

  useEffect(() => {
    let active = true;
    listPromotedAssistantAnswers(language)
      .then((answers) => active && setPromoted(answers))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [language]);

  const update = useCallback(
    (next: (current: AssistantMessage[]) => AssistantMessage[]) => {
      setMessages((current) => {
        const value = next(current);
        persist(storageKey, value);
        return value;
      });
    },
    [storageKey],
  );

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, 1200);
      if (!question || busy.current) return;
      busy.current = true;
      setFailure(null);

      const userMessage: AssistantMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };
      const history = [...messages, userMessage];
      update(() => history);

      const local = searchLocalKnowledge(question, language, promoted);
      if (local) {
        update((c) => [
          ...c,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: local.answer,
            source: local.source,
          },
        ]);
        busy.current = false;
        return;
      }

      if (!online) {
        setFailure("offline");
        busy.current = false;
        return;
      }
      if (!token) {
        setFailure("auth_required");
        busy.current = false;
        return;
      }

      setPending(true);
      const answerId = crypto.randomUUID();
      try {
        await streamAssistant(
          {
            locale: language,
            route,
            messages: history.slice(-10).map(({ role, content }) => ({ role, content })),
          },
          (text) => {
            setPending(false);
            setStreaming(true);
            setMessages((c) => {
              const exists = c.some((m) => m.id === answerId);
              return exists
                ? c.map((m) => (m.id === answerId ? { ...m, content: text } : m))
                : [...c, { id: answerId, role: "assistant", content: text, source: "gateway" }];
            });
          },
          token,
        );
        setMessages((c) => {
          persist(storageKey, c);
          return c;
        });
      } catch (error) {
        setFailure(error instanceof AssistantStreamError ? error.reason : "provider_error");
      } finally {
        setPending(false);
        setStreaming(false);
        busy.current = false;
      }
    },
    [language, messages, online, promoted, route, storageKey, token, update],
  );

  const reset = useCallback(() => {
    update(() => []);
    setFailure(null);
  }, [update]);

  return { signedIn: !!token, authLoading, messages, pending, streaming, failure, send, reset };
}
