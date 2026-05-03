import type { Variants } from "framer-motion";

// Cubic bezier presets — avoid default ease curves for polished feel
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuart = [0.25, 1, 0.5, 1] as const;

// ─── Left column ───────────────────────────────────────────────────────────

export const leftContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      // Badge starts at 0.15s; each child staggers from there
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
};

// Badge: fade + slight scale
export const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

// H1 lines: fade + y + subtle blur
export const h1LineVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    // Keep duration under 0.7s for text — longer reads as laggy on mobile
    transition: { duration: 0.65, ease: easeOutExpo },
  },
};

// Paragraph
export const paragraphVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutQuart },
  },
};

// CTA row container — staggers the two buttons
export const ctaContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.08,
    },
  },
};

export const ctaItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutQuart },
  },
};

// Stats row container
export const statsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.1,
    },
  },
};

export const statsItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutQuart },
  },
};

// ─── Right column (mockup) ─────────────────────────────────────────────────

export const mockupVariants: Variants = {
  hidden: {
    // Start at 0.4 opacity instead of 0 to preserve LCP signal.
    // The browser can still discover and prioritize the image resource
    // while the animation runs — full opacity:0 would delay LCP paint.
    opacity: 0.4,
    x: 40,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.9, delay: 0.2, ease: easeOutExpo },
  },
};

// ─── Reduced-motion overrides ──────────────────────────────────────────────
// Pass these as `variants` when useReducedMotion() returns true.
// Duration 0 means elements appear instantly without animation.

export const noMotionVariant: Variants = {
  hidden: { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" },
  visible: { opacity: 1, transition: { duration: 0 } },
};
