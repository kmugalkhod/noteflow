"use client";

import { ChevronRight, ChevronDown } from "lucide-react";

interface ToggleBlockProps {
  content: string;
  properties?: { open?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const ToggleBlock = ({ 
  content, 
  properties = {}, 
  placeholder, 
  isFocused, 
  onChange, 
  onPropertyChange,
  onFocus, 
  onBlur 
}: ToggleBlockProps) => {
  const isOpen = properties.open || false;
  const togglePlaceholder = placeholder || 'Toggle';

  const handleToggle = () => {
    if (onPropertyChange) {
      onPropertyChange({ open: !isOpen });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          className="flex-shrink-0 p-1 hover:bg-accent rounded text-muted-foreground"
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
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={togglePlaceholder}
          className="flex-1 text-base font-medium border-none outline-none bg-transparent placeholder:text-muted-foreground/50 py-1"
          autoFocus={isFocused}
        />
      </div>
      
      {isOpen && (
        <div className="ml-7 mt-2 p-3 border-l-2 border-border/50">
          <div className="text-sm text-muted-foreground">
            Toggle content area (coming soon)
          </div>
        </div>
      )}
    </div>
  );
};