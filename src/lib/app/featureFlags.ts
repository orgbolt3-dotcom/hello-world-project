/**
 * Scalable feature-flag registry. Domains gate features through this map
 * so we can roll modules in/out without touching call-sites.
 */

export type FeatureKey =
  | "flash"
  | "radar"
  | "scan"
  | "trust"
  | "profile"
  | "referral"
  | "trustNetwork"
  | "assistant"
  | "knowledge"
  | "creator"
  | "wallet"
  | "spaces"
  | "feed"
  | "search"
  | "recommendations"
  | "realtime"
  | "offline"
  | "pwa"
  | "multiDevice"
  | "admin"
  | "analytics"
  | "a11y"
  | "designSystem"
  | "i18n";

export const features: Record<FeatureKey, boolean> = {
  flash: true,
  radar: true,
  scan: true,
  trust: true,
  profile: true,
  referral: true,
  trustNetwork: true,
  assistant: true,
  knowledge: true,
  creator: true,
  wallet: true,
  spaces: true,
  feed: true,
  search: true,
  recommendations: true,
  realtime: true,
  offline: true,
  pwa: true,
  multiDevice: true,
  admin: false,
  analytics: true,
  a11y: true,
  designSystem: true,
  i18n: true,
};

export const isEnabled = (k: FeatureKey) => features[k];
