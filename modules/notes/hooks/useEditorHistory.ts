import { useState, useCallback, useRef } from 'react';
import type { Block } from '../types/blocks';

interface HistoryState {
  blocks: Block[];
  focusedBlockId?: string;
}

export const useEditorHistory = (initialBlocks: Block[] = []) => {
  const [history, setHistory] = useState<HistoryState[]>([{ blocks: initialBlocks }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const pushHistory = useCallback((newState: HistoryState) => {
    // Don't push if this is from undo/redo
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => {
      // Remove any "future" history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);

      // Add new state
      newHistory.push(newState);

      // Limit history to last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        setCurrentIndex(prev => prev); // Keep same relative position
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      return newHistory;
    });
  }, [currentIndex]);

  const undo = useCallback((): HistoryState | null => {
    if (!canUndo) return null;

    isUndoRedoRef.current = true;
    setCurrentIndex(prev => prev - 1);
    return history[currentIndex - 1];
  }, [canUndo, history, currentIndex]);

  const redo = useCallback((): HistoryState | null => {
    if (!canRedo) return null;

    isUndoRedoRef.current = true;
    setCurrentIndex(prev => prev + 1);
    return history[currentIndex + 1];
  }, [canRedo, history, currentIndex]);

  const clear = useCallback(() => {
    setHistory([{ blocks: [] }]);
    setCurrentIndex(0);
  }, []);

  return {
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
};
