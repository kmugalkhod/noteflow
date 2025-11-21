/**
 * Format Relative Date Utility
 * Provides human-friendly relative date formatting
 */

export function formatRelativeDate(date: Date | number): string {
  const now = new Date();
  const targetDate = typeof date === 'number' ? new Date(date) : date;
  const diff = now.getTime() - targetDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 Days";
  if (days < 30) return "This Month";
  return "Older";
}

export function formatDetailedDate(date: Date | number): string {
  const targetDate = typeof date === 'number' ? new Date(date) : date;
  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | number): string {
  const targetDate = typeof date === 'number' ? new Date(date) : date;
  return targetDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFullDateTime(date: Date | number): string {
  const targetDate = typeof date === 'number' ? new Date(date) : date;
  return targetDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
