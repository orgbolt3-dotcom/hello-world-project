/**
 * Design tokens — JS mirror of CSS custom properties.
 * Used in code that can't read CSS vars (framer-motion configs,
 * canvas/SVG, animation primitives). Keep in sync with styles.css.
 *
 * Phase 1/5 — Foundation + Tokens.
 * Phase 2/5 — Spacing + Typography.
 */

/* ----------------------------- Motion ----------------------------- */
export const duration = {
  instant: 0.08,
  fast: 0.16,
  base: 0.22,
  slow: 0.36,
  slower: 0.52,
} as const;

export const easing = {
  /** Apple-ish exit-and-arrive. Default for everything. */
  standard: [0.22, 1, 0.36, 1] as const,
  emphasized: [0.2, 0.9, 0.1, 1] as const,
  entrance: [0, 0, 0.2, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const spring = {
  /** Smooth, slightly damped. For pill/handle/sheet motions. */
  smooth: { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const,
  /** Soft, breathing. For ambient/idle. */
  soft: { type: "spring", stiffness: 220, damping: 26, mass: 1 } as const,
} as const;

/** Standard transitions — drop directly into framer-motion. */
export const motion = {
  fadeIn: { duration: duration.base, ease: easing.standard },
  riseIn: { duration: duration.slow, ease: easing.standard },
  pop: { duration: duration.fast, ease: easing.emphasized },
} as const;

/* ----------------------------- Icons ------------------------------ */
export const iconSize = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
} as const;
export const iconStroke = 1.6;

/* ----------------------------- Opacity ---------------------------- */
export const opacity = {
  veil: 0.04,
  soft: 0.08,
  medium: 0.16,
  strong: 0.28,
  solid: 0.56,
} as const;

/* --------------------------- Z-layer system ----------------------- */
/**
 * Predictable depth. Use these constants for inline `zIndex` (e.g.
 * framer-motion overlays, portals) instead of magic numbers.
 */
export const zLayer = {
  base: 0,
  content: 10,
  floating: 30,
  nav: 40,
  sheet: 50,
  modal: 60,
  overlay: 70,
  assistant: 80,
  toast: 90,
} as const;

/* ----------------------- Semantic accent keys --------------------- */
/**
 * Stable string keys for the ecosystem's accent families. Components
 * branch on these to pick the right CSS var (primary/warm/trust/intel).
 */
export type AccentKey = "primary" | "warm" | "trust" | "intelligence";

export const accent = {
  primary: { fg: "var(--primary)", soft: "var(--primary-soft)", glow: "var(--glow-soft)" },
  warm: { fg: "var(--warm)", soft: "var(--warm-soft)", glow: "var(--glow-warm)" },
  trust: { fg: "var(--trust)", soft: "var(--trust-soft)", glow: "var(--glow-trust)" },
  intelligence: {
    fg: "var(--intelligence)",
    soft: "var(--intelligence-soft)",
    glow: "var(--glow-soft)",
  },
} as const;

/* ------------------------ Surface ladder keys --------------------- */
/**
 * Semantic surface levels mirroring the CSS layered system.
 * Use via `var(--surface-{level})` or the Surface component.
 */
export type SurfaceLevel =
  | "base"
  | "sunken"
  | "elevated"
  | "floating"
  | "modal"
  | "overlay"
  | "assistant";

/* ----------------------------- Spacing ---------------------------- */
/** 4px-base spacing scale (rem strings). Mirror of --space-* vars. */
export const space = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;
export type SpaceKey = keyof typeof space;

/* --------------------------- Typography --------------------------- */
/** Type scale — rem strings, matches --text-* vars. */
export const fontSize = {
  "2xs": "0.6875rem",
  xs: "0.75rem",
  sm: "0.8125rem",
  base: "0.9375rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.375rem",
  "2xl": "1.75rem",
  "3xl": "2.25rem",
  "4xl": "3rem",
  "5xl": "3.75rem",
  "6xl": "4.5rem",
} as const;
export type FontSizeKey = keyof typeof fontSize;

export const lineHeight = {
  tightest: 1.02,
  tight: 1.12,
  snug: 1.28,
  normal: 1.55,
  relaxed: 1.7,
} as const;

export const tracking = {
  tightest: "-0.045em",
  tighter: "-0.035em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.04em",
  eyebrow: "0.2em",
} as const;

/** Semantic text roles. Map to text-{role} utilities in styles.css. */
export type TextRole =
  | "display-lg"
  | "display-md"
  | "display-sm"
  | "title-lg"
  | "title-md"
  | "title-sm"
  | "subtitle"
  | "body"
  | "body-strong"
  | "caption"
  | "meta";

/* -------------------------- Layout / Container -------------------- */
export const container = {
  xs: "22rem",
  sm: "28rem",
  md: "36rem",
  lg: "48rem",
  xl: "64rem",
  "2xl": "80rem",
} as const;
export type ContainerKey = keyof typeof container;

/** Mobile-first breakpoints (px). For matchMedia + JS-driven layouts. */
export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
