'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect user's motion preference from system settings
 * Respects prefers-reduced-motion media query for accessibility
 *
 * @returns {Object} Motion preference state
 * @returns {boolean} prefersReducedMotion - Whether user prefers reduced motion
 * @returns {boolean} isLoaded - Whether the preference has been loaded (prevents SSR mismatch)
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    setIsLoaded(true);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return { prefersReducedMotion, isLoaded };
}
