"use client";

import { forwardRef, useCallback, useRef } from 'react';
import type { Block } from '../../types/blocks';
import { TextBlock } from '../blocks/TextBlock';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ListBlock } from '../blocks/ListBlock';
import { TodoBlock } from '../blocks/TodoBlock';
import { QuoteBlock } from '../blocks/QuoteBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { CodeBlock } from '../blocks/CodeBlock';
import { CalloutBlock } from '../blocks/CalloutBlock';
import { ToggleBlock } from '../blocks/ToggleBlock';
import { ImageBlock } from '../blocks/ImageBlock';
import { TableBlock } from '../blocks/TableBlock';
import { detectMarkdownOnSpace } from '../../utils/markdownShortcuts';
import { BlockActionsMenu } from './BlockActionsMenu';
import { segmentsToString } from '../../utils/textFormatting';

export interface EditorBlockProps {
  block: Block;
  isFocused: boolean;
  placeholder?: string;
  onChange: (content: string, properties?: Record<string, any>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onEnterKey: (cursorPosition: number, isEmptyBlock: boolean, shiftKey: boolean) => void;
  onEscapeKey: () => void;
  onBackspaceAtStart: () => void;
  onSlashTrigger: (position: number, query: string, element: HTMLElement) => void;
  onClearSlashTrigger: () => void;
  onMarkdownTransform?: (newType: Block['type'], newContent: string, cursorPosition: number) => void;
  onTextSelect?: (start: number, end: number) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onTransform?: (newType: Block['type']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  canDelete?: boolean;
  listNumber?: number;
}

export const EditorBlock = forwardRef<HTMLDivElement, EditorBlockProps>(({
  block,
  isFocused,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  onEnterKey,
  onEscapeKey,
  onBackspaceAtStart,
  onSlashTrigger,
  onClearSlashTrigger,
  onMarkdownTransform,
  onTextSelect,
  onDuplicate,
  onDelete,
  onTransform,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  canDelete = true,
  listNumber = 1,
}, ref) => {
  const blockRef = useRef<HTMLDivElement>(null);

  // Handle content changes and slash trigger detection
  const handleContentChange = useCallback((newContent: string, element?: HTMLElement) => {
    onChange(newContent);
    
    // Check for slash trigger
    const inputElement = element || (blockRef.current?.querySelector('input, textarea, [contenteditable]') as HTMLElement);
    if (!inputElement) return;
    
    const cursorPosition = (inputElement as HTMLInputElement).selectionStart || 0;
    const textBeforeCursor = newContent.substring(0, cursorPosition);
    
    // Check if we have a slash at the start of line or after space
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const words = currentLine.split(' ');
    const currentWord = words[words.length - 1];
    
    if (currentWord.startsWith('/')) {
      const query = currentWord.substring(1);
      onSlashTrigger(cursorPosition, query, inputElement);
    } else {
      onClearSlashTrigger();
    }
  }, [onChange, onSlashTrigger, onClearSlashTrigger]);

  // Handle property changes (for blocks like todo, toggle, etc.)
  const handlePropertyChange = useCallback((properties: Record<string, any>) => {
    const contentStr = typeof block.content === 'string' ? block.content : segmentsToString(block.content);
    onChange(contentStr, properties);
  }, [onChange, block.content]);

  // Handle keyboard events via React event handlers
  const handleReactKeyDown = useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;

    // Special handling for divider blocks
    if (block.type === 'divider') {
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnterKey(0, true, false); // Create new paragraph after divider
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspaceAtStart(); // Delete the divider
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onEscapeKey(); // Convert to paragraph (which will be empty and can be deleted)
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
        // For multiline blocks (paragraph, quote, code): Enter adds newline
        const multilineBlocks = ['paragraph', 'quote', 'code'];

        if (multilineBlocks.includes(block.type)) {
          if (e.shiftKey) {
            // Shift+Enter: Exit block and create new paragraph
            e.preventDefault();
            const cursorPosition = target.selectionStart || 0;
            onEnterKey(cursorPosition, false, true);
          } else {
            // Enter: Allow newline within block (default textarea behavior)
            // Check if on an empty line (for double-enter exit behavior)
            const cursorPosition = target.selectionStart || 0;
            const contentStr = typeof block.content === 'string' ? block.content : segmentsToString(block.content);
            const textBeforeCursor = contentStr.substring(0, cursorPosition);
            const textAfterCursor = contentStr.substring(cursorPosition);
            const lines = textBeforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];

            // If current line is empty and we're at the end, exit block
            if (currentLine === '' && textAfterCursor.trim() === '') {
              e.preventDefault();
              onEnterKey(cursorPosition, true, false);
            }
            // Otherwise allow default newline behavior
          }
        } else {
          // For single-line blocks: Enter creates new block
          if (e.shiftKey) {
            // Shift+Enter: Allow new line within block (for future multiline support)
            return;
          } else {
            // Enter: Create new block or exit formatting if empty
            e.preventDefault();
            const cursorPosition = target.selectionStart || 0;
            const contentStr = typeof block.content === 'string' ? block.content : segmentsToString(block.content);
            const isEmptyBlock = contentStr === '';
            onEnterKey(cursorPosition, isEmptyBlock, false);
          }
        }
        break;

      case 'Escape':
        // Escape: Exit block formatting
        e.preventDefault();
        onEscapeKey();
        break;

      case 'Tab':
        // Handle Tab key for list indentation
        if (block.type === 'bulletList' || block.type === 'numberedList') {
          e.preventDefault();
          const currentLevel = (block.properties as any)?.level || 0;

          if (e.shiftKey) {
            // Shift+Tab: Decrease indent (outdent)
            if (currentLevel > 0) {
              handlePropertyChange({ level: currentLevel - 1 });
            }
          } else {
            // Tab: Increase indent
            if (currentLevel < 3) { // Max 3 levels
              handlePropertyChange({ level: currentLevel + 1 });
            }
          }
        }
        break;

      case ' ':
        // Detect markdown shortcuts when space is pressed
        if (onMarkdownTransform && block.type === 'paragraph') {
          const cursorPosition = target.selectionStart || 0;
          const contentStr = typeof block.content === 'string' ? block.content : segmentsToString(block.content);
          const markdown = detectMarkdownOnSpace(contentStr, cursorPosition);

          if (markdown) {
            e.preventDefault();
            onMarkdownTransform(markdown.type, markdown.content, markdown.newCursorPosition);
          }
        }
        break;

      case 'Backspace':
        if (target.selectionStart === 0 && target.selectionEnd === 0) {
          // At the beginning of the block
          const contentStr = typeof block.content === 'string' ? block.content : segmentsToString(block.content);
          if (contentStr === '') {
            e.preventDefault();
            onBackspaceAtStart();
          }
        }
        break;
    }
  }, [block.content, block.type, block.properties, onEnterKey, onEscapeKey, onBackspaceAtStart, onMarkdownTransform, handlePropertyChange]);

