/**
 * Animation utility constants for consistent animations across the app
 * Provides duration, easing, and transition presets
 */

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
} as const;

export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export const TRANSITIONS = {
  // Standard transitions
  all: `all ${ANIMATION_DURATION.normal}ms ${ANIMATION_EASING.easeInOut}`,
  colors: `color ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeInOut}, background-color ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeInOut}, border-color ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeInOut}`,
  transform: `transform ${ANIMATION_DURATION.normal}ms ${ANIMATION_EASING.easeOut}`,
  opacity: `opacity ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeInOut}`,

  // Compound transitions
  fadeScale: `opacity ${ANIMATION_DURATION.normal}ms ${ANIMATION_EASING.easeOut}, transform ${ANIMATION_DURATION.normal}ms ${ANIMATION_EASING.easeOut}`,
  slideUp: `transform ${ANIMATION_DURATION.normal}ms ${ANIMATION_EASING.easeOut}, opacity ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeOut}`,

  // Specialized
  hover: `transform ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.spring}, box-shadow ${ANIMATION_DURATION.fast}ms ${ANIMATION_EASING.easeOut}`,
} as const;

/**
 * CSS class utility for smooth transitions
 */
export function getTransitionClass(type: keyof typeof TRANSITIONS = 'all'): string {
  return `transition-[${TRANSITIONS[type]}]`;
}

/**
 * Animation delay helpers
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): number {
  return index * baseDelay;
}

/**
 * Spring animation configuration for framer-motion (if needed)
 */
export const SPRING_CONFIGS = {
  default: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  },
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 14,
  },
  stiff: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
} as const;
