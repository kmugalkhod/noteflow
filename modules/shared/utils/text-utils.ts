/**
 * Text Utility Functions
 * Helpers for text processing and statistics
 */

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count characters in a text string (excluding whitespace)
 */
export function countCharacters(text: string): number {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}

/**
 * Estimate reading time in minutes
 * Average reading speed: 200 words per minute
 */
export function estimateReadingTime(text: string): number {
  const words = countWords(text);
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time as a human-readable string
 */
export function formatReadingTime(text: string): string {
  const minutes = estimateReadingTime(text);
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
}

/**
 * Truncate text to a specific length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Extract first line from text
 */
export function getFirstLine(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  return lines[0].trim();
}

/**
 * Extract preview text (first N words)
 */
export function getPreviewText(text: string, wordCount: number = 20): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
}
