"use client";

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorBlock } from './EditorBlock';
import { SlashMenu, useSlashMenu, type SlashCommand } from '../slash-menu';
import { 
  createBlock, 
  serializeBlocks, 
  deserializeBlocks, 
  textToBlocks,
  type Block, 
  type EditorState,
  type BlockType 
} from '../../types/blocks';

export interface RichEditorRef {
  focus: () => void;
  getBlocks: () => Block[];
  setBlocks: (blocks: Block[]) => void;
  insertBlock: (type: BlockType, content?: string) => void;
}

interface RichEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (blocks: Block[], serialized: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export const RichEditor = forwardRef<RichEditorRef, RichEditorProps>(({
  initialContent = '',
  placeholder = 'Type \'/\' for commands',
  onChange,
  onFocus,
  onBlur,
  className = '',
}, ref) => {
  const [editorState, setEditorState] = useState<EditorState>({
    blocks: [],
    focusedBlockId: undefined,
  });

  const [slashTrigger, setSlashTrigger] = useState<{
    blockId: string;
    position: number;
    query: string;
  } | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isUserChangeRef = useRef(false);

  // Initialize blocks from content
  useEffect(() => {
    if (initialContent) {
      try {
        // Try to parse as JSON first (rich content)
        const parsedBlocks = deserializeBlocks(initialContent);
        if (parsedBlocks.length > 0) {
          setEditorState(prev => ({ ...prev, blocks: parsedBlocks }));
          setIsInitialized(true);
          return;
        }
      } catch {
        // Fall back to plain text conversion
      }
      
      // Convert plain text to blocks
      const blocks = textToBlocks(initialContent);
      setEditorState(prev => ({ ...prev, blocks: blocks.length > 0 ? blocks : [createBlock('paragraph')] }));
    } else {
      // Start with empty paragraph
      setEditorState(prev => ({ ...prev, blocks: [createBlock('paragraph')] }));
    }
    setIsInitialized(true);
  }, [initialContent]);

  // Slash menu logic
  const handleSlashCommand = useCallback((command: SlashCommand) => {
    if (!slashTrigger) return;

    const { blockId } = slashTrigger;
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    
    if (blockIndex === -1) return;

    const newBlocks = [...editorState.blocks];
    const currentBlock = newBlocks[blockIndex];
    
    // Remove the slash trigger from the content
    const content = currentBlock.content;
    const slashIndex = content.lastIndexOf('/');
    const newContent = content.substring(0, slashIndex) + content.substring(slashIndex + 1 + slashTrigger.query.length);
    
    // Create new block of the selected type
    const newBlock = createBlock(command.blockType, newContent);
    newBlocks[blockIndex] = newBlock;
    
    isUserChangeRef.current = true; // Mark as user-initiated change
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: newBlock.id,
    }));

    setSlashTrigger(null);
    
    // Focus the new block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(newBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) {
          input.focus();
          // Set cursor to end
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }
      }
    }, 10);
  }, [slashTrigger, editorState.blocks]);

  const slashMenu = useSlashMenu({
    onSelectCommand: handleSlashCommand,
    onClose: () => setSlashTrigger(null),
  });

  // Handle content changes
  const handleBlockChange = useCallback((blockId: string, newContent: string, newProperties?: Record<string, any>) => {
    isUserChangeRef.current = true; // Mark as user-initiated change
    setEditorState(prev => {
      const newBlocks = prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: newContent, ...(newProperties && { properties: { ...block.properties, ...newProperties } }) } as Block
          : block
      );
      
      return { ...prev, blocks: newBlocks };
    });
  }, []);

  // Trigger onChange when blocks change from user interaction
  useEffect(() => {
    if (onChange && isInitialized && isUserChangeRef.current) {
      const serialized = serializeBlocks(editorState.blocks);
      onChange(editorState.blocks, serialized);
      isUserChangeRef.current = false; // Reset flag
    }
  }, [editorState.blocks, onChange, isInitialized]);

  // Handle slash trigger detection
  const handleSlashTrigger = useCallback((blockId: string, position: number, query: string, element: HTMLElement) => {
    if (query.length === 0) {
      // Just opened slash menu
      slashMenu.openMenu(element, position, '');
      setSlashTrigger({ blockId, position, query: '' });
    } else {
      // Update query
      slashMenu.updateQuery(query);
      setSlashTrigger(prev => prev ? { ...prev, query } : null);
    }
  }, [slashMenu]);

  // Handle clearing slash trigger
  const handleClearSlashTrigger = useCallback(() => {
    setSlashTrigger(null);
    slashMenu.closeMenu();
  }, [slashMenu]);

  // Handle Enter key to create new blocks
  const handleEnterKey = useCallback((blockId: string, cursorPosition: number) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const currentBlock = editorState.blocks[blockIndex];
    const content = currentBlock.content;
    
    // Split content at cursor position
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    
    const newBlocks = [...editorState.blocks];
    
    // Update current block with content before cursor
    newBlocks[blockIndex] = { ...currentBlock, content: beforeCursor } as Block;
    
    // Create new block with content after cursor
    const newBlock = createBlock('paragraph', afterCursor);
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    
    isUserChangeRef.current = true; // Mark as user-initiated change
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: newBlock.id,
    }));
    
    // Focus new block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(newBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) {
          input.focus();
          // Set cursor to beginning
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.setSelectionRange(0, 0);
          }
        }
      }
    }, 10);
  }, [editorState.blocks]);

  // Handle backspace at beginning of block
  const handleBackspaceAtStart = useCallback((blockId: string) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex <= 0) return; // Can't delete first block or invalid block

    const newBlocks = [...editorState.blocks];
    const currentBlock = newBlocks[blockIndex];
    const previousBlock = newBlocks[blockIndex - 1];
    
    // Merge content into previous block
    const mergedContent = previousBlock.content + currentBlock.content;
    const cursorPosition = previousBlock.content.length;
    
    newBlocks[blockIndex - 1] = { ...previousBlock, content: mergedContent } as Block;
    newBlocks.splice(blockIndex, 1);
    
    isUserChangeRef.current = true; // Mark as user-initiated change
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: previousBlock.id,
    }));
    
    // Focus previous block with cursor at merge point
    setTimeout(() => {
      const blockElement = blockRefs.current.get(previousBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) {
          input.focus();
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }
    }, 10);
  }, [editorState.blocks]);

  // Handle block focus
  const handleBlockFocus = useCallback((blockId: string) => {
    setEditorState(prev => ({ ...prev, focusedBlockId: blockId }));
    if (onFocus) onFocus();
  }, [onFocus]);

  // Handle block blur
  const handleBlockBlur = useCallback(() => {
    setEditorState(prev => ({ ...prev, focusedBlockId: undefined }));
    if (onBlur) onBlur();
  }, [onBlur]);

  // Global keyboard handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slashMenu.handleKeyDown(event)) {
        return; // Slash menu handled the event
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [slashMenu]);

  // Expose editor methods through ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorState.blocks.length > 0) {
        const firstBlock = editorState.blocks[0];
        const blockElement = blockRefs.current.get(firstBlock.id);
        if (blockElement) {
          const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
          if (input) input.focus();
        }
      }
    },
    getBlocks: () => editorState.blocks,
    setBlocks: (blocks: Block[]) => {
      setEditorState(prev => ({ ...prev, blocks }));
    },
    insertBlock: (type: BlockType, content = '') => {
      const newBlock = createBlock(type, content);
      setEditorState(prev => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
        focusedBlockId: newBlock.id,
      }));
    },
  }), [editorState.blocks]);

  return (
    <div 
      ref={editorRef}
      className={`rich-editor relative ${className}`}
      onClick={(e) => {
        // Focus last block if clicking in empty space
        if (e.target === editorRef.current && editorState.blocks.length > 0) {
          const lastBlock = editorState.blocks[editorState.blocks.length - 1];
          const blockElement = blockRefs.current.get(lastBlock.id);
          if (blockElement) {
            const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
            if (input) input.focus();
          }
        }
      }}
    >
      {editorState.blocks.map((block, index) => (
        <EditorBlock
          key={block.id}
          block={block}
          isFocused={editorState.focusedBlockId === block.id}
          placeholder={index === 0 && block.content === '' ? placeholder : undefined}
          onChange={(content, properties) => handleBlockChange(block.id, content, properties)}
          onFocus={() => handleBlockFocus(block.id)}
          onBlur={handleBlockBlur}
          onEnterKey={(cursorPosition) => handleEnterKey(block.id, cursorPosition)}
          onBackspaceAtStart={() => handleBackspaceAtStart(block.id)}
          onSlashTrigger={(position, query, element) => handleSlashTrigger(block.id, position, query, element)}
          onClearSlashTrigger={handleClearSlashTrigger}
          ref={(el) => {
            if (el) {
              blockRefs.current.set(block.id, el);
            } else {
              blockRefs.current.delete(block.id);
            }
          }}
        />
      ))}
      
      {/* Slash Menu */}
      <SlashMenu 
        state={slashMenu.state}
        menuRef={slashMenu.menuRef as React.RefObject<HTMLDivElement>}
        onSelectCommand={(command, index) => slashMenu.selectCommand(index)}
      />
    </div>
  );
});

RichEditor.displayName = 'RichEditor';