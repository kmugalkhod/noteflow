"use client";

import { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from "lucide-react";
import { type Block, type FormattedContent } from "../../types/blocks";
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface ToggleBlockProps {
  content: string | FormattedContent;
  properties?: { open?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
  children?: React.ReactNode; // For rendering nested blocks
  fontSize?: 'small' | 'normal' | 'large';
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
  onSelect,
  children,
  fontSize = 'normal'
}: ToggleBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const isOpen = properties.open || false;
  const togglePlaceholder = placeholder || 'Toggle';

  // Get font size class
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-sm leading-normal';
      case 'large':
        return 'text-lg leading-relaxed';
      default:
        return 'text-base leading-[1.6]';
    }
  };

  const fontSizeClass = getFontSizeClass();

  const handleToggle = () => {
    if (onPropertyChange) {
      onPropertyChange({ open: !isOpen });
    }
  };

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Handle selection changes
  const handleSelect = () => {
    if (onSelect && inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      onSelect(start, end);
    }
  };

  // If content is formatted, show formatted preview with editable overlay
  if (isFormatted) {
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
          <div className="relative flex-1">
            {/* Formatted preview layer (visible) */}
            <div
              className={`absolute inset-0 pointer-events-none ${fontSizeClass} font-medium z-10`}
              aria-hidden="true"
            >
              <FormattedText content={content} />
            </div>

            {/* Editable text layer (invisible but functional) */}
            <input
              ref={inputRef}
              type="text"
              value={textContent}
              onChange={(e) => onChange(e.target.value, e.target)}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              onBlur={onBlur}
              onSelect={handleSelect}
              onMouseUp={handleSelect}
              onKeyUp={handleSelect}
              placeholder={togglePlaceholder}
              className={`relative w-full ${fontSizeClass} font-medium border-none outline-none bg-transparent placeholder:text-muted-foreground/40`}
              style={{
                color: 'transparent',
                caretColor: 'currentColor',
                WebkitTextFillColor: 'transparent'
              }}
              autoFocus={isFocused}
            />
          </div>
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
  }

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
          ref={inputRef}
          type="text"
          value={textContent}
          onChange={(e) => onChange(e.target.value, e.target)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          onSelect={handleSelect}
          onMouseUp={handleSelect}
          onKeyUp={handleSelect}
          placeholder={togglePlaceholder}
          className={`flex-1 ${fontSizeClass} font-medium border-none outline-none bg-transparent placeholder:text-muted-foreground/40`}
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