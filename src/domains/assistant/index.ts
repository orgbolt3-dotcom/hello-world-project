export const ASSISTANT_DOMAIN = "assistant" as const;
export * from "@/platform/ai";
export { useHybridAssistant, type HybridAssistantState } from "./model/useHybridAssistant";
export { AssistantTab } from "./ui/AssistantTab";
