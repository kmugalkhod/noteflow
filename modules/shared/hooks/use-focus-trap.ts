"use client";

import { useEffect, useRef } from "react";

/**
 * Focus Trap Hook
 *
 * Traps focus within a container element (useful for modals, dialogs).
 * Ensures Tab cycles through focusable elements within the container.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean = true
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !elementRef.current) return;

    const element = elementRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(element.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Focus first element when trap is activated
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return elementRef;
}

/**
 * Auto Focus Hook
 *
 * Automatically focuses an element when the component mounts.
 */
export function useAutoFocus<T extends HTMLElement>(
  enabled: boolean = true,
  delay: number = 0
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    if (delay > 0) {
      const timeout = setTimeout(() => {
        elementRef.current?.focus();
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      elementRef.current.focus();
    }
  }, [enabled, delay]);

  return elementRef;
}
