'use client';

import { useEffect } from 'react';
import { useAnimationStore } from '../stores/animation-store';
import { usePrefersReducedMotion } from '../hooks/use-prefers-reduced-motion';

/**
 * Animation Preference Provider
 *
 * Detects system prefers-reduced-motion preference and syncs with global store
 * Should be mounted at app root to initialize animation preferences
 *
 * @param children - Child components
 */
export function AnimationPreferenceProvider({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion } = usePrefersReducedMotion();
  const setSystemPreference = useAnimationStore((state) => state.setSystemPreference);

  useEffect(() => {
    // Sync system preference with store
    setSystemPreference(prefersReducedMotion);
  }, [prefersReducedMotion, setSystemPreference]);

  return <>{children}</>;
}
