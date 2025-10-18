import { JSONContent } from '@tiptap/core';
import type { Block, BlockType, FormattedTextSegment } from '../types/blocks';

/**
 * Convert Tiptap JSON content to our Block structure
 * This allows us to maintain backward compatibility with existing notes
 */
export function tiptapToBlocks(tiptapContent: JSONContent): Block[] {
  if (!tiptapContent || !tiptapContent.content) {
    return [];
  }

  const blocks: Block[] = [];

  for (const node of tiptapContent.content) {
    const block = nodeToBlock(node);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks.length > 0 ? blocks : [createDefaultBlock()];
}

/**
 * Convert a single Tiptap node to a Block
 */
function nodeToBlock(node: JSONContent): Block | null {
  const id = generateBlockId();

  switch (node.type) {
    case 'paragraph':
      return {
        id,
        type: 'paragraph',
        content: extractTextContent(node),
        textColor: node.attrs?.color,
      };

    case 'heading':
      const level = node.attrs?.level || 1;
      return {
        id,
        type: `heading${level}` as BlockType,
        content: extractTextContent(node),
      };

    case 'bulletList':
      // Convert bullet list items to individual blocks
      return convertListToBlocks(node, 'bulletList', id);

    case 'orderedList':
      return convertListToBlocks(node, 'numberedList', id);

    case 'taskList':
      return convertTaskListToBlocks(node, id);

    case 'blockquote':
      return {
        id,
        type: 'quote',
        content: extractTextContent(node),
      };

    case 'codeBlock':
      return {
        id,
        type: 'code',
        content: extractTextContent(node),
        properties: {
          language: node.attrs?.language || 'text',
        },
      };

    case 'horizontalRule':
      return {
        id,
        type: 'divider',
        content: '',
      };

    case 'callout':
      return {
        id,
        type: 'callout',
        content: extractTextContent(node),
        properties: {
          icon: node.attrs?.icon || '💡',
          color: node.attrs?.color || 'default',
        },
      };

    case 'toggle':
      return {
        id,
        type: 'toggle',
        content: node.attrs?.summary || '',
        properties: {
          open: node.attrs?.open || false,
        },
        children: node.content ? tiptapToBlocks({ type: 'doc', content: node.content }) : [],
      };

    case 'image':
      return {
        id,
        type: 'image',
        content: '',
        properties: {
          url: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          caption: node.attrs?.title || '',
          width: node.attrs?.width,
          height: node.attrs?.height,
        },
      };

    case 'table':
      return convertTableToBlock(node, id);

    default:
      return null;
  }
}

/**
 * Convert list items to blocks
 */
function convertListToBlocks(listNode: JSONContent, type: 'bulletList' | 'numberedList', baseId: string): Block | null {
  if (!listNode.content || listNode.content.length === 0) return null;

  // For now, return the first list item as a block
  const firstItem = listNode.content[0];
  const content = firstItem.content ? extractTextContent({ type: 'paragraph', content: firstItem.content }) : '';

  return {
    id: baseId,
    type,
    content,
    properties: {
      level: 0,
    },
  };
}

/**
 * Convert task list to blocks
 */
function convertTaskListToBlocks(taskListNode: JSONContent, baseId: string): Block | null {
  if (!taskListNode.content || taskListNode.content.length === 0) return null;

  const firstItem = taskListNode.content[0];
  const content = firstItem.content ? extractTextContent({ type: 'paragraph', content: firstItem.content }) : '';

  return {
    id: baseId,
    type: 'todo',
    content,
    properties: {
      checked: firstItem.attrs?.checked || false,
    },
  };
}

/**
 * Convert table node to block
 */
function convertTableToBlock(tableNode: JSONContent, id: string): Block | null {
  if (!tableNode.content) return null;

  const rows: string[][] = [];
  let headers = false;

  for (const row of tableNode.content) {
    if (row.type === 'tableRow' && row.content) {
      const rowData: string[] = [];
      for (const cell of row.content) {
        if (cell.type === 'tableHeader') {
          headers = true;
        }
        rowData.push(extractTextContent(cell));
      }
      rows.push(rowData);
    }
  }

  return {
    id,
    type: 'table',
    content: '',
    properties: {
      rows: rows.length,
      columns: rows[0]?.length || 3,
      data: rows,
      headers,
    },
  };
}

/**
 * Extract text content from a node, preserving formatting
 */
function extractTextContent(node: JSONContent): string | FormattedTextSegment[] {
  if (!node.content || node.content.length === 0) {
    return '';
  }

  // Check if we have any formatting marks
  const hasFormatting = node.content.some(child =>
    child.marks && child.marks.length > 0
  );

  if (!hasFormatting) {
    // Simple text extraction
    return node.content
      .map(child => {
        if (child.type === 'text') {
          return child.text || '';
        }
        if (child.type === 'hardBreak') {
          return '\n';
        }
        return '';
      })
      .join('');
  }

  // Extract formatted text segments
  const segments: FormattedTextSegment[] = [];

  for (const child of node.content) {
    if (child.type === 'text' && child.text) {
      const segment: FormattedTextSegment = {
        text: child.text,
      };

      if (child.marks) {
        for (const mark of child.marks) {
          switch (mark.type) {
            case 'bold':
              segment.bold = true;
              break;
            case 'italic':
              segment.italic = true;
              break;
            case 'underline':
              segment.underline = true;
              break;
            case 'strike':
              segment.strikethrough = true;
              break;
            case 'code':
              segment.code = true;
              break;
            case 'textStyle':
              if (mark.attrs?.color) {
                segment.color = mark.attrs.color as any;
              }
              break;
            case 'highlight':
              if (mark.attrs?.color) {
                segment.backgroundColor = mark.attrs.color as any;
              }
              break;
          }
        }
      }

      segments.push(segment);
    } else if (child.type === 'hardBreak') {
      segments.push({ text: '\n' });
    }
  }

  return segments;
}

/**
 * Convert our Block structure to Tiptap JSON content
 */
export function blocksToTiptap(blocks: Block[]): JSONContent {
  const content: JSONContent[] = blocks.map(blockToNode);

  return {
    type: 'doc',
    content,
  };
}

/**
 * Convert a single Block to a Tiptap node
 */
function blockToNode(block: Block): JSONContent {
  const textContent = blockContentToTiptapContent(block.content);

  switch (block.type) {
    case 'paragraph':
      return {
        type: 'paragraph',
        attrs: block.textColor ? { color: block.textColor } : undefined,
        content: textContent,
      };

    case 'heading1':
    case 'heading2':
    case 'heading3':
      return {
        type: 'heading',
        attrs: { level: parseInt(block.type.slice(-1)) },
        content: textContent,
      };

    case 'bulletList':
      return {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: textContent,
              },
            ],
          },
        ],
      };

    case 'numberedList':
      return {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: textContent,
              },
            ],
          },
        ],
      };

    case 'todo':
      return {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: (block.properties as any)?.checked || false },
            content: [
              {
                type: 'paragraph',
                content: textContent,
              },
            ],
          },
        ],
      };

    case 'quote':
      return {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: textContent,
          },
        ],
      };

    case 'code':
      return {
        type: 'codeBlock',
        attrs: { language: (block.properties as any)?.language || 'text' },
        content: textContent,
      };

    case 'divider':
      return {
        type: 'horizontalRule',
      };

    case 'callout':
      return {
        type: 'callout',
        attrs: {
          icon: (block.properties as any)?.icon || '💡',
          color: (block.properties as any)?.color || 'default',
        },
        content: textContent,
      };

    case 'toggle':
      return {
        type: 'toggle',
        attrs: {
          open: (block.properties as any)?.open || false,
          summary: block.content,
        },
        content: block.children ? blocksToTiptap(block.children).content : [],
      };

    case 'image':
      return {
        type: 'image',
        attrs: {
          src: (block.properties as any)?.url || '',
          alt: (block.properties as any)?.alt || '',
          title: (block.properties as any)?.caption || '',
          width: (block.properties as any)?.width,
          height: (block.properties as any)?.height,
        },
      };

    case 'table':
      return {
        type: 'table',
        content: convertBlockToTable(block),
      };

    default:
      return {
        type: 'paragraph',
        content: textContent,
      };
  }
}

