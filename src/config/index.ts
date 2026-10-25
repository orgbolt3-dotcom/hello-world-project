/**
 * config/ — Static configuration (feature flags, env-driven constants).
 * Phase 2 façade.
 */
export { features, isEnabled, type FeatureKey } from "@/lib/app/featureFlags";
export { APP_NAME, SUPPORTED_LOCALES, type SupportedLocale } from "@/shared/constants";
export { getClientEnvironment, type ClientEnvironment } from "./env.public";
