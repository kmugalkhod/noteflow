"use client";

import { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronDown,
  Quote,
  Code,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import type { BlockType } from '../../types/blocks';

interface BlockActionsMenuProps {
  blockId: string;
  blockType: BlockType;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onTransform: (newType: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const blockTypeOptions: Array<{ type: BlockType; label: string; icon: React.ReactNode }> = [
  { type: 'paragraph', label: 'Text', icon: <Type className="w-4 h-4" /> },
  { type: 'heading1', label: 'Heading 1', icon: <Heading1 className="w-4 h-4" /> },
  { type: 'heading2', label: 'Heading 2', icon: <Heading2 className="w-4 h-4" /> },
  { type: 'heading3', label: 'Heading 3', icon: <Heading3 className="w-4 h-4" /> },
  { type: 'bulletList', label: 'Bullet List', icon: <List className="w-4 h-4" /> },
  { type: 'numberedList', label: 'Numbered List', icon: <ListOrdered className="w-4 h-4" /> },
  { type: 'todo', label: 'Todo', icon: <CheckSquare className="w-4 h-4" /> },
  { type: 'toggle', label: 'Toggle', icon: <ChevronDown className="w-4 h-4" /> },
  { type: 'quote', label: 'Quote', icon: <Quote className="w-4 h-4" /> },
  { type: 'code', label: 'Code', icon: <Code className="w-4 h-4" /> },
  { type: 'callout', label: 'Callout', icon: <MessageSquare className="w-4 h-4" /> },
];

export const BlockActionsMenu = ({
  blockId,
  blockType,
  canMoveUp,
  canMoveDown,
  canDelete,
  onDuplicate,
  onDelete,
  onTransform,
  onMoveUp,
  onMoveDown,
}: BlockActionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTransformMenu, setShowTransformMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const transformMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        transformMenuRef.current &&
        !transformMenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowTransformMenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setShowTransformMenu(false);
  };

  const handleTransform = (newType: BlockType) => {
    onTransform(newType);
    setIsOpen(false);
    setShowTransformMenu(false);
  };

  return (
    <div className="absolute left-0 top-0 -ml-8 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        title="Block actions"
        type="button"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg py-1 w-48 z-20"
        >
          {/* Duplicate */}
          <button
            onClick={() => handleAction(onDuplicate)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
            type="button"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>

          {/* Delete */}
          {canDelete && (
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-border my-1" />

          {/* Move Up */}
          {canMoveUp && (
            <button
              onClick={() => handleAction(onMoveUp)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              type="button"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Move Up</span>
            </button>
          )}

          {/* Move Down */}
          {canMoveDown && (
            <button
              onClick={() => handleAction(onMoveDown)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              type="button"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Move Down</span>
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-border my-1" />

          {/* Transform To */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTransformMenu(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
              type="button"
            >
              <span>Turn into</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Transform submenu */}
            {showTransformMenu && (
              <div
                ref={transformMenuRef}
                className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-lg shadow-lg py-1 w-48 max-h-80 overflow-y-auto z-30"
                onMouseLeave={() => setShowTransformMenu(false)}
              >
                {blockTypeOptions
                  .filter(option => option.type !== blockType) // Don't show current type
                  .map(option => (
                    <button
                      key={option.type}
                      onClick={() => handleTransform(option.type)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                      type="button"
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