/**
 * Convert block content to Tiptap content array
 */
function blockContentToTiptapContent(content: string | FormattedTextSegment[]): JSONContent[] {
  if (typeof content === 'string') {
    return content ? [{ type: 'text', text: content }] : [];
  }

  // Convert formatted segments to Tiptap marks
  return content.map(segment => {
    const marks: any[] = [];

    if (segment.bold) marks.push({ type: 'bold' });
    if (segment.italic) marks.push({ type: 'italic' });
    if (segment.underline) marks.push({ type: 'underline' });
    if (segment.strikethrough) marks.push({ type: 'strike' });
    if (segment.code) marks.push({ type: 'code' });
    if (segment.color) marks.push({ type: 'textStyle', attrs: { color: segment.color } });
    if (segment.backgroundColor) marks.push({ type: 'highlight', attrs: { color: segment.backgroundColor } });

    return {
      type: 'text',
      text: segment.text,
      marks: marks.length > 0 ? marks : undefined,
    };
  });
}

/**
 * Convert table block to Tiptap table rows
 */
function convertBlockToTable(block: Block): JSONContent[] {
  const props = block.properties as any;
  const data = props?.data || [['', '', ''], ['', '', ''], ['', '', '']];
  const headers = props?.headers || false;

  return data.map((row: string[], rowIndex: number) => ({
    type: 'tableRow',
    content: row.map(cell => ({
      type: headers && rowIndex === 0 ? 'tableHeader' : 'tableCell',
      content: [
        {
          type: 'paragraph',
          content: cell ? [{ type: 'text', text: cell }] : [],
        },
      ],
    })),
  }));
}

/**
 * Generate a unique block ID
 */
function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a default empty block
 */
function createDefaultBlock(): Block {
  return {
    id: generateBlockId(),
    type: 'paragraph',
    content: '',
  };
}
