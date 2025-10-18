import type { FormattedTextSegment, FormattedContent, TextColor } from '../types/blocks';

export interface TextSelection {
  start: number;
  end: number;
}

/**
 * Convert plain string content to FormattedTextSegment array
 */
export function stringToSegments(text: string): FormattedTextSegment[] {
  if (!text) return [];
  return [{ text }];
}

/**
 * Convert FormattedTextSegment array to plain string
 */
export function segmentsToString(segments: FormattedTextSegment[] | string): string {
  if (typeof segments === 'string') return segments;
  return segments.map(seg => seg.text).join('');
}

/**
 * Apply formatting to a text range
 */
export function applyFormatting(
  content: FormattedContent,
  selection: TextSelection,
  format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
): FormattedTextSegment[] {
  const segments = typeof content === 'string' ? stringToSegments(content) : content;

  if (!segments.length) return [];

  const result: FormattedTextSegment[] = [];
  let currentPos = 0;

  for (const segment of segments) {
    const segmentStart = currentPos;
    const segmentEnd = currentPos + segment.text.length;

    // Segment is before selection
    if (segmentEnd <= selection.start) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment is after selection
    if (segmentStart >= selection.end) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment overlaps with selection - need to split
    const overlapStart = Math.max(segmentStart, selection.start);
    const overlapEnd = Math.min(segmentEnd, selection.end);

    // Before overlap
    if (overlapStart > segmentStart) {
      result.push({
        ...segment,
        text: segment.text.substring(0, overlapStart - segmentStart),
      });
    }

    // Overlap - toggle the format
    const overlapText = segment.text.substring(
      overlapStart - segmentStart,
      overlapEnd - segmentStart
    );
    const isCurrentlyFormatted = segment[format];
    result.push({
      ...segment,
      text: overlapText,
      [format]: !isCurrentlyFormatted,
    });

    // After overlap
    if (overlapEnd < segmentEnd) {
      result.push({
        ...segment,
        text: segment.text.substring(overlapEnd - segmentStart),
      });
    }

    currentPos = segmentEnd;
  }

  // Merge adjacent segments with same formatting
  return mergeAdjacentSegments(result);
}

/**
 * Apply color to a text range
 */
export function applyColor(
  content: FormattedContent,
  selection: TextSelection,
  color: TextColor
): FormattedTextSegment[] {
  const segments = typeof content === 'string' ? stringToSegments(content) : content;

  if (!segments.length) return [];

  const result: FormattedTextSegment[] = [];
  let currentPos = 0;

  for (const segment of segments) {
    const segmentStart = currentPos;
    const segmentEnd = currentPos + segment.text.length;

    // Segment is before selection
    if (segmentEnd <= selection.start) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment is after selection
    if (segmentStart >= selection.end) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment overlaps with selection - need to split
    const overlapStart = Math.max(segmentStart, selection.start);
    const overlapEnd = Math.min(segmentEnd, selection.end);

    // Before overlap
    if (overlapStart > segmentStart) {
      result.push({
        ...segment,
        text: segment.text.substring(0, overlapStart - segmentStart),
      });
    }

    // Overlap - apply color
    const overlapText = segment.text.substring(
      overlapStart - segmentStart,
      overlapEnd - segmentStart
    );
    result.push({
      ...segment,
      text: overlapText,
      color: color === 'default' ? undefined : color,
    });

    // After overlap
    if (overlapEnd < segmentEnd) {
      result.push({
        ...segment,
        text: segment.text.substring(overlapEnd - segmentStart),
      });
    }

    currentPos = segmentEnd;
  }

  return mergeAdjacentSegments(result);
}

/**
 * Apply background color (highlight) to a text range
 */
