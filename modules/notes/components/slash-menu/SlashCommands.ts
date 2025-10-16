import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  ChevronRight, 
  Quote, 
  Minus, 
  Code, 
  Image, 
  Table, 
  AlertCircle 
} from "lucide-react";
import type { BlockType } from "../../types/blocks";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  aliases: string[];
  category: 'basic' | 'advanced';
  blockType: BlockType;
  execute: (insertBlock: (type: BlockType) => void) => void;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // Basic blocks
  {
    id: 'text',
    label: 'Text',
    description: 'Just start writing with plain text.',
    icon: Type,
    aliases: ['text', 'p', 'paragraph'],
    category: 'basic',
    blockType: 'paragraph',
    execute: (insertBlock) => insertBlock('paragraph'),
  },
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Big section heading.',
    icon: Heading1,
    aliases: ['h1', 'heading1', '#'],
    category: 'basic',
    blockType: 'heading1',
    execute: (insertBlock) => insertBlock('heading1'),
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading.',
    icon: Heading2,
    aliases: ['h2', 'heading2', '##'],
    category: 'basic',
    blockType: 'heading2',
    execute: (insertBlock) => insertBlock('heading2'),
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section heading.',
    icon: Heading3,
    aliases: ['h3', 'heading3', '###'],
    category: 'basic',
    blockType: 'heading3',
    execute: (insertBlock) => insertBlock('heading3'),
  },
  {
    id: 'bullet',
    label: 'Bullet List',
    description: 'Create a simple bullet list.',
    icon: List,
    aliases: ['bullet', 'ul', 'list', '-'],
    category: 'basic',
    blockType: 'bulletList',
    execute: (insertBlock) => insertBlock('bulletList'),
  },
  {
    id: 'number',
    label: 'Numbered List',
    description: 'Create a list with numbering.',
    icon: ListOrdered,
    aliases: ['number', 'ol', 'numbered', '1.', '1'],
    category: 'basic',
    blockType: 'numberedList',
    execute: (insertBlock) => insertBlock('numberedList'),
  },
  {
    id: 'todo',
    label: 'To-do List',
    description: 'Track tasks with a to-do list.',
    icon: CheckSquare,
    aliases: ['todo', 'task', 'check', '[]'],
    category: 'basic',
    blockType: 'todo',
    execute: (insertBlock) => insertBlock('todo'),
  },
  {
    id: 'toggle',
    label: 'Toggle List',
    description: 'Toggleable list.',
    icon: ChevronRight,
    aliases: ['toggle', 'collapsible'],
    category: 'basic',
    blockType: 'toggle',
    execute: (insertBlock) => insertBlock('toggle'),
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Capture a quote.',
    icon: Quote,
    aliases: ['quote', 'blockquote', '>'],
    category: 'basic',
    blockType: 'quote',
    execute: (insertBlock) => insertBlock('quote'),
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Visually divide blocks.',
    icon: Minus,
    aliases: ['divider', 'hr', 'separator', '---'],
    category: 'basic',
    blockType: 'divider',
    execute: (insertBlock) => insertBlock('divider'),
  },
  
  // Advanced blocks
  {
    id: 'code',
    label: 'Code',
    description: 'Capture a code snippet.',
    icon: Code,
    aliases: ['code', 'codeblock', '```'],
    category: 'advanced',
    blockType: 'code',
    execute: (insertBlock) => insertBlock('code'),
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Upload or embed with a link.',
    icon: Image,
    aliases: ['image', 'img', 'picture', 'photo'],
    category: 'advanced',
    blockType: 'image',
    execute: (insertBlock) => insertBlock('image'),
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Create a table.',
    icon: Table,
    aliases: ['table', 'grid'],
    category: 'advanced',
    blockType: 'table',
    execute: (insertBlock) => insertBlock('table'),
  },
  {
    id: 'callout',
    label: 'Callout',
    description: 'Make writing stand out.',
    icon: AlertCircle,
    aliases: ['callout', 'note', 'info'],
    category: 'advanced',
    blockType: 'callout',
    execute: (insertBlock) => insertBlock('callout'),
  },
];

export const filterCommands = (query: string): SlashCommand[] => {
  const trimmedQuery = query.toLowerCase().trim();
  
  if (!trimmedQuery) {
    return SLASH_COMMANDS;
  }
  
  return SLASH_COMMANDS.filter(command => {
    // Check if query matches any alias
    return command.aliases.some(alias => 
      alias.toLowerCase().startsWith(trimmedQuery)
    ) || 
    command.label.toLowerCase().includes(trimmedQuery) ||
    command.description.toLowerCase().includes(trimmedQuery);
  });
};

export const getCommandByAlias = (alias: string): SlashCommand | undefined => {
  return SLASH_COMMANDS.find(command =>
    command.aliases.some(a => a.toLowerCase() === alias.toLowerCase())
  );
};