  // Render the appropriate block component
  const renderBlock = () => {
    const fontSize = (block.properties as any)?.fontSize as 'small' | 'normal' | 'large' | undefined;

    const baseProps = {
      content: block.content,
      placeholder,
      isFocused,
      onChange: handleContentChange,
      onPropertyChange: handlePropertyChange,
      onKeyDown: handleReactKeyDown,
      onFocus,
      onBlur,
      onSelect: onTextSelect,
      fontSize,
    };

    switch (block.type) {
      case 'paragraph':
        return <TextBlock {...baseProps} />;

      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <HeadingBlock {...baseProps} level={parseInt(block.type.slice(-1))} />;

      case 'bulletList':
      case 'numberedList':
        return <ListBlock {...baseProps} properties={block.properties} listType={block.type === 'bulletList' ? 'bullet' : 'numbered'} listNumber={listNumber} />;

      case 'todo':
        return <TodoBlock {...baseProps} properties={block.properties} />;

      case 'toggle':
        return <ToggleBlock {...baseProps} properties={block.properties} />;

      case 'quote':
        return <QuoteBlock {...baseProps} />;

      case 'divider':
        return <DividerBlock
          isFocused={isFocused}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleReactKeyDown}
        />;

      case 'code':
        return <CodeBlock {...baseProps} properties={block.properties} />;

      case 'callout':
        return <CalloutBlock {...baseProps} properties={block.properties} />;

      case 'image':
        return <ImageBlock
          content={typeof block.content === 'string' ? block.content : segmentsToString(block.content)}
          placeholder={placeholder}
          isFocused={isFocused}
          properties={block.properties}
          onChange={handleContentChange}
          onPropertyChange={handlePropertyChange}
          onKeyDown={handleReactKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        />;

      case 'table':
        return <TableBlock
          content={typeof block.content === 'string' ? block.content : segmentsToString(block.content)}
          placeholder={placeholder}
          isFocused={isFocused}
          properties={block.properties}
          onChange={handleContentChange}
          onPropertyChange={handlePropertyChange}
          onKeyDown={handleReactKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        />;

      default:
        return <TextBlock {...baseProps} />;
    }
  };

  return (
    <div
      ref={ref || blockRef}
      className={`editor-block group relative transition-colors ${isFocused ? 'focused' : ''}`}
      data-block-id={block.id}
      data-block-type={block.type}
      style={{ marginBottom: '8px' }}
    >
      {/* Block Actions Menu */}
      {onDuplicate && onDelete && onTransform && onMoveUp && onMoveDown && (
        <BlockActionsMenu
          blockId={block.id}
          blockType={block.type}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          canDelete={canDelete}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onTransform={onTransform}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      )}

      <div className="relative hover:bg-accent/10 rounded-md transition-all duration-100 ease-in-out">
        {renderBlock()}
      </div>
    </div>
  );
});

EditorBlock.displayName = 'EditorBlock';