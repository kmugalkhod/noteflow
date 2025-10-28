'use client';

import { toast as sonnerToast } from 'sonner';

/**
 * Toast notification types
 */
type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast configuration interface
 */
interface ToastConfig {
  type: ToastType;
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Duration constants based on toast type
 * Success/info auto-dismiss after 3s
 * Error/warning persist until manually dismissed
 */
const TOAST_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  error: Infinity,
  warning: Infinity,
};

/**
 * Show a toast notification with contextual behavior
 *
 * @param config - Toast configuration
 * @returns Toast ID for manual dismissal
 */
export function showToast({ type, message, description, action }: ToastConfig): string | number {
  const config = {
    description,
    duration: TOAST_DURATIONS[type],
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  };

  switch (type) {
    case 'success':
      return sonnerToast.success(message, config);
    case 'error':
      return sonnerToast.error(message, config);
    case 'info':
      return sonnerToast.info(message, config);
    case 'warning':
      return sonnerToast.warning(message, config);
  }
}

/**
 * Convenience toast helpers
 * Simplified API for common toast patterns
 */
export const toast = {
  /**
   * Show success toast (auto-dismisses after 3s)
   */
  success: (message: string, description?: string) =>
    showToast({ type: 'success', message, description }),

  /**
   * Show error toast (persists until dismissed)
   * Optionally includes retry action
   */
  error: (message: string, description?: string, retry?: () => void) =>
    showToast({
      type: 'error',
      message,
      description,
      action: retry ? { label: 'Retry', onClick: retry } : undefined,
    }),

  /**
   * Show info toast (auto-dismisses after 3s)
   */
  info: (message: string, description?: string) =>
    showToast({ type: 'info', message, description }),

  /**
   * Show warning toast (persists until dismissed)
   */
  warning: (message: string, description?: string) =>
    showToast({ type: 'warning', message, description }),

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  /**
   * Dismiss all toasts
   */
  dismissAll: () => sonnerToast.dismiss(),

  /**
   * Promise toast - shows loading, then success/error based on promise result
   */
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    sonnerToast.promise(promise, options);
    return promise;
  },
};

/**
 * Common toast messages for consistency
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
  PERMISSION_ERROR: "You don't have permission to perform this action",
  UNKNOWN_ERROR: 'An unexpected error occurred',

  // Warning messages
  UNSAVED_CHANGES: 'You have unsaved changes',
  OFFLINE_WARNING: 'You are currently offline',
  STORAGE_WARNING: 'Storage is almost full',

  // Info messages
  LOADING_INFO: 'Loading...',
  PROCESSING_INFO: 'Processing...',
  SYNCING_INFO: 'Syncing changes...',
} as const;
