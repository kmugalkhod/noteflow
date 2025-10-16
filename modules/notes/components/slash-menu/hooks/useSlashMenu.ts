import { useState, useEffect, useCallback, useRef } from 'react';
import { SLASH_COMMANDS, filterCommands, type SlashCommand } from '../SlashCommands';

export interface SlashMenuState {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  query: string;
  selectedIndex: number;
  filteredCommands: SlashCommand[];
}

export interface UseSlashMenuProps {
  onSelectCommand: (command: SlashCommand) => void;
  onClose: () => void;
}

export const useSlashMenu = ({ onSelectCommand, onClose }: UseSlashMenuProps) => {
  const [state, setState] = useState<SlashMenuState>({
    isOpen: false,
    position: null,
    query: '',
    selectedIndex: 0,
    filteredCommands: SLASH_COMMANDS,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands when query changes
  useEffect(() => {
    const filtered = filterCommands(state.query);
    setState(prev => ({
      ...prev,
      filteredCommands: filtered,
      selectedIndex: Math.min(prev.selectedIndex, Math.max(0, filtered.length - 1)),
    }));
  }, [state.query]);

  // Calculate menu position based on cursor/caret position
  const calculatePosition = useCallback((element: HTMLElement, caretOffset: number): { x: number; y: number } => {
    const elementRect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
    
    // Create a temporary element to measure text width
    const measureEl = document.createElement('span');
    measureEl.style.font = style.font;
    measureEl.style.position = 'absolute';
    measureEl.style.visibility = 'hidden';
    measureEl.style.whiteSpace = 'pre';
    
    // Get text before caret
    const textBeforeCaret = element.textContent?.substring(0, caretOffset) || '';
    const lines = textBeforeCaret.split('\n');
    const currentLine = lines[lines.length - 1];
    
    measureEl.textContent = currentLine;
    document.body.appendChild(measureEl);
    const textWidth = measureEl.getBoundingClientRect().width;
    document.body.removeChild(measureEl);
    
    const lineNumber = lines.length - 1;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    
    return {
      x: elementRect.left + paddingLeft + textWidth,
      y: elementRect.top + paddingTop + (lineNumber * lineHeight) + lineHeight,
    };
  }, []);

  const openMenu = useCallback((element: HTMLElement, caretOffset: number, query: string = '') => {
    const position = calculatePosition(element, caretOffset);
    setState({
      isOpen: true,
      position,
      query,
      selectedIndex: 0,
      filteredCommands: filterCommands(query),
    });
  }, [calculatePosition]);

  const closeMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      position: null,
      query: '',
      selectedIndex: 0,
    }));
    onClose();
  }, [onClose]);

  const updateQuery = useCallback((newQuery: string) => {
    setState(prev => ({
      ...prev,
      query: newQuery,
    }));
  }, []);

  const selectNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: (prev.selectedIndex + 1) % prev.filteredCommands.length,
    }));
  }, []);

  const selectPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: prev.selectedIndex === 0 
        ? prev.filteredCommands.length - 1 
        : prev.selectedIndex - 1,
    }));
  }, []);

  const selectCommand = useCallback((index?: number) => {
    const commandIndex = index ?? state.selectedIndex;
    const command = state.filteredCommands[commandIndex];
    
    if (command) {
      onSelectCommand(command);
      closeMenu();
    }
  }, [state.selectedIndex, state.filteredCommands, onSelectCommand, closeMenu]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isOpen) return false;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectNext();
        return true;
      
      case 'ArrowUp':
        event.preventDefault();
        selectPrevious();
        return true;
      
      case 'Enter':
        event.preventDefault();
        selectCommand();
        return true;
      
      case 'Escape':
        event.preventDefault();
        closeMenu();
        return true;
      
      default:
        return false;
    }
  }, [state.isOpen, selectNext, selectPrevious, selectCommand, closeMenu]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state.isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [state.isOpen, closeMenu]);

  return {
    state,
    menuRef,
    openMenu,
    closeMenu,
    updateQuery,
    selectNext,
    selectPrevious,
    selectCommand,
    handleKeyDown,
  };
};