"use client";

import { useAnimationState } from "../hooks/use-animation-state";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "rounded";
}

/**
 * Skeleton Loader Component
 *
 * Provides animated loading placeholders with shimmer effect.
 * Respects user animation preferences.
 */
export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  const { animationsEnabled } = useAnimationState();

  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-md",
    circular: "rounded-full",
    rounded: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "bg-muted/30",
        animationsEnabled && "animate-shimmer",
        variantClasses[variant],
        className
      )}
      aria-live="polite"
      aria-busy="true"
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  variant?: "text" | "rectangular" | "circular" | "rounded";
  spacing?: string;
}

/**
 * Skeleton Group Component
 *
 * Renders multiple skeleton items with consistent spacing
 */
export function SkeletonGroup({
  count = 3,
  className,
  itemClassName,
  variant = "text",
  spacing = "space-y-3",
}: SkeletonGroupProps) {
  return (
    <div className={cn(spacing, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} className={itemClassName} />
      ))}
    </div>
  );
}

/**
 * Note List Skeleton
 *
 * Specialized skeleton for note list items
 */
export function NoteListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-4 py-3 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Folder List Skeleton
 *
 * Specialized skeleton for folder tree items
 */
export function FolderListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-3 py-1.5 flex items-center gap-2">
          <Skeleton variant="circular" className="w-4 h-4 flex-shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-3 w-6" />
        </div>
      ))}
    </div>
  );
}

/**
 * Editor Skeleton
 *
 * Specialized skeleton for note editor
 */
export function EditorSkeleton() {
  return (
    <div className="h-full flex flex-col bg-editor-bg px-8 py-16 space-y-6">
      {/* Title skeleton */}
      <Skeleton className="h-12 w-2/3" />

      {/* Content skeletons */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
