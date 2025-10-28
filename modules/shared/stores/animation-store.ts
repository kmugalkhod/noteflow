'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnimationPreferencesState {
  /**
   * System-level preference from prefers-reduced-motion media query
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
   */
  animationsEnabled: boolean;

  /**
   * Actions
   */
  setSystemPreference: (value: boolean) => void;
  setUserPreference: (value: boolean | null) => void;
  toggleAnimations: () => void;
}

/**
 * Global animation preferences store
 * Manages user and system preferences for animations
 * Persists to localStorage for consistent experience
 */
export const useAnimationStore = create<AnimationPreferencesState>()(
  persist(
    (set, get) => ({
      systemPrefersReducedMotion: false,
      userPreference: null,

      // Computed property getter
      get animationsEnabled() {
        const state = get();
        // User preference overrides system
        if (state.userPreference !== null) {
          return !state.userPreference;
        }
        // Otherwise, respect system preference
        return !state.systemPrefersReducedMotion;
      },

      setSystemPreference: (value: boolean) =>
        set({ systemPrefersReducedMotion: value }),

      setUserPreference: (value: boolean | null) =>
        set({ userPreference: value }),

      toggleAnimations: () => {
        const state = get();
        const currentlyEnabled = state.animationsEnabled;
        // Set user preference to opposite of current state
        set({ userPreference: currentlyEnabled });
      },
    }),
    {
      name: 'noteflow:animation-preference',
      // Only persist user preference, not system preference
      partialize: (state) => ({ userPreference: state.userPreference }),
    }
  )
);
