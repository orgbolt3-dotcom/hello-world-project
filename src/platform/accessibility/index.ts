/**
 * Accessibility foundation — reduced motion, contrast, focus utilities.
 */
export { useReducedMotion } from "@/lib/design/useReducedMotion";

export interface A11yPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export const defaultA11yPreferences: A11yPreferences = {
  reduceMotion: false,
  highContrast: false,
  largeText: false,
};
