/**
 * Cross-cutting constants. Keep small and domain-agnostic.
 */
export const APP_NAME = "Ecosystem";
export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
