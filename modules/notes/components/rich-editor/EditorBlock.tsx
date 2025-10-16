"use client";

import { forwardRef, useCallback, useRef, useEffect } from 'react';
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

export interface EditorBlockProps {
  block: Block;
  isFocused: boolean;
  placeholder?: string;
  onChange: (content: string, properties?: Record<string, any>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onEnterKey: (cursorPosition: number) => void;
  onBackspaceAtStart: () => void;
  onSlashTrigger: (position: number, query: string, element: HTMLElement) => void;
  onClearSlashTrigger: () => void;
}

export const EditorBlock = forwardRef<HTMLDivElement, EditorBlockProps>(({
  block,
  isFocused,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  onEnterKey,
  onBackspaceAtStart,
  onSlashTrigger,
  onClearSlashTrigger,
}, ref) => {
  const blockRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    
    switch (event.key) {
      case 'Enter':
        if (event.shiftKey) {
          // Shift+Enter: Allow new line within block (default behavior for textarea)
          return;
        } else {
          // Enter: Create new block (like Notion)
          event.preventDefault();
          const cursorPosition = target.selectionStart || 0;
          onEnterKey(cursorPosition);
        }
        break;
        
      case 'Backspace':
        if (target.selectionStart === 0 && target.selectionEnd === 0) {
          // At the beginning of the block
          if (block.content === '') {
            event.preventDefault();
            onBackspaceAtStart();
          }
        }
        break;
    }
  }, [block.content, block.type, onEnterKey, onBackspaceAtStart]);

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
    onChange(block.content, properties);
  }, [onChange, block.content]);

  // Handle keyboard events via React event handlers
  const handleReactKeyDown = useCallback((e: React.KeyboardEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
          // Shift+Enter: Allow new line within block (default behavior for textarea)
          return;
        } else {
          // Enter: Create new block (like Notion)
          e.preventDefault();
          const cursorPosition = target.selectionStart || 0;
          onEnterKey(cursorPosition);
        }
        break;
        
      case 'Backspace':
        if (target.selectionStart === 0 && target.selectionEnd === 0) {
          // At the beginning of the block
          if (block.content === '') {
            e.preventDefault();
            onBackspaceAtStart();
          }
        }
        break;
    }
  }, [block.content, onEnterKey, onBackspaceAtStart]);

  // Render the appropriate block component
  const renderBlock = () => {
    const baseProps = {
      content: block.content,
      placeholder,
      isFocused,
      onChange: handleContentChange,
      onPropertyChange: handlePropertyChange,
      onKeyDown: handleReactKeyDown,
      onFocus,
      onBlur,
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
        return <ListBlock {...baseProps} properties={block.properties} listType={block.type === 'bulletList' ? 'bullet' : 'numbered'} />;
      
      case 'todo':
        return <TodoBlock {...baseProps} properties={block.properties} />;
      
      case 'toggle':
        return <ToggleBlock {...baseProps} properties={block.properties} />;
      
      case 'quote':
        return <QuoteBlock {...baseProps} />;
      
      case 'divider':
        return <DividerBlock {...baseProps} />;
      
      case 'code':
        return <CodeBlock {...baseProps} properties={block.properties} />;
      
      case 'callout':
        return <CalloutBlock {...baseProps} properties={block.properties} />;
      
      // TODO: Implement image and table blocks
      case 'image':
        return (
          <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md text-center text-muted-foreground">
            Image block (coming soon)
          </div>
        );
      
      case 'table':
        return (
          <div className="p-4 border border-dashed border-muted-foreground/30 rounded-md text-center text-muted-foreground">
            Table block (coming soon)
          </div>
        );
      
      default:
        return <TextBlock {...baseProps} />;
    }
  };

  return (
    <div 
      ref={ref || blockRef}
      className={`editor-block group relative ${isFocused ? 'focused' : ''}`}
      data-block-id={block.id}
      data-block-type={block.type}
      style={{ marginBottom: '1px' }}
    >
      {renderBlock()}
    </div>
  );
});

EditorBlock.displayName = 'EditorBlock';