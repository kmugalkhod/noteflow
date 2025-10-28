/**
 * Loading State Types & Contracts
 *
 * TypeScript type definitions for loading states, skeleton loaders,
 * and async operation tracking.
 */

/**
 * Basic loading state for a single async operation
 */
export interface LoadingState<T = unknown> {
  /** Is the operation currently loading? */
  isLoading: boolean;
  /** Error if operation failed */
  error: Error | null;
  /** Data if operation succeeded */
  data: T | null;
}

/**
 * Extended loading state with metadata
 */
export interface ExtendedLoadingState<T = unknown> extends LoadingState<T> {
  /** Timestamp when loading started */
  startTime: number | null;
  /** Should skeleton be displayed? (delayed threshold) */
  showSkeleton: boolean;
  /** Operation label/description */
  label?: string;
}

/**
 * Loading state phases
 */
export type LoadingPhase =
  | 'idle'        // Not yet started
  | 'pending'     // Loading just started (< 200ms)
  | 'loading'     // Loading with skeleton visible (> 200ms)
  | 'success'     // Loaded successfully
  | 'error';      // Failed with error

/**
 * Async operation state with phase tracking
 */
export interface AsyncOperationState<T = unknown> {
  phase: LoadingPhase;
  data: T | null;
  error: Error | null;
  startTime: number | null;
  endTime: number | null;
}

/**
 * Loading state registry for tracking multiple operations
 */
export interface LoadingStateRegistry {
  [operationId: string]: {
    isLoading: boolean;
    startTime: number;
    label: string;
  };
}

/**
 * Global loading store interface (Zustand)
 */
export interface LoadingStore {
  /** Registry of all active loading operations */
  operations: LoadingStateRegistry;

  /** Start tracking a loading operation */
  startLoading: (id: string, label: string) => void;

  /** Stop tracking a loading operation */
  stopLoading: (id: string) => void;

  /** Is any operation currently loading? */
  isAnyLoading: boolean;

  /** Get specific operation state */
  getOperation: (id: string) => LoadingStateRegistry[string] | undefined;

  /** Clear all completed operations */
  clearCompleted: () => void;
}

/**
 * Skeleton loader variant types
 */
export type SkeletonVariant =
  | 'text'        // Single line of text
  | 'paragraph'   // Multiple lines of text
  | 'heading'     // Heading text
  | 'card'        // Full card with multiple elements
  | 'avatar'      // Circular avatar
  | 'thumbnail'   // Square/rectangular image
  | 'button'      // Button shape
  | 'input'       // Input field shape
  | 'custom';     // Custom dimensions

/**
 * Skeleton loader configuration
 */
export interface SkeletonConfig {
  /** Variant type */
  variant: SkeletonVariant;
  /** Number of items to render */
  count?: number;
  /** Width (CSS value or Tailwind class) */
  width?: string;
  /** Height (CSS value or Tailwind class) */
  height?: string;
  /** Custom className */
  className?: string;
  /** Animate shimmer effect */
  animate?: boolean;
}

/**
 * Predefined skeleton dimensions
 */
export const SKELETON_SIZES = {
  TEXT_SM: { height: 'h-4', width: 'w-full' },
  TEXT_BASE: { height: 'h-5', width: 'w-full' },
  TEXT_LG: { height: 'h-6', width: 'w-full' },
  HEADING_SM: { height: 'h-6', width: 'w-3/4' },
  HEADING_BASE: { height: 'h-8', width: 'w-2/3' },
  HEADING_LG: { height: 'h-10', width: 'w-1/2' },
  AVATAR_SM: { height: 'h-8', width: 'w-8', rounded: 'rounded-full' },
  AVATAR_MD: { height: 'h-10', width: 'w-10', rounded: 'rounded-full' },
  AVATAR_LG: { height: 'h-12', width: 'w-12', rounded: 'rounded-full' },
  BUTTON_SM: { height: 'h-8', width: 'w-20' },
  BUTTON_MD: { height: 'h-10', width: 'w-24' },
  BUTTON_LG: { height: 'h-12', width: 'w-32' },
  CARD: { height: 'h-32', width: 'w-full' },
  THUMBNAIL: { height: 'h-24', width: 'w-24' },
  INPUT: { height: 'h-10', width: 'w-full' },
} as const;

/**
 * Skeleton loader threshold (ms before displaying skeleton)
 */
export const SKELETON_THRESHOLD_MS = 200;

/**
 * Hook return type for useLoadingState
 */
export interface UseLoadingStateReturn<T = unknown> {
  /** Current loading state */
  state: LoadingState<T>;
  /** Is currently loading? */
  isLoading: boolean;
  /** Should skeleton be displayed? */
  showSkeleton: boolean;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set data (success) */
  setData: (data: T) => void;
  /** Set error (failure) */
  setError: (error: Error) => void;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * Hook return type for useAsyncData
 */
export interface UseAsyncDataReturn<T = unknown> extends UseLoadingStateReturn<T> {
  /** Refetch/retry the async operation */
  refetch: () => Promise<void>;
  /** Is refetching? */
  isRefetching: boolean;
}

/**
 * Async data fetch options
 */
export interface AsyncDataOptions<T = unknown> {
  /** Async function to fetch data */
  fetcher: () => Promise<T>;
  /** Fetch immediately on mount */
  immediate?: boolean;
  /** Retry on error */
  retry?: boolean | number;
  /** Retry delay (ms) */
  retryDelay?: number;
  /** On success callback */
  onSuccess?: (data: T) => void;
  /** On error callback */
  onError?: (error: Error) => void;
  /** Enable skeleton threshold */
  useSkeletonThreshold?: boolean;
}

/**
 * Loading overlay configuration
 */
export interface LoadingOverlayConfig {
  /** Show overlay */
  visible: boolean;
  /** Overlay opacity (0-1) */
  opacity?: number;
  /** Blur background */
  blur?: boolean;
  /** Loading message */
  message?: string;
  /** Show progress bar */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Allow cancel */
  cancellable?: boolean;
  /** On cancel callback */
  onCancel?: () => void;
}

/**
 * Progress indicator types
 */
export type ProgressIndicatorType =
  | 'spinner'       // Circular spinner
  | 'bar'           // Linear progress bar
  | 'dots'          // Bouncing dots
  | 'skeleton'      // Skeleton loader
  | 'indeterminate' // Indeterminate bar
  | 'percentage';   // Percentage display

/**
 * Progress indicator configuration
 */
export interface ProgressIndicatorConfig {
  /** Indicator type */
  type: ProgressIndicatorType;
  /** Progress value (0-100) for determinate types */
  value?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'muted';
  /** Label text */
  label?: string;
  /** Show percentage */
  showPercentage?: boolean;
}

/**
 * Component loading state wrapper props
 */
export interface LoadingWrapperProps<T = unknown> {
  /** Loading state */
  state: LoadingState<T>;
  /** Skeleton configuration */
  skeleton?: SkeletonConfig;
  /** Loading overlay config (alternative to skeleton) */
  overlay?: LoadingOverlayConfig;
  /** Error fallback component */
  errorFallback?: (error: Error, retry: () => void) => React.ReactNode;
  /** Success render function */
  children: (data: T) => React.ReactNode;
}

/**
 * Suspense-like boundary configuration
 */
export interface AsyncBoundaryConfig {
  /** Loading fallback */
  fallback: React.ReactNode;
  /** Error fallback */
  errorFallback?: (error: Error, reset: () => void) => React.ReactNode;
  /** Reset on props change */
  resetKeys?: unknown[];
}
