export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "todo"
  | "toggle"
  | "quote"
  | "divider"
  | "code"
  | "image"
  | "table"
  | "callout";

// Text formatting types
export type TextColor = "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";

export interface FormattedTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: TextColor;
  backgroundColor?: TextColor;
}

export type FormattedContent = FormattedTextSegment[] | string;

export interface BaseBlock {
  id: string;
  type: BlockType;
  content: string | FormattedContent; // Support both plain text and formatted content
  properties?: Record<string, any>;
  children?: Block[];
  textColor?: TextColor; // Block-level text color
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
}

export interface HeadingBlock extends BaseBlock {
  type: "heading1" | "heading2" | "heading3";
}

export interface ListBlock extends BaseBlock {
  type: "bulletList" | "numberedList";
  properties: {
    level?: number; // For nested lists
  };
}

export interface TodoBlock extends BaseBlock {
  type: "todo";
  properties: {
    checked: boolean;
  };
}

export interface ToggleBlock extends BaseBlock {
  type: "toggle";
  properties: {
    open: boolean;
  };
  children: Block[];
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  content: ""; // Dividers have no content
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  properties: {
    language?: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  properties: {
    url: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export interface TableBlock extends BaseBlock {
  type: "table";
  properties: {
    rows: number;
    columns: number;
    data: string[][]; // 2D array of cell content
    headers?: boolean; // First row as headers
  };
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  properties: {
    icon?: string;
    color?: "default" | "gray" | "brown" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "red";
  };
}

export type Block = 
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | TodoBlock
  | ToggleBlock
  | QuoteBlock
  | DividerBlock
  | CodeBlock
  | ImageBlock
  | TableBlock
  | CalloutBlock;

export interface EditorState {
  blocks: Block[];
  selection?: {
    blockId: string;
    offset: number;
  };
  focusedBlockId?: string;
}

// Utility functions
export const createBlock = (type: BlockType, content: string = "", properties?: Record<string, any>): Block => {
  const baseBlock: BaseBlock = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    properties,
  };

  switch (type) {
    case "todo":
      return { ...baseBlock, type: "todo", properties: { checked: false, ...properties } } as TodoBlock;
    case "toggle":
      return { ...baseBlock, type: "toggle", properties: { open: false, ...properties }, children: [] } as ToggleBlock;
    case "code":
      return { ...baseBlock, type: "code", properties: { language: "text", ...properties } } as CodeBlock;
    case "image":
      return { ...baseBlock, type: "image", properties: { url: "", ...properties } } as ImageBlock;
    case "table":
      return { 
        ...baseBlock, 
        type: "table", 
        properties: { 
          rows: 3, 
          columns: 3, 
          data: Array(3).fill(null).map(() => Array(3).fill("")),
          headers: true,
          ...properties 
        } 
      } as TableBlock;
    case "callout":
      return { ...baseBlock, type: "callout", properties: { icon: "💡", color: "default", ...properties } } as CalloutBlock;
    case "divider":
      return { ...baseBlock, type: "divider", content: "" } as DividerBlock;
    default:
      return baseBlock as Block;
  }
};

export const serializeBlocks = (blocks: Block[]): string => {
  return JSON.stringify(blocks);
};

export const deserializeBlocks = (blocksJson: string): Block[] => {
  try {
    return JSON.parse(blocksJson) as Block[];
  } catch {
    return [];
  }
};

// Convert plain text to basic paragraph blocks
export const textToBlocks = (text: string): Block[] => {
  if (!text.trim()) {
    return [createBlock("paragraph")];
  }

  const lines = text.split('\n');
  const blocks: Block[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Only create blocks for non-empty lines, or if it's the last line
    if (line.trim() || i === lines.length - 1) {
      blocks.push(createBlock("paragraph", line));
    }
  }
  
  // Ensure we always have at least one block
  if (blocks.length === 0) {
    blocks.push(createBlock("paragraph"));
  }
  
  return blocks;
};

// Convert blocks to plain text (for backward compatibility)
export const blocksToText = (blocks: Block[]): string => {
  return blocks.map(block => {
    switch (block.type) {
      case "heading1":
        return `# ${block.content}`;
      case "heading2":
        return `## ${block.content}`;
      case "heading3":
        return `### ${block.content}`;
      case "bulletList":
        return `• ${block.content}`;
      case "numberedList":
        return `1. ${block.content}`;
      case "todo":
        const checked = (block as TodoBlock).properties.checked ? "[x]" : "[ ]";
        return `${checked} ${block.content}`;
      case "quote":
        return `> ${block.content}`;
      case "code":
        return `\`\`\`\n${block.content}\n\`\`\``;
      case "divider":
        return "---";
      default:
        return block.content;
    }
  }).join('\n');
};