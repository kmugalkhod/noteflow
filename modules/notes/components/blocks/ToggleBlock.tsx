"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { type Block } from "../../types/blocks";

interface ToggleBlockProps {
  content: string;
  properties?: { open?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  children?: React.ReactNode; // For rendering nested blocks
}

export const ToggleBlock = ({
  content,
  properties = {},
  placeholder,
  isFocused,
  onChange,
  onPropertyChange,
  onKeyDown,
  onFocus,
  onBlur,
  children
}: ToggleBlockProps) => {
  const isOpen = properties.open || false;
  const togglePlaceholder = placeholder || 'Toggle';

  const handleToggle = () => {
    if (onPropertyChange) {
      onPropertyChange({ open: !isOpen });
    }
  };

  return (
    <div className="py-[3px] px-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleToggle}
          className="flex-shrink-0 p-0.5 hover:bg-accent rounded text-muted-foreground transition-colors"
          type="button"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <input
          type="text"
          value={content}
          onChange={(e) => onChange(e.target.value, e.target)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={togglePlaceholder}
          className="flex-1 text-base leading-[1.6] font-medium border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
          autoFocus={isFocused}
        />
      </div>

      {isOpen && (
        <div className="ml-6 mt-1.5 p-2.5 border-l-2 border-border/40">
          {children || (
            <div className="text-sm text-muted-foreground/60 italic">
              Empty toggle - press Enter to add content
            </div>
          )}
        </div>
      )}
    </div>
  );
};