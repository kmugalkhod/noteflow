/**
 * Input Sanitization Library
 *
 * Prevents XSS attacks by sanitizing user-generated content
 * Uses sanitize-html for comprehensive HTML sanitization
 *
 * Security Features:
 * - Strips dangerous HTML tags and attributes
 * - Removes JavaScript event handlers
 * - Neutralizes script injection attempts
 * - Preserves safe formatting tags for rich text
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Sanitization levels for different use cases
 */
export enum SanitizationLevel {
  /**
   * STRICT: Only plain text, all HTML stripped
   * Use for: Note titles, folder names, tags
   */
  STRICT = 'strict',

  /**
   * BASIC: Basic formatting only (bold, italic, links)
   * Use for: Simple rich text content
   */
  BASIC = 'basic',

  /**
   * RICH: Extended formatting (headings, lists, tables)
   * Use for: Full rich text editor content
   */
  RICH = 'rich',
}

/**
 * Configuration for STRICT sanitization
 * Strips all HTML, returns plain text only
 */
const STRICT_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [], // No HTML tags allowed
  allowedAttributes: {}, // No attributes allowed
  disallowedTagsMode: 'recursiveEscape', // Escape disallowed tags instead of removing
  allowedSchemes: [], // No URL schemes
  allowedSchemesByTag: {},
  textFilter: (text) => {
    // Remove null bytes and other control characters
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  },
};

/**
 * Configuration for BASIC sanitization
 * Allows basic formatting: bold, italic, underline, links, line breaks
 */
const BASIC_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    'b', 'i', 'u', 'em', 'strong', 'a', 'br', 'p', 'span',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'span': ['style'], // Limited to safe styles only
  },
  allowedStyles: {
    '*': {
      // Only allow safe CSS properties
      'color': [/^#[0-9a-fA-F]{3,6}$/], // Hex colors only
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'font-style': [/^(normal|italic)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto'],
  },
  // Automatically add rel="noopener noreferrer" to external links
  transformTags: {
    'a': (tagName, attribs) => {
      const href = attribs.href || '';

      // External link detection
      const isExternal = href.startsWith('http://') || href.startsWith('https://');

      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(isExternal && {
            target: '_blank',
            rel: 'noopener noreferrer', // Security: Prevent window.opener access
          }),
        },
      };
    },
  },
  textFilter: (text) => {
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  },
};

/**
 * Configuration for RICH sanitization
 * Allows comprehensive formatting for rich text editors
 */
const RICH_CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    // Text formatting
    'b', 'i', 'u', 'em', 'strong', 'small', 'mark', 'del', 'ins', 'sub', 'sup',

    // Structure
    'p', 'br', 'hr', 'div', 'span', 'blockquote', 'pre', 'code',

    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

    // Lists
    'ul', 'ol', 'li',

    // Tables
    'table', 'thead', 'tbody', 'tr', 'th', 'td',

    // Links
    'a',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'span': ['style', 'class'],
    'div': ['class', 'style'],
    'p': ['style', 'class'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    'code': ['class'], // For syntax highlighting classes
  },
  allowedStyles: {
    '*': {
      'color': [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'font-style': [/^(normal|italic)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
      'text-align': [/^(left|right|center|justify)$/],
      'font-size': [/^\d+(?:px|em|rem|%)$/],
      'margin': [/^\d+(?:px|em|rem)$/],
      'padding': [/^\d+(?:px|em|rem)$/],
    },
  },
  allowedClasses: {
    'code': ['language-*', 'hljs-*'], // Syntax highlighting
    'span': ['highlight', 'mention'],
    'div': ['note-block', 'callout'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto'],
  },
  transformTags: {
    'a': (tagName, attribs) => {
      const href = attribs.href || '';
      const isExternal = href.startsWith('http://') || href.startsWith('https://');

      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(isExternal && {
            target: '_blank',
            rel: 'noopener noreferrer',
          }),
        },
      };
    },
  },
  // Ensure code blocks don't execute
  allowedIframeHostnames: [], // No iframes allowed
  textFilter: (text) => {
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  },
};

/**
 * Get sanitization configuration by level
 */
function getConfig(level: SanitizationLevel): sanitizeHtml.IOptions {
  switch (level) {
    case SanitizationLevel.STRICT:
      return STRICT_CONFIG;
    case SanitizationLevel.BASIC:
      return BASIC_CONFIG;
    case SanitizationLevel.RICH:
      return RICH_CONFIG;
    default:
      return STRICT_CONFIG; // Default to strictest
  }
}

/**
 * Main sanitization function
 *
 * @param input - User input to sanitize
 * @param level - Sanitization level (default: STRICT)
 * @returns Sanitized string safe for storage and display
 *
 * @example
 * ```typescript
 * // Title sanitization (removes all HTML)
 * sanitizeInput('<script>alert("xss")</script>Hello', SanitizationLevel.STRICT)
 * // Returns: "Hello"
 *
 * // Rich content sanitization (preserves safe HTML)
 * sanitizeInput('<b>Bold</b> and <script>bad()</script>', SanitizationLevel.RICH)
 * // Returns: "<b>Bold</b> and "
 * ```
 */
export function sanitizeInput(
  input: string | undefined | null,
  level: SanitizationLevel = SanitizationLevel.STRICT
): string {
  // Handle empty input
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Length limit (prevent DoS via massive input)
  const MAX_LENGTH = level === SanitizationLevel.STRICT ? 500 : 100000;
  const limited = trimmed.substring(0, MAX_LENGTH);

  // Apply sanitization
  const config = getConfig(level);
  return sanitizeHtml(limited, config);
}

/**
 * Sanitize note title
 * Uses STRICT level - plain text only
 */
