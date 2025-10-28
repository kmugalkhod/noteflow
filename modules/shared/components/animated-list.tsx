"use client";

import { ReactNode } from "react";
import { useAnimationState } from "../hooks/use-animation-state";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number; // Delay between each item in ms
}

/**
 * Animated List Component
 *
 * Provides staggered fade-in animation for list items.
 * Respects user animation preferences.
 */
export function AnimatedList({
  children,
  className,
  itemClassName,
  staggerDelay = 30,
}: AnimatedListProps) {
  const { animationsEnabled } = useAnimationState();

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(itemClassName)}
          style={
            animationsEnabled
              ? {
                  animation: `slideUp 250ms cubic-bezier(0.0, 0, 0.2, 1) forwards`,
                  animationDelay: `${index * staggerDelay}ms`,
                  opacity: 0,
                }
              : undefined
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  delay?: number; // Custom delay in ms
}

/**
 * Animated List Item
 *
 * Individual animated list item that can be used standalone
 */
export function AnimatedListItem({
  children,
  className,
  delay = 0,
}: AnimatedListItemProps) {
  const { conditionalAnimationClass } = useAnimationState();

  return (
    <div
      className={cn(conditionalAnimationClass("", "animate-slide-up"), className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
