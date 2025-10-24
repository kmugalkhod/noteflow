import { type Block } from "../types/blocks";
import { segmentsToString } from "./textFormatting";

/**
 * Convert blocks to Markdown format
 */
export function blocksToMarkdown(blocks: Block[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    const contentStr = typeof block.content === 'string'
      ? block.content
      : segmentsToString(block.content);

    switch (block.type) {
      case 'heading1':
        lines.push(`# ${contentStr}`);
        break;

      case 'heading2':
        lines.push(`## ${contentStr}`);
        break;

      case 'heading3':
        lines.push(`### ${contentStr}`);
        break;

      case 'bulletList': {
        const level = (block.properties as any)?.level || 0;
        const indent = '  '.repeat(level);
        lines.push(`${indent}- ${contentStr}`);
        break;
      }

      case 'numberedList': {
        const level = (block.properties as any)?.level || 0;
        const indent = '  '.repeat(level);
        lines.push(`${indent}1. ${contentStr}`);
        break;
      }

      case 'todo': {
        const checked = (block.properties as any)?.checked || false;
        lines.push(`- [${checked ? 'x' : ' '}] ${contentStr}`);
        break;
      }

      case 'quote':
        // Split into lines and prefix each with >
        const quoteLines = contentStr.split('\n');
        quoteLines.forEach(line => lines.push(`> ${line}`));
        break;

      case 'code': {
        const language = (block.properties as any)?.language || '';
        lines.push(`\`\`\`${language}`);
        lines.push(contentStr);
        lines.push('```');
        break;
      }

      case 'divider':
        lines.push('---');
        break;

      case 'callout': {
        const emoji = (block.properties as any)?.emoji || '💡';
        lines.push(`> ${emoji} ${contentStr}`);
        break;
      }

      case 'toggle':
        // Represent toggles as collapsed sections (not standard markdown, but readable)
        lines.push(`<details>`);
        lines.push(`<summary>${contentStr}</summary>`);
        lines.push(`</details>`);
        break;

      case 'image': {
        const caption = (block.properties as any)?.caption || '';
        const url = contentStr || '';
        lines.push(`![${caption}](${url})`);
        break;
      }

      case 'table':
        // Tables would need more complex parsing - for now just preserve as code block
        lines.push('```');
        lines.push(contentStr);
        lines.push('```');
        break;

      case 'paragraph':
      default:
        lines.push(contentStr);
        break;
    }

    // Add blank line between blocks
    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * Export note to Markdown file
 */
export function exportNoteToMarkdown(title: string, blocks: Block[]): void {
  const markdown = `# ${title}\n\n${blocksToMarkdown(blocks)}`;

  // Create blob and download
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || 'Untitled'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
