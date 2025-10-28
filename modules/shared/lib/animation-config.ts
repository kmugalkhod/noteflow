/**
 * Animation Configuration Constants
 *
 * Centralized animation durations, easing functions, and presets
 * for consistent animations throughout the application
 */

/**
 * Standard animation durations in milliseconds
 * Based on Material Design and best practices
 */
export const ANIMATION_DURATIONS = {
  /** Instant - for prefers-reduced-motion */
  INSTANT: 0,
  /** Fast micro-interactions (hover, focus) - 100-150ms */
  FAST: 150,
  /** Standard transitions (modal, dropdown) - 200-250ms */
  NORMAL: 200,
  /** Slower transitions (large panels, drawers) - 300ms */
  SLOW: 300,
  /** Loading animations (indefinite loops) - 2s cycle */
  LOADING: 2000,
} as const;

/**
 * CSS cubic-bezier easing functions
 * Provides natural-feeling motion
 */
export const EASING_FUNCTIONS = {
  /** Linear - constant speed (use sparingly) */
  LINEAR: 'linear',
  /** Ease-in - slow start, accelerates */
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease-out - fast start, decelerates (best for entering elements) */
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Ease-in-out - slow start and end (best for state changes) */
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Sharp - quick, snappy interactions */
  SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
  /** Elastic - bounce effect (use sparingly for delight) */
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Animation presets for common use cases
 * Combines duration and easing for specific purposes
 */
export const ANIMATION_PRESETS = {
  // Entrance animations
  FADE_IN: {
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Fade in from transparent',
  },
  SLIDE_UP: {
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Slide up with fade',
  },
  SCALE_IN: {
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Scale up from small',
  },

  // Exit animations
  FADE_OUT: {
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Fade out to transparent',
  },
  SLIDE_DOWN: {
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Slide down with fade',
  },
  SCALE_OUT: {
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Scale down to small',
  },

  // Interaction animations
  HOVER: {
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Hover state transition',
  },
  PRESS: {
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.SHARP,
    description: 'Active/pressed state',
  },

  // Micro-interactions
  PULSE: {
    duration: ANIMATION_DURATIONS.SLOW,
    easing: EASING_FUNCTIONS.EASE_IN_OUT,
    description: 'Success pulse effect',
  },
  ELASTIC_BOUNCE: {
    duration: ANIMATION_DURATIONS.SLOW,
    easing: EASING_FUNCTIONS.ELASTIC,
    description: 'Elastic bounce on drop',
  },

  // Loading
  SHIMMER: {
    duration: ANIMATION_DURATIONS.LOADING,
    easing: EASING_FUNCTIONS.LINEAR,
    description: 'Skeleton shimmer effect',
  },
} as const;

/**
 * Tailwind CSS duration class mapping
 * Maps duration values to Tailwind classes
 */
export const DURATION_CLASSES = {
  [ANIMATION_DURATIONS.INSTANT]: 'duration-0',
  [ANIMATION_DURATIONS.FAST]: 'duration-150',
  [ANIMATION_DURATIONS.NORMAL]: 'duration-200',
  [ANIMATION_DURATIONS.SLOW]: 'duration-300',
  [ANIMATION_DURATIONS.LOADING]: 'duration-2000',
} as const;

/**
 * Tailwind CSS easing class mapping
 * Maps easing functions to Tailwind classes
 */
export const EASING_CLASSES = {
  [EASING_FUNCTIONS.LINEAR]: 'ease-linear',
  [EASING_FUNCTIONS.EASE_IN]: 'ease-in',
  [EASING_FUNCTIONS.EASE_OUT]: 'ease-out',
  [EASING_FUNCTIONS.EASE_IN_OUT]: 'ease-in-out',
  // Sharp and Elastic need custom classes
  [EASING_FUNCTIONS.SHARP]: 'ease-in-out', // Approximation
  [EASING_FUNCTIONS.ELASTIC]: 'ease-out', // Approximation
} as const;

/**
 * Helper function to get animation class string
 *
 * @param duration - Duration in ms
 * @param easing - Easing function
 * @returns Tailwind class string
 */
export function getAnimationClasses(
  duration: number = ANIMATION_DURATIONS.NORMAL,
  easing: string = EASING_FUNCTIONS.EASE_IN_OUT
): string {
  const durationClass = DURATION_CLASSES[duration as keyof typeof DURATION_CLASSES] || 'duration-200';
  const easingClass = EASING_CLASSES[easing as keyof typeof EASING_CLASSES] || 'ease-in-out';

  return `transition-all ${durationClass} ${easingClass}`;
}

/**
 * Skeleton loader threshold in milliseconds
 * Only show skeleton if loading exceeds this duration
 */
export const SKELETON_THRESHOLD_MS = 200;

/**
 * Interaction feedback threshold in milliseconds
 * Visual feedback should appear within this time
 */
export const INTERACTION_FEEDBACK_MS = 100;
