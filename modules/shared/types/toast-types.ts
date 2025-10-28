/**
 * Toast Notification Types & Contracts
 *
 * TypeScript type definitions for toast notifications using Sonner library
 * with enhanced contextual behavior.
 */

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast severity level (for styling and behavior)
 */
export type ToastSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Toast action button configuration
 */
export interface ToastAction {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void | Promise<void>;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline';
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  /** Toast type (affects styling and default duration) */
  type: ToastType;

  /** Primary message (required) */
  message: string;

  /** Optional description/details */
  description?: string;

  /**
   * Duration in milliseconds
   * - undefined: Use default based on type
   * - Infinity: Persist until manually dismissed
   * - number: Custom duration
   */
  duration?: number;

  /** Action button(s) */
  action?: ToastAction;

  /** Icon override (by default determined by type) */
  icon?: React.ReactNode;

  /** Dismissible (show close button) */
  dismissible?: boolean;

  /** Position override */
  position?: ToastPosition;

  /** Custom className */
  className?: string;

  /** On dismiss callback */
  onDismiss?: () => void;

  /** On auto-dismiss callback */
  onAutoClose?: () => void;
}

/**
 * Toast position on screen
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Default toast durations by type (milliseconds)
 */
export const TOAST_DURATIONS: Record<ToastType, number> = {
  /** Success messages - auto-dismiss after 3s */
  success: 3000,
  /** Info messages - auto-dismiss after 3s */
  info: 3000,
  /** Error messages - persist until dismissed */
  error: Infinity,
  /** Warning messages - persist until dismissed */
  warning: Infinity,
} as const;

/**
 * Toast behavior configuration by type
 */
export interface ToastBehavior {
  /** Default duration */
  duration: number;
  /** Is dismissible? */
  dismissible: boolean;
  /** Auto-dismiss or require manual dismissal? */
  autoClose: boolean;
  /** Icon component */
  icon?: string; // Icon name from lucide-react
  /** Severity level */
  severity: ToastSeverity;
}

/**
 * Default toast behaviors by type
 */
export const TOAST_BEHAVIORS: Record<ToastType, ToastBehavior> = {
  success: {
    duration: 3000,
    dismissible: true,
    autoClose: true,
    icon: 'CheckCircle',
    severity: 'low',
  },
  info: {
    duration: 3000,
    dismissible: true,
    autoClose: true,
    icon: 'Info',
    severity: 'low',
  },
  error: {
    duration: Infinity,
    dismissible: true,
    autoClose: false,
    icon: 'XCircle',
    severity: 'high',
  },
  warning: {
    duration: Infinity,
    dismissible: true,
    autoClose: false,
    icon: 'AlertTriangle',
    severity: 'medium',
  },
} as const;

/**
 * Toast queue state (managed by Sonner internally)
 */
export interface ToastQueueState {
  /** Active toasts */
  toasts: Array<ToastInstance>;
  /** Maximum visible toasts */
  maxVisible: number;
  /** Queue position */
  position: ToastPosition;
}

/**
 * Individual toast instance
 */
export interface ToastInstance {
  /** Unique ID */
  id: string | number;
  /** Toast type */
  type: ToastType;
  /** Message */
  message: string;
  /** Description */
  description?: string;
  /** Duration */
  duration: number;
  /** Created timestamp */
  createdAt: number;
  /** Is visible? */
  visible: boolean;
  /** Is dismissing? */
  dismissing: boolean;
}

/**
 * Toast notification helper function type
 */
export type ShowToastFn = (config: ToastConfig) => string | number;

/**
 * Specific toast type helpers
 */
export interface ToastHelpers {
  success: (message: string, options?: Omit<ToastConfig, 'type' | 'message'>) => string | number;
  error: (message: string, options?: Omit<ToastConfig, 'type' | 'message'>) => string | number;
  info: (message: string, options?: Omit<ToastConfig, 'type' | 'message'>) => string | number;
  warning: (message: string, options?: Omit<ToastConfig, 'type' | 'message'>) => string | number;
  dismiss: (id?: string | number) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => Promise<T>;
}

/**
 * Toast manager configuration (global)
 */
export interface ToasterConfig {
  /** Default position */
  position?: ToastPosition;
  /** Maximum visible toasts */
  maxToasts?: number;
  /** Gap between toasts (px) */
  gap?: number;
  /** Toast width */
  toastWidth?: number | string;
  /** Theme */
  theme?: 'light' | 'dark' | 'system';
  /** Rich colors (enhanced styling) */
  richColors?: boolean;
  /** Expand toasts on hover */
  expand?: boolean;
  /** Show close button */
  closeButton?: boolean;
  /** Offset from screen edge */
  offset?: string | number;
  /** Duration for all toasts (override defaults) */
  duration?: number;
}

/**
 * Common toast message templates
 */
export const TOAST_MESSAGES = {
  // Success messages
  SAVE_SUCCESS: 'Changes saved successfully',
  CREATE_SUCCESS: (item: string) => `${item} created successfully`,
  DELETE_SUCCESS: (item: string) => `${item} deleted successfully`,
  UPDATE_SUCCESS: (item: string) => `${item} updated successfully`,
  COPY_SUCCESS: 'Copied to clipboard',
  SYNC_SUCCESS: 'Synced successfully',

  // Error messages
  SAVE_ERROR: 'Failed to save changes',
  CREATE_ERROR: (item: string) => `Failed to create ${item}`,
  DELETE_ERROR: (item: string) => `Failed to delete ${item}`,
  UPDATE_ERROR: (item: string) => `Failed to update ${item}`,
  NETWORK_ERROR: 'Network error. Please try again',
  AUTH_ERROR: 'Authentication failed',
  PERMISSION_ERROR: 'You don\'t have permission to perform this action',
  UNKNOWN_ERROR: 'An unexpected error occurred',

  // Warning messages
  UNSAVED_CHANGES: 'You have unsaved changes',
  OFFLINE_WARNING: 'You are currently offline',
  STORAGE_WARNING: 'Storage is almost full',
  DEPRECATED_WARNING: (feature: string) => `${feature} is deprecated`,

  // Info messages
  LOADING_INFO: 'Loading...',
  PROCESSING_INFO: 'Processing...',
  SYNCING_INFO: 'Syncing changes...',
  TIP_INFO: (tip: string) => `Tip: ${tip}`,
} as const;

/**
 * Toast notification with async action (promise toast)
 */
export interface AsyncToastConfig<T = unknown> {
  /** Promise to track */
  promise: Promise<T>;
  /** Loading message */
  loading: string;
  /** Success message (static or dynamic based on result) */
  success: string | ((data: T) => string);
  /** Error message (static or dynamic based on error) */
  error: string | ((error: Error) => string);
  /** Action on success */
  onSuccess?: (data: T) => void;
  /** Action on error */
  onError?: (error: Error) => void;
  /** Finally callback */
  finally?: () => void;
}

/**
 * Hook return type for useToast
 */
export interface UseToastReturn extends ToastHelpers {
  /** Show generic toast */
  toast: ShowToastFn;
  /** Dismiss all toasts */
  dismissAll: () => void;
}
