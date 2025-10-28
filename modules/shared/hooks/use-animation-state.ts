'use client';

import { useAnimationStore } from '../stores/animation-store';
import { cn } from '@/lib/utils';

/**
 * Hook to access animation state and conditionally apply animation classes
 *
 * @returns Animation state and helper functions
 */
export function useAnimationState() {
  const animationsEnabled = useAnimationStore((state) => state.animationsEnabled);
  const toggleAnimations = useAnimationStore((state) => state.toggleAnimations);
  const setUserPreference = useAnimationStore((state) => state.setUserPreference);

  /**
   * Get animation class string conditionally based on animation state
   *
   * @param animatedClass - Class to apply when animations are enabled
   * @param fallbackClass - Optional class to apply when animations are disabled
   * @returns Conditional class string
   */
  const getAnimationClass = (animatedClass: string, fallbackClass: string = '') => {
    return animationsEnabled ? animatedClass : fallbackClass;
  };

  /**
   * Conditionally apply animation classes using cn utility
   *
   * @param baseClasses - Base classes always applied
   * @param animatedClasses - Classes only applied when animations enabled
   * @returns Combined class string
   */
  const conditionalAnimationClass = (baseClasses: string, animatedClasses: string) => {
    return cn(baseClasses, animationsEnabled && animatedClasses);
  };

  return {
    animationsEnabled,
    toggleAnimations,
    setUserPreference,
    getAnimationClass,
    conditionalAnimationClass,
  };
}
