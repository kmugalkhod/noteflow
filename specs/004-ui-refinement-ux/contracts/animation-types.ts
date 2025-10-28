/**
 * Animation Types & Contracts
 *
 * TypeScript type definitions for animation state management,
 * configuration, and preference handling.
 */

/**
 * Animation preferences state (Zustand store)
 */
export interface AnimationPreferencesState {
  /**
   * System-level animation preference from prefers-reduced-motion media query
   */
  systemPrefersReducedMotion: boolean;

  /**
   * User's explicit preference override
   * - null: Use system preference
   * - true: Force disable animations
   * - false: Force enable animations
   */
  userPreference: boolean | null;

  /**
   * Computed value: Should animations be enabled?
   * Considers both system and user preferences
   */
  animationsEnabled: boolean;

  // Actions
  setSystemPreference: (value: boolean) => void;
  setUserPreference: (value: boolean | null) => void;
  toggleAnimations: () => void;
}

/**
 * Animation configuration for consistent timing and easing
 */
export interface AnimationConfig {
  /**
   * Duration in milliseconds
   */
  duration: number;

  /**
   * CSS cubic-bezier easing function
   */
  easing: string;

  /**
   * Optional delay before animation starts (ms)
   */
  delay?: number;

  /**
   * Whether to respect prefers-reduced-motion
   * @default true
   */
  respectMotionPreference?: boolean;
}

/**
 * Predefined animation durations (milliseconds)
 */
export const ANIMATION_DURATIONS = {
  /** Instant - for prefers-reduced-motion */
  INSTANT: 0,
  /** Fast micro-interactions (hover, focus) */
  FAST: 150,
  /** Standard transitions (modal, dropdown) */
  NORMAL: 200,
  /** Slower transitions (large panels, drawers) */
  SLOW: 300,
  /** Loading animations (indefinite loops) */
  LOADING: 2000,
} as const;

export type AnimationDuration = typeof ANIMATION_DURATIONS[keyof typeof ANIMATION_DURATIONS];

/**
 * Predefined easing functions (cubic-bezier)
 */
export const EASING_FUNCTIONS = {
  /** Linear - constant speed */
  LINEAR: 'linear',
  /** Ease-in - slow start */
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease-out - slow end (best for entering elements) */
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Ease-in-out - slow start and end */
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Sharp - quick, snappy */
  SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)',
  /** Elastic - bounce effect */
  ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export type EasingFunction = typeof EASING_FUNCTIONS[keyof typeof EASING_FUNCTIONS];

/**
 * Animation types for categorizing different animation purposes
 */
export type AnimationType =
  | 'entrance'       // Element appearing
  | 'exit'           // Element disappearing
  | 'transition'     // State change
  | 'hover'          // Mouse hover
  | 'focus'          // Keyboard focus
  | 'press'          // Click/touch
  | 'loading'        // Loading indicator
  | 'micro';         // Micro-interaction

/**
 * Animation preset combining duration, easing, and type
 */
export interface AnimationPreset {
  type: AnimationType;
  duration: AnimationDuration;
  easing: EasingFunction;
  description: string;
}

/**
 * Standard animation presets
 */
export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  // Entrance animations
  FADE_IN: {
    type: 'entrance',
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Fade in from transparent',
  },
  SLIDE_UP: {
    type: 'entrance',
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Slide up with fade',
  },
  SCALE_IN: {
    type: 'entrance',
    duration: ANIMATION_DURATIONS.NORMAL,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Scale up from small',
  },

  // Exit animations
  FADE_OUT: {
    type: 'exit',
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Fade out to transparent',
  },
  SLIDE_DOWN: {
    type: 'exit',
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Slide down with fade',
  },
  SCALE_OUT: {
    type: 'exit',
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_IN,
    description: 'Scale down to small',
  },

  // Interaction animations
  HOVER: {
    type: 'hover',
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.EASE_OUT,
    description: 'Hover state transition',
  },
  PRESS: {
    type: 'press',
    duration: ANIMATION_DURATIONS.FAST,
    easing: EASING_FUNCTIONS.SHARP,
    description: 'Active/pressed state',
  },

  // Micro-interactions
  PULSE: {
    type: 'micro',
    duration: ANIMATION_DURATIONS.SLOW,
    easing: EASING_FUNCTIONS.EASE_IN_OUT,
    description: 'Success pulse effect',
  },
  ELASTIC_BOUNCE: {
    type: 'micro',
    duration: ANIMATION_DURATIONS.SLOW,
    easing: EASING_FUNCTIONS.ELASTIC,
    description: 'Elastic bounce on drop',
  },

  // Loading
  SHIMMER: {
    type: 'loading',
    duration: ANIMATION_DURATIONS.LOADING,
    easing: EASING_FUNCTIONS.LINEAR,
    description: 'Skeleton shimmer effect',
  },
} as const;

/**
 * Hook return type for useAnimationState
 */
export interface UseAnimationStateReturn {
  /** Should animations be enabled? */
  animationsEnabled: boolean;
  /** Toggle animations on/off */
  toggleAnimations: () => void;
  /** Set explicit user preference */
  setUserPreference: (value: boolean | null) => void;
  /** Get Tailwind class with conditional animation */
  getAnimationClass: (animatedClass: string, fallbackClass?: string) => string;
}

/**
 * Hook return type for usePrefersReducedMotion
 */
export interface UsePrefersReducedMotionReturn {
  /** Does user/system prefer reduced motion? */
  prefersReducedMotion: boolean;
  /** Is the value loaded? (avoids SSR mismatch) */
  isLoaded: boolean;
}

/**
 * Transition props for animated components
 */
export interface TransitionProps {
  /** Duration in milliseconds */
  duration?: AnimationDuration;
  /** Easing function */
  easing?: EasingFunction;
  /** Delay before animation starts */
  delay?: number;
  /** Disable animation */
  disabled?: boolean;
}

/**
 * Animation class generator options
 */
export interface AnimationClassOptions {
  /** Base animation classes (when enabled) */
  animated: string;
  /** Fallback classes (when disabled) */
  static?: string;
  /** Force enable/disable (override preference) */
  force?: boolean;
}
