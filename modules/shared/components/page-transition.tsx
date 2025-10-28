"use client";

import { usePathname } from "next/navigation";
import { useAnimationState } from "../hooks/use-animation-state";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page Transition Wrapper
 *
 * Provides smooth fade-in transitions for page loads.
 * Respects user animation preferences via useAnimationState.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const { conditionalAnimationClass } = useAnimationState();

  return (
    <div className={cn(conditionalAnimationClass("", "animate-fade-in"), className)}>
      {children}
    </div>
  );
}
