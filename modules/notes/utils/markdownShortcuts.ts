import { BlockType } from '../types/blocks';

interface MarkdownPattern {
  pattern: RegExp;
  blockType?: BlockType;
  transform?: (match: RegExpMatchArray) => { type: BlockType; content: string };
}

export const markdownPatterns: MarkdownPattern[] = [
  // Headings
  {
    pattern: /^# (.*)$/,
    transform: (match) => ({ type: 'heading1', content: match[1] })
  },
  {
    pattern: /^## (.*)$/,
    transform: (match) => ({ type: 'heading2', content: match[1] })
  },
  {
    pattern: /^### (.*)$/,
    transform: (match) => ({ type: 'heading3', content: match[1] })
  },

  // Lists
  {
    pattern: /^- (.*)$/,
    transform: (match) => ({ type: 'bulletList', content: match[1] })
  },
  {
    pattern: /^\* (.*)$/,
    transform: (match) => ({ type: 'bulletList', content: match[1] })
  },
  {
    pattern: /^1\. (.*)$/,
    transform: (match) => ({ type: 'numberedList', content: match[1] })
  },

  // Todo
  {
    pattern: /^\[\s?\] (.*)$/,
    transform: (match) => ({ type: 'todo', content: match[1] })
  },
  {
    pattern: /^\[x\] (.*)$/i,
    transform: (match) => ({ type: 'todo', content: match[1] })
  },

  // Quote
  {
    pattern: /^> (.*)$/,
    transform: (match) => ({ type: 'quote', content: match[1] })
  },

  // Code block
  {
    pattern: /^``` ?(.*)$/,
    transform: (match) => ({ type: 'code', content: match[1] || '' })
  },

  // Divider
  {
    pattern: /^---$/,
    transform: () => ({ type: 'divider', content: '' })
  },
  {
    pattern: /^\*\*\*$/,
    transform: () => ({ type: 'divider', content: '' })
  },
];

export const detectMarkdownShortcut = (
  content: string
): { type: BlockType; content: string } | null => {
  for (const { pattern, transform } of markdownPatterns) {
    const match = content.match(pattern);
    if (match && transform) {
      return transform(match);
    }
  }
  return null;
};

// Detect markdown at the end of input (triggered by space)
export const detectMarkdownOnSpace = (
  content: string,
  cursorPosition: number
): { type: BlockType; content: string; newCursorPosition: number } | null => {
  // Get text before cursor
  const textBeforeCursor = content.substring(0, cursorPosition);
  const textAfterCursor = content.substring(cursorPosition);

  // Split by lines
  const lines = textBeforeCursor.split('\n');
  const currentLine = lines[lines.length - 1];

  // Check if the current line (without trailing space) matches a pattern
  const lineWithoutSpace = currentLine.trimEnd();

  for (const { pattern, transform } of markdownPatterns) {
    const match = lineWithoutSpace.match(pattern);
    if (match && transform) {
      const result = transform(match);

      // Calculate new content (remove the markdown syntax, keep the content)
      const newContent = result.content + textAfterCursor;
      const newCursorPosition = result.content.length;

      return {
        type: result.type,
        content: newContent,
        newCursorPosition
      };
    }
  }

  return null;
};
