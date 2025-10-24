"use client";

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EditorBlock } from './EditorBlock';
import { SlashMenu, useSlashMenu, type SlashCommand } from '../slash-menu';
import { FormattingToolbar } from './FormattingToolbar';
import {
  createBlock,
  serializeBlocks,
  deserializeBlocks,
  textToBlocks,
  type Block,
  type EditorState,
  type BlockType,
  type TextColor,
  type FormattedContent,
} from '../../types/blocks';
import { useEditorHistory } from '../../hooks/useEditorHistory';
import {
  applyFormatting,
  applyColor,
  applyHighlight,
  getActiveFormatsAtPosition,
  segmentsToString,
  type TextSelection,
} from '../../utils/textFormatting';

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

  const [textSelection, setTextSelection] = useState<{
    blockId: string;
    start: number;
    end: number;
  } | null>(null);

  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isUserChangeRef = useRef(false);

  // Initialize history
  const history = useEditorHistory(editorState.blocks);

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
    const content = currentBlock.content as string;
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
  const handleBlockChange = useCallback((blockId: string, newContent: string | FormattedContent, newProperties?: Record<string, any>) => {
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

      // Push to history
      history.pushHistory({
        blocks: editorState.blocks,
        focusedBlockId: editorState.focusedBlockId
      });

      isUserChangeRef.current = false; // Reset flag
    }
  }, [editorState.blocks, editorState.focusedBlockId, onChange, isInitialized, history]);

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
  const handleEnterKey = useCallback((blockId: string, cursorPosition: number, isEmptyBlock: boolean, shiftKey: boolean = false) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const currentBlock = editorState.blocks[blockIndex];
    const content = typeof currentBlock.content === 'string'
      ? currentBlock.content
      : segmentsToString(currentBlock.content);

    // If it's an empty block (double Enter scenario), convert to paragraph
    if (isEmptyBlock && currentBlock.type !== 'paragraph' && currentBlock.type !== 'divider') {
      const newBlocks = [...editorState.blocks];
      const newBlock = createBlock('paragraph', '');
      newBlocks[blockIndex] = newBlock;

      isUserChangeRef.current = true;
      setEditorState(prev => ({
        ...prev,
        blocks: newBlocks,
        focusedBlockId: newBlock.id,
      }));

      setTimeout(() => {
        const blockElement = blockRefs.current.get(newBlock.id);
        if (blockElement) {
          const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
          if (input) input.focus();
        }
      }, 10);
      return;
    }

    // Split content at cursor position
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);

    const newBlocks = [...editorState.blocks];

    // Update current block with content before cursor
    newBlocks[blockIndex] = { ...currentBlock, content: beforeCursor } as Block;

    // Determine the type for the new block
    let newBlockType: BlockType = 'paragraph';

    // For code blocks with Shift+Enter, always create a paragraph
    if (currentBlock.type === 'code' && shiftKey) {
      newBlockType = 'paragraph';
    } else {
      // For these block types, create a new block of the same type
      const continuousBlockTypes: BlockType[] = [
        'bulletList', 'numberedList', 'todo', 'quote', 'callout', 'toggle'
      ];

      if (continuousBlockTypes.includes(currentBlock.type)) {
        newBlockType = currentBlock.type;
      }
    }

    // Create new block with content after cursor, preserving properties for certain types
    let newBlock: Block;
    if (newBlockType === currentBlock.type && currentBlock.properties) {
      // Preserve certain properties (like language for code, color for callout)
      const propertiesToCopy: Record<string, any> = {};
      const props = currentBlock.properties as any;

      if (newBlockType === 'code' && props.language) {
        propertiesToCopy.language = props.language;
      } else if (newBlockType === 'callout') {
        propertiesToCopy.icon = props.icon || '💡';
        propertiesToCopy.color = props.color || 'default';
      } else if (newBlockType === 'todo') {
        propertiesToCopy.checked = false; // Always start new todos unchecked
      } else if (newBlockType === 'toggle') {
        propertiesToCopy.open = false; // Always start new toggles closed
      } else if ((newBlockType === 'bulletList' || newBlockType === 'numberedList') && props.level !== undefined) {
        propertiesToCopy.level = props.level;
      }

      newBlock = createBlock(newBlockType, afterCursor, propertiesToCopy);
    } else {
      newBlock = createBlock(newBlockType, afterCursor);
    }

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

  // Handle Escape key to exit block formatting
  const handleEscapeKey = useCallback((blockId: string) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const currentBlock = editorState.blocks[blockIndex];

    // For code blocks, create a new paragraph block below and focus it
    if (currentBlock.type === 'code') {
      const newBlock = createBlock('paragraph', '');
      const newBlocks = [...editorState.blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);

      isUserChangeRef.current = true;
      setEditorState(prev => ({
        ...prev,
        blocks: newBlocks,
        focusedBlockId: newBlock.id,
      }));

      setTimeout(() => {
        const blockElement = blockRefs.current.get(newBlock.id);
        if (blockElement) {
          const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
          if (input) input.focus();
        }
      }, 10);
      return;
    }

    // Convert non-paragraph blocks to paragraph
    if (currentBlock.type !== 'paragraph') {
      const newBlocks = [...editorState.blocks];
      const contentStr = typeof currentBlock.content === 'string'
        ? currentBlock.content
        : segmentsToString(currentBlock.content);
      const newBlock = createBlock('paragraph', contentStr);
      newBlocks[blockIndex] = newBlock;

      isUserChangeRef.current = true;
      setEditorState(prev => ({
        ...prev,
        blocks: newBlocks,
        focusedBlockId: newBlock.id,
      }));

      setTimeout(() => {
        const blockElement = blockRefs.current.get(newBlock.id);
        if (blockElement) {
          const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
          if (input) input.focus();
        }
      }, 10);
    }
  }, [editorState.blocks]);

  // Handle backspace at beginning of block
  const handleBackspaceAtStart = useCallback((blockId: string) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex <= 0) return; // Can't delete first block or invalid block

    const newBlocks = [...editorState.blocks];
    const currentBlock = newBlocks[blockIndex];
    const previousBlock = newBlocks[blockIndex - 1];

    // Merge content into previous block
    const prevContentStr = typeof previousBlock.content === 'string'
      ? previousBlock.content
      : segmentsToString(previousBlock.content);
    const currContentStr = typeof currentBlock.content === 'string'
      ? currentBlock.content
      : segmentsToString(currentBlock.content);
    const mergedContent = prevContentStr + currContentStr;
    const cursorPosition = prevContentStr.length;

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

  // Handle markdown transformation
  const handleMarkdownTransform = useCallback((blockId: string, newType: BlockType, newContent: string, cursorPosition: number) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...editorState.blocks];
    const currentBlock = newBlocks[blockIndex];

    // Create new block with transformed type
    const newBlock = createBlock(newType, newContent, currentBlock.properties);
    newBlocks[blockIndex] = newBlock;

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: newBlock.id,
    }));

    // Focus and set cursor position
    setTimeout(() => {
      const blockElement = blockRefs.current.get(newBlock.id);
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

  // Handle text selection
  const handleTextSelection = useCallback((blockId: string, start: number, end: number) => {
    if (start !== end) {
      setTextSelection({ blockId, start, end });
      setShowFormattingToolbar(true);
    } else {
      setShowFormattingToolbar(false);
      setTextSelection(null);
    }
  }, []);

  // Apply text formatting
  const handleApplyFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    if (!textSelection) return;

    const { blockId, start, end } = textSelection;
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = editorState.blocks[blockIndex];
    const formatted = applyFormatting(block.content, { start, end }, format);

    const newBlocks = [...editorState.blocks];
    newBlocks[blockIndex] = { ...block, content: formatted } as Block;

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
    }));
  }, [textSelection, editorState.blocks]);

  // Apply text color
  const handleApplyColor = useCallback((color: TextColor) => {
    if (!textSelection) return;

    const { blockId, start, end } = textSelection;
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = editorState.blocks[blockIndex];
    console.log('Applying color:', color, 'to block:', blockId);
    console.log('Original content:', JSON.stringify(block.content));
    const formatted = applyColor(block.content, { start, end }, color);
    console.log('Formatted with color:', JSON.stringify(formatted));

    const newBlocks = [...editorState.blocks];
    newBlocks[blockIndex] = { ...block, content: formatted } as Block;

    console.log('Updated block:', JSON.stringify(newBlocks[blockIndex]));

    isUserChangeRef.current = true;
    setEditorState(prev => {
      console.log('Setting new editor state');
      return {
        ...prev,
        blocks: newBlocks,
      };
    });
  }, [textSelection, editorState.blocks]);

  // Apply highlight color
  const handleApplyHighlight = useCallback((color: TextColor) => {
    if (!textSelection) return;

    const { blockId, start, end } = textSelection;
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = editorState.blocks[blockIndex];
    const formatted = applyHighlight(block.content, { start, end }, color);

    const newBlocks = [...editorState.blocks];
    newBlocks[blockIndex] = { ...block, content: formatted } as Block;

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
    }));
  }, [textSelection, editorState.blocks]);

  // Apply font size
  const handleApplyFontSize = useCallback((size: 'small' | 'normal' | 'large') => {
    if (!textSelection) return;

    const { blockId } = textSelection;
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const block = editorState.blocks[blockIndex];
    const newBlocks = [...editorState.blocks];
    newBlocks[blockIndex] = {
      ...block,
      properties: { ...block.properties, fontSize: size },
    } as Block;

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
    }));
  }, [textSelection, editorState.blocks]);

  // Get active formats at current selection
  const getActiveFormats = useCallback(() => {
    if (!textSelection) return {};

    const { blockId, start } = textSelection;
    const block = editorState.blocks.find(b => b.id === blockId);
    if (!block) return {};

    return getActiveFormatsAtPosition(block.content, start);
  }, [textSelection, editorState.blocks]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      setEditorState({
        blocks: previousState.blocks,
        focusedBlockId: previousState.focusedBlockId
      });
    }
  }, [history]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setEditorState({
        blocks: nextState.blocks,
        focusedBlockId: nextState.focusedBlockId
      });
    }
  }, [history]);

  // Handle duplicate block
  const handleDuplicateBlock = useCallback((blockId: string) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const blockToDuplicate = editorState.blocks[blockIndex];

    // Create a new block with the same type, content, and properties
    const contentStr = typeof blockToDuplicate.content === 'string'
      ? blockToDuplicate.content
      : segmentsToString(blockToDuplicate.content);
    const newBlock = createBlock(
      blockToDuplicate.type,
      contentStr,
      blockToDuplicate.properties
    );

    const newBlocks = [...editorState.blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: newBlock.id,
    }));

    // Focus the new duplicated block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(newBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) input.focus();
      }
    }, 10);
  }, [editorState.blocks]);

  // Handle delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    // Don't allow deleting the last block
    if (editorState.blocks.length <= 1) return;

    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...editorState.blocks];
    newBlocks.splice(blockIndex, 1);

    // Determine which block to focus after deletion
    const nextFocusIndex = blockIndex < newBlocks.length ? blockIndex : blockIndex - 1;
    const nextFocusBlock = newBlocks[nextFocusIndex];

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: nextFocusBlock.id,
    }));

    // Focus the next block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(nextFocusBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) input.focus();
      }
    }, 10);
  }, [editorState.blocks]);

  // Handle transform block
  const handleTransformBlock = useCallback((blockId: string, newType: BlockType) => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const currentBlock = editorState.blocks[blockIndex];

    // Create new block with transformed type
    // Preserve content but reset properties to defaults for the new type
    const contentStr = typeof currentBlock.content === 'string'
      ? currentBlock.content
      : segmentsToString(currentBlock.content);
    const newBlock = createBlock(newType, contentStr);

    const newBlocks = [...editorState.blocks];
    newBlocks[blockIndex] = newBlock;

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: newBlock.id,
    }));

    // Focus the transformed block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(newBlock.id);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) input.focus();
      }
    }, 10);
  }, [editorState.blocks]);

  // Handle move block
  const handleMoveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const blockIndex = editorState.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    // Check if move is valid
    if (direction === 'up' && blockIndex === 0) return;
    if (direction === 'down' && blockIndex === editorState.blocks.length - 1) return;

    const newBlocks = [...editorState.blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    // Swap blocks
    [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];

    isUserChangeRef.current = true;
    setEditorState(prev => ({
      ...prev,
      blocks: newBlocks,
      focusedBlockId: blockId, // Keep focus on the same block
    }));

    // Keep focus on the moved block
    setTimeout(() => {
      const blockElement = blockRefs.current.get(blockId);
      if (blockElement) {
        const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
        if (input) input.focus();
      }
    }, 10);
  }, [editorState.blocks]);

  // Global keyboard handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle formatting shortcuts
      if (textSelection) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
          event.preventDefault();
          handleApplyFormat('bold');
          return;
        }

        if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
          event.preventDefault();
          handleApplyFormat('italic');
          return;
        }

        if ((event.metaKey || event.ctrlKey) && event.key === 'u') {
          event.preventDefault();
          handleApplyFormat('underline');
          return;
        }
      }

      // Handle undo/redo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }

      if (slashMenu.handleKeyDown(event)) {
        return; // Slash menu handled the event
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [slashMenu, handleUndo, handleRedo, textSelection, handleApplyFormat]);

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

          // If the last block is a code block or another special block, create a new paragraph
          if (lastBlock.type === 'code' || lastBlock.type === 'divider' || lastBlock.type === 'table' || lastBlock.type === 'image') {
            const newBlock = createBlock('paragraph', '');
            const newBlocks = [...editorState.blocks, newBlock];

            isUserChangeRef.current = true;
            setEditorState(prev => ({
              ...prev,
              blocks: newBlocks,
              focusedBlockId: newBlock.id,
            }));

            setTimeout(() => {
              const blockElement = blockRefs.current.get(newBlock.id);
              if (blockElement) {
                const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
                if (input) input.focus();
              }
            }, 10);
          } else {
            // Otherwise just focus the last block
            const blockElement = blockRefs.current.get(lastBlock.id);
            if (blockElement) {
              const input = blockElement.querySelector('input, textarea, [contenteditable]') as HTMLElement;
              if (input) input.focus();
            }
          }
        }
      }}
    >
      {/* Formatting Toolbar */}
      {showFormattingToolbar && textSelection && (
        <div className="sticky top-0 z-20 flex justify-center py-2">
          <FormattingToolbar
            onFormat={handleApplyFormat}
            onColorChange={handleApplyColor}
            onHighlightChange={handleApplyHighlight}
            onFontSizeChange={handleApplyFontSize}
            activeFormats={getActiveFormats()}
          />
        </div>
      )}

      {editorState.blocks.map((block, index) => (
        <EditorBlock
          key={block.id}
          block={block}
          isFocused={editorState.focusedBlockId === block.id}
          placeholder={
            block.content === '' && editorState.focusedBlockId === block.id
              ? placeholder
              : undefined
          }
          onChange={(content, properties) => handleBlockChange(block.id, content, properties)}
          onFocus={() => handleBlockFocus(block.id)}
          onBlur={handleBlockBlur}
          onEnterKey={(cursorPosition, isEmptyBlock, shiftKey) => handleEnterKey(block.id, cursorPosition, isEmptyBlock, shiftKey)}
          onEscapeKey={() => handleEscapeKey(block.id)}
          onBackspaceAtStart={() => handleBackspaceAtStart(block.id)}
          onSlashTrigger={(position, query, element) => handleSlashTrigger(block.id, position, query, element)}
          onClearSlashTrigger={handleClearSlashTrigger}
          onMarkdownTransform={(newType, newContent, cursorPosition) => handleMarkdownTransform(block.id, newType, newContent, cursorPosition)}
          onTextSelect={(start, end) => handleTextSelection(block.id, start, end)}
          onDuplicate={() => handleDuplicateBlock(block.id)}
          onDelete={() => handleDeleteBlock(block.id)}
          onTransform={(newType) => handleTransformBlock(block.id, newType)}
          onMoveUp={() => handleMoveBlock(block.id, 'up')}
          onMoveDown={() => handleMoveBlock(block.id, 'down')}
          canMoveUp={index > 0}
          canMoveDown={index < editorState.blocks.length - 1}
          canDelete={editorState.blocks.length > 1}
          allBlocks={editorState.blocks}
          blockIndex={index}
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
        onSelectCommand={(_command, index) => slashMenu.selectCommand(index)}
      />
    </div>
  );
});

RichEditor.displayName = 'RichEditor';