export function applyHighlight(
  content: FormattedContent,
  selection: TextSelection,
  color: TextColor
): FormattedTextSegment[] {
  const segments = typeof content === 'string' ? stringToSegments(content) : content;

  if (!segments.length) return [];

  const result: FormattedTextSegment[] = [];
  let currentPos = 0;

  for (const segment of segments) {
    const segmentStart = currentPos;
    const segmentEnd = currentPos + segment.text.length;

    // Segment is before selection
    if (segmentEnd <= selection.start) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment is after selection
    if (segmentStart >= selection.end) {
      result.push(segment);
      currentPos = segmentEnd;
      continue;
    }

    // Segment overlaps with selection - need to split
    const overlapStart = Math.max(segmentStart, selection.start);
    const overlapEnd = Math.min(segmentEnd, selection.end);

    // Before overlap
    if (overlapStart > segmentStart) {
      result.push({
        ...segment,
        text: segment.text.substring(0, overlapStart - segmentStart),
      });
    }

    // Overlap - apply background color
    const overlapText = segment.text.substring(
      overlapStart - segmentStart,
      overlapEnd - segmentStart
    );
    result.push({
      ...segment,
      text: overlapText,
      backgroundColor: color === 'default' ? undefined : color,
    });

    // After overlap
    if (overlapEnd < segmentEnd) {
      result.push({
        ...segment,
        text: segment.text.substring(overlapEnd - segmentStart),
      });
    }

    currentPos = segmentEnd;
  }

  return mergeAdjacentSegments(result);
}

/**
 * Merge adjacent segments with identical formatting
 */
function mergeAdjacentSegments(segments: FormattedTextSegment[]): FormattedTextSegment[] {
  if (segments.length <= 1) return segments;

  const result: FormattedTextSegment[] = [segments[0]];

  for (let i = 1; i < segments.length; i++) {
    const prev = result[result.length - 1];
    const current = segments[i];

    // Check if formatting matches
    if (
      prev.bold === current.bold &&
      prev.italic === current.italic &&
      prev.underline === current.underline &&
      prev.strikethrough === current.strikethrough &&
      prev.code === current.code &&
      prev.color === current.color &&
      prev.backgroundColor === current.backgroundColor
    ) {
      // Merge with previous segment
      prev.text += current.text;
    } else {
      result.push(current);
    }
  }

  return result;
}

/**
 * Get active formats at a cursor position
 */
export function getActiveFormatsAtPosition(
  content: FormattedContent,
  position: number
): {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: TextColor;
  backgroundColor?: TextColor;
} {
  const segments = typeof content === 'string' ? stringToSegments(content) : content;

  let currentPos = 0;

  for (const segment of segments) {
    const segmentEnd = currentPos + segment.text.length;

    if (position >= currentPos && position <= segmentEnd) {
      return {
        bold: segment.bold,
        italic: segment.italic,
        underline: segment.underline,
        strikethrough: segment.strikethrough,
        code: segment.code,
        color: segment.color,
        backgroundColor: segment.backgroundColor,
      };
    }

    currentPos = segmentEnd;
  }

  return {};
}

/**
 * Get color class name for a TextColor
 */
export function getColorClass(color?: TextColor): string {
  if (!color || color === 'default') return '';

  const colorMap: Record<TextColor, string> = {
    default: '',
    gray: 'text-gray-600 dark:text-gray-400',
    brown: 'text-amber-800 dark:text-amber-600',
    orange: 'text-orange-600 dark:text-orange-500',
    yellow: 'text-yellow-600 dark:text-yellow-500',
    green: 'text-green-600 dark:text-green-500',
    blue: 'text-blue-600 dark:text-blue-500',
    purple: 'text-purple-600 dark:text-purple-500',
    pink: 'text-pink-600 dark:text-pink-500',
    red: 'text-red-600 dark:text-red-500',
  };

  return colorMap[color] || '';
}

/**
 * Get background color class name for a TextColor
 */
export function getBackgroundColorClass(color?: TextColor): string {
  if (!color || color === 'default') return '';

  const backgroundMap: Record<TextColor, string> = {
    default: '',
    gray: 'bg-gray-200 dark:bg-gray-800',
    brown: 'bg-amber-100 dark:bg-amber-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
  };

  return backgroundMap[color] || '';
}
