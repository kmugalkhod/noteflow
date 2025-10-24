"use client";

import { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";

interface TransitionProps {
  /**
   * Whether the component should be shown
   */
  show: boolean;
  /**
   * Children to render
   */
  children: React.ReactNode;
  /**
   * Type of transition animation
   */
  type?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  /**
   * Duration in milliseconds
   */
  duration?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Delay before transition starts (in ms)
   */
  delay?: number;
  /**
   * Whether to unmount the component when hidden
   */
  unmountOnExit?: boolean;
}

/**
 * Transition wrapper component for smooth enter/exit animations
 * Provides CSS-based transitions for better performance
 */
export function Transition({
  show,
  children,
  type = 'fade',
  duration = 200,
  className,
  delay = 0,
  unmountOnExit = true,
}: TransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Start animation after a frame
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Remove from DOM after animation completes
      if (unmountOnExit) {
        timeoutRef.current = setTimeout(() => {
          setShouldRender(false);
        }, duration + delay);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, duration, delay, unmountOnExit]);

  if (!shouldRender && unmountOnExit) {
    return null;
  }

  const getTransitionClasses = () => {
    const base = `transition-all ease-out`;
    const durationClass = `duration-${duration}`;

    const enterClasses: Record<string, string> = {
      fade: 'opacity-100',
      scale: 'opacity-100 scale-100',
      'slide-up': 'opacity-100 translate-y-0',
      'slide-down': 'opacity-100 translate-y-0',
      'slide-left': 'opacity-100 translate-x-0',
      'slide-right': 'opacity-100 translate-x-0',
    };

    const exitClasses: Record<string, string> = {
      fade: 'opacity-0',
      scale: 'opacity-0 scale-95',
      'slide-up': 'opacity-0 translate-y-4',
      'slide-down': 'opacity-0 -translate-y-4',
      'slide-left': 'opacity-0 translate-x-4',
      'slide-right': 'opacity-0 -translate-x-4',
    };

    return cn(
      base,
      durationClass,
      isAnimating ? enterClasses[type] : exitClasses[type],
      delay && `delay-${delay}`,
      className
    );
  };

  return (
    <div
      className={getTransitionClasses()}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Fade transition - simple opacity animation
 */
export function FadeTransition(props: Omit<TransitionProps, 'type'>) {
  return <Transition {...props} type="fade" />;
}

/**
 * Scale transition - scale with fade
 */
export function ScaleTransition(props: Omit<TransitionProps, 'type'>) {
  return <Transition {...props} type="scale" />;
}

/**
 * Slide transitions - directional slides with fade
 */
export function SlideUpTransition(props: Omit<TransitionProps, 'type'>) {
  return <Transition {...props} type="slide-up" />;
}

export function SlideDownTransition(props: Omit<TransitionProps, 'type'>) {
  return <Transition {...props} type="slide-down" />;
}
