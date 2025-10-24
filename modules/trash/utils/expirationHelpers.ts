/**
 * Expiration Helpers
 *
 * Utilities for calculating trash expiration dates and remaining time
 */

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Calculate the expiration date for a deleted item
 * @param deletedAt Timestamp when item was deleted
 * @returns Expiration timestamp
 */
export function calculateExpirationDate(deletedAt: number): number {
  return deletedAt + TRASH_RETENTION_MS;
}

/**
 * Calculate days remaining until expiration
 * @param deletedAt Timestamp when item was deleted
 * @returns Days remaining (can be negative if expired)
 */
export function calculateDaysRemaining(deletedAt: number): number {
  const expiresAt = calculateExpirationDate(deletedAt);
  const msRemaining = expiresAt - Date.now();
  return Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
}

/**
 * Check if an item has expired
 * @param deletedAt Timestamp when item was deleted
 * @returns true if item has expired
 */
export function isExpired(deletedAt: number): boolean {
  return calculateDaysRemaining(deletedAt) <= 0;
}

/**
 * Check if an item is expiring soon (within threshold)
 * @param deletedAt Timestamp when item was deleted
 * @param threshold Days threshold (default: 7)
 * @returns true if item is expiring within threshold
 */
export function isExpiringSoon(deletedAt: number, threshold: number = 7): boolean {
  const daysRemaining = calculateDaysRemaining(deletedAt);
  return daysRemaining > 0 && daysRemaining <= threshold;
}

/**
 * Check if an item is urgently expiring (within 3 days)
 * @param deletedAt Timestamp when item was deleted
 * @returns true if item is urgently expiring
 */
export function isUrgentlyExpiring(deletedAt: number): boolean {
  return isExpiringSoon(deletedAt, 3);
}

/**
 * Format expiration message
 * @param deletedAt Timestamp when item was deleted
 * @returns Formatted expiration message
 */
export function formatExpirationMessage(deletedAt: number): string {
  const daysRemaining = calculateDaysRemaining(deletedAt);

  if (daysRemaining <= 0) {
    return "Expiring soon";
  } else if (daysRemaining === 1) {
    return "1 day left";
  } else {
    return `${daysRemaining} days left`;
  }
}

/**
 * Get expiration urgency level
 * @param deletedAt Timestamp when item was deleted
 * @returns Urgency level: "urgent" | "warning" | "normal"
 */
export function getExpirationUrgency(deletedAt: number): "urgent" | "warning" | "normal" {
  const daysRemaining = calculateDaysRemaining(deletedAt);

  if (daysRemaining <= 3) {
    return "urgent";
  } else if (daysRemaining <= 7) {
    return "warning";
  } else {
    return "normal";
  }
}
