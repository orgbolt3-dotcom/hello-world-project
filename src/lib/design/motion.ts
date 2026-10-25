/**
 * Motion system — Phase 3/5.
 *
 * Framer-motion variants + transitions that mirror the CSS motion
 * tokens in styles.css. Use these instead of hand-crafted easing
 * arrays so every animated surface breathes with the same rhythm.
 *
 * Naming:
 *  - `transition.*` — reusable `Transition` objects.
 *  - `variants.*`   — reusable `Variants` for `motion.*` components.
 *  - `presence.*`   — AnimatePresence-friendly enter/exit pairs.
 */

import type { Transition, Variants } from "framer-motion";
import { duration, easing, spring } from "./tokens";

/* ----------------------------- Easings ---------------------------- */
/** Cinematic — long elegant arrival. Pair with slow/slower duration. */
export const easeCinematic = [0.16, 1, 0.3, 1] as const;
export const easeSoftOut = [0.33, 1, 0.68, 1] as const;
export const easeSoftIn = [0.32, 0, 0.67, 0] as const;

/* --------------------------- Transitions -------------------------- */
export const transition = {
  /** Instant micro-feedback (focus ring, tap). */
  instant: { duration: duration.instant, ease: easing.standard },
  /** Fast — hover, tab switch, toggle. */
  fast: { duration: duration.fast, ease: easing.standard },
  /** Base — default page/card transition. */
  base: { duration: duration.base, ease: easing.standard },
  /** Slow — cinematic entrance (hero, modal). */
  slow: { duration: duration.slow, ease: easeCinematic },
  /** Slower — high-emphasis arrival. */
  slower: { duration: duration.slower, ease: easeCinematic },
  /** Soft spring — sheet handles, drag returns. */
  spring: spring.smooth,
  /** Breathing spring — ambient idle. */
  breathing: spring.soft,
} satisfies Record<string, Transition>;

/* --------------------------- Variants ----------------------------- */
/** Generic fade-in on mount. */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
  exit: { opacity: 0, transition: transition.fast },
};

/** Rise + fade — default for cards/sections entering the viewport. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
  exit: { opacity: 0, y: -6, transition: transition.fast },
};

/** Soft pop — chips, badges, FAB. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: transition.spring },
  exit: { opacity: 0, scale: 0.96, transition: transition.fast },
};

/** Bottom-sheet slide-up. */
export const sheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: transition.spring },
  exit: { y: "100%", transition: { duration: duration.base, ease: easeSoftIn } },
};

/** Modal — scale + fade, centered. */
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: transition.slow },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: transition.fast },
};

/** Page transition — wrap <Outlet/> for between-route continuity. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transition.base },
  exit: { opacity: 0, y: -4, transition: transition.fast },
};

/* --------------------------- Stagger ------------------------------ */
/**
 * Stagger container — drop on a parent <motion.div variants={…}>
 * and pair with `staggerItem` on each child.
 */
export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: transition.slow },
};

/* --------------------- Ambient / idle loops ----------------------- */
/**
 * Breathing — for AI bubbles, trust badges, presence dots.
 * Apply via `animate={breathingLoop}` on a motion element.
 */
export const breathingLoop = {
  scale: [1, 1.015, 1],
  opacity: [0.78, 1, 0.78],
  transition: {
    duration: 4.8,
    ease: easing.standard,
    repeat: Infinity,
  },
} as const;

/* --------------------------- Presence ----------------------------- */
/** Quick presets for AnimatePresence wrappers. */
export const presence = {
  fade: fadeVariants,
  rise: riseVariants,
  pop: popVariants,
  sheet: sheetVariants,
  modal: modalVariants,
  page: pageVariants,
} as const;
