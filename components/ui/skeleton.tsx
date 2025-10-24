import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the skeleton. Can be a percentage, pixel value, or Tailwind class
   */
  width?: string | number;
  /**
   * Height of the skeleton. Can be a percentage, pixel value, or Tailwind class
   */
  height?: string | number;
  /**
   * Variant of the skeleton animation
   */
  variant?: 'pulse' | 'wave' | 'none';
  /**
   * Shape of the skeleton
   */
  shape?: 'rectangle' | 'circle' | 'rounded';
}

/**
 * Skeleton loader component for loading states
 * Provides smooth, professional loading animations
 */
function Skeleton({
  className,
  width,
  height,
  variant = 'pulse',
  shape = 'rounded',
  ...props
}: SkeletonProps) {
  const shapeClasses = {
    rectangle: 'rounded-none',
    circle: 'rounded-full',
    rounded: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={cn(
        "bg-muted",
        shapeClasses[shape],
        animationClasses[variant],
        className
      )}
      style={style}
      {...props}
    />
  )
}

/**
 * Skeleton text loader - simulates text lines
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? "80%" : "100%"}
          className="w-full"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton card loader - simulates a card component
 */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 space-y-3", className)}>
      <Skeleton height={20} width="60%" />
      <SkeletonText lines={2} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard }
