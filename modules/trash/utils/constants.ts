/**
 * Trash Module Constants
 *
 * Centralized constants for trash functionality
 */

/**
 * Number of days notes/folders remain in trash before auto-deletion
 */
export const TRASH_RETENTION_DAYS = 30;

/**
 * Retention period in milliseconds
 */
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Warning threshold in days (items expiring within this are marked as warning)
 */
export const EXPIRATION_WARNING_THRESHOLD_DAYS = 7;

/**
 * Urgent threshold in days (items expiring within this are marked as urgent)
 */
export const EXPIRATION_URGENT_THRESHOLD_DAYS = 3;

/**
 * Maximum items per bulk operation
 */
export const MAX_BULK_OPERATION_SIZE = 100;

/**
 * Default search debounce delay in ms
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Undo toast duration in ms
 */
export const UNDO_TOAST_DURATION_MS = 10000; // 10 seconds
