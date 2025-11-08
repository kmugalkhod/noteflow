import { nanoid } from 'nanoid';

/**
 * Generate a unique, URL-safe share ID
 * @returns A 16-character random string
 */
export function generateShareId(): string {
  return nanoid(16);
}

/**
 * Build a complete share URL from a share ID
 * @param shareId - The unique share identifier
 * @returns Complete URL for sharing
 */
export function buildShareUrl(shareId: string): string {
  // Use window.location.origin for client-side (browser)
  // Use NEXT_PUBLIC_APP_URL for server-side rendering
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/share/${shareId}`;
}

/**
 * Validate a share ID format
 * @param shareId - The share ID to validate
 * @returns true if valid, false otherwise
 */
export function validateShareId(shareId: string): boolean {
  return typeof shareId === 'string' && shareId.length === 16;
}