export function sanitizeNoteTitle(title: string | undefined | null): string {
  return sanitizeInput(title, SanitizationLevel.STRICT);
}

/**
 * Sanitize note content (plain text mode)
 * Uses BASIC level - allows simple formatting
 */
export function sanitizeNoteContent(content: string | undefined | null): string {
  return sanitizeInput(content, SanitizationLevel.BASIC);
}

/**
 * Sanitize rich text content (BlockNote/TipTap editor)
 * Uses RICH level - allows comprehensive formatting
 */
export function sanitizeRichContent(content: string | undefined | null): string {
  return sanitizeInput(content, SanitizationLevel.RICH);
}

/**
 * Sanitize BlockNote blocks JSON
 * Parses JSON, sanitizes content within blocks, returns sanitized JSON string
 *
 * @param blocksJson - Stringified JSON of BlockNote blocks
 * @returns Sanitized JSON string
 */
export function sanitizeBlocksJson(blocksJson: string | undefined | null): string {
  if (!blocksJson || typeof blocksJson !== 'string') {
    return '';
  }

  try {
    const blocks = JSON.parse(blocksJson);

    if (!Array.isArray(blocks)) {
      return '';
    }

    // Recursively sanitize content in blocks
    const sanitizedBlocks = blocks.map((block) => sanitizeBlock(block));

    return JSON.stringify(sanitizedBlocks);
  } catch (error) {
    console.error('Failed to parse blocks JSON for sanitization:', error);
    // Return empty instead of potentially malicious content
    return '';
  }
}

/**
 * Recursively sanitize a BlockNote block
 */
function sanitizeBlock(block: any): any {
  if (!block || typeof block !== 'object') {
    return block;
  }

  const sanitized: any = { ...block };

  // Sanitize text content
  if (sanitized.content && Array.isArray(sanitized.content)) {
    sanitized.content = sanitized.content.map((item: any) => {
      if (typeof item === 'object' && item.text) {
        return {
          ...item,
          text: sanitizeInput(item.text, SanitizationLevel.RICH),
        };
      }
      return item;
    });
  }

  // Sanitize props (for example, link URLs)
  if (sanitized.props && typeof sanitized.props === 'object') {
    sanitized.props = sanitizeBlockProps(sanitized.props);
  }

  // Recursively sanitize children
  if (sanitized.children && Array.isArray(sanitized.children)) {
    sanitized.children = sanitized.children.map((child: any) => sanitizeBlock(child));
  }

  return sanitized;
}

/**
 * Sanitize block props (URLs, etc.)
 */
function sanitizeBlockProps(props: any): any {
  const sanitized: any = { ...props };

  // Sanitize URLs
  if (sanitized.url && typeof sanitized.url === 'string') {
    sanitized.url = sanitizeUrl(sanitized.url);
  }

  // Sanitize text fields
  if (sanitized.text && typeof sanitized.text === 'string') {
    sanitized.text = sanitizeInput(sanitized.text, SanitizationLevel.BASIC);
  }

  if (sanitized.caption && typeof sanitized.caption === 'string') {
    sanitized.caption = sanitizeInput(sanitized.caption, SanitizationLevel.BASIC);
  }

  return sanitized;
}

/**
 * Sanitize URLs
 * Allows only http, https, mailto schemes
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Check for allowed schemes
  const allowedSchemes = ['http://', 'https://', 'mailto:'];
  const hasAllowedScheme = allowedSchemes.some((scheme) =>
    trimmed.toLowerCase().startsWith(scheme)
  );

  if (!hasAllowedScheme) {
    // Block javascript:, data:, vbscript:, file:, etc.
    console.warn('Blocked URL with unsafe scheme:', trimmed);
    return '';
  }

  // Additional XSS protection: detect encoded javascript
  const decoded = decodeURIComponent(trimmed);
  if (decoded.toLowerCase().includes('javascript:') ||
      decoded.toLowerCase().includes('data:') ||
      decoded.toLowerCase().includes('vbscript:')) {
    console.warn('Blocked URL with encoded unsafe scheme:', trimmed);
    return '';
  }

  return trimmed;
}

/**
 * Sanitize folder name
 * Uses STRICT level - plain text only
 */
export function sanitizeFolderName(name: string | undefined | null): string {
  return sanitizeInput(name, SanitizationLevel.STRICT);
}

/**
 * Sanitize tag name
 * Uses STRICT level - plain text only
 */
export function sanitizeTagName(name: string | undefined | null): string {
  return sanitizeInput(name, SanitizationLevel.STRICT);
}

/**
 * Security audit log for blocked content
 * Logs attempts to inject malicious content
 */
export function logSanitizationEvent(
  userId: string,
  field: string,
  original: string,
  sanitized: string
) {
  // Only log if content was actually changed (potential attack)
  if (original !== sanitized) {
    console.warn('Sanitization event:', {
      userId,
      field,
      originalLength: original.length,
      sanitizedLength: sanitized.length,
      timestamp: new Date().toISOString(),
      // Don't log full content (could be sensitive)
      preview: original.substring(0, 100) + '...',
    });
  }
}

/**
 * Test if input contains potential XSS
 * Returns true if sanitization would modify the input
 */
export function containsPotentialXSS(
  input: string,
  level: SanitizationLevel = SanitizationLevel.STRICT
): boolean {
  const sanitized = sanitizeInput(input, level);
  return input !== sanitized;
}

/**
 * Get statistics about sanitization
 */
export function getSanitizationStats(original: string, sanitized: string) {
  return {
    originalLength: original.length,
    sanitizedLength: sanitized.length,
    bytesRemoved: original.length - sanitized.length,
    percentageRemoved: ((original.length - sanitized.length) / original.length * 100).toFixed(2),
    wasModified: original !== sanitized,
  };
}
