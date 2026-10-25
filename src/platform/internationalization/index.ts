/**
 * Internationalization façade. Current implementation: lightweight in-house
 * dictionary in src/lib/i18n. API stays compatible with a future i18next swap.
 */
export { useI18n } from "@/lib/i18n/useI18n";
export type { MessageKey } from "@/lib/i18n/messages";
