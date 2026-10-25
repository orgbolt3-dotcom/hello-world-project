/**
 * platform/ — Cross-application systems shared by all domains.
 * Phase 1 façade — concrete modules still live under src/lib/* and will
 * migrate progressively. New platform slots (pwa, monetization, analytics,
 * notifications, permissions, accessibility) are placeholders ready to grow.
 */
export * as ai from "./ai";
export * as realtime from "./realtime";
export * as offline from "./offline";
export * as pwa from "./pwa";
export * as trust from "./trust";
export * as monetization from "./monetization";
export * as analytics from "./analytics";
export * as i18n from "./internationalization";
export * as notifications from "./notifications";
export * as permissions from "./permissions";
export * as device from "./device";
export * as a11y from "./accessibility";
