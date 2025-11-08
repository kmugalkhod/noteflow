"use client";

import { useRef, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface TodoBlockProps {
  content: string | FormattedContent;
  properties?: { checked?: boolean; level?: number };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
  fontSize?: 'small' | 'normal' | 'large';
}

export const TodoBlock = ({
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
  fontSize = 'normal'
}: TodoBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const checked = properties.checked || false;
  const level = properties.level || 0;
  const indentLevel = Math.min(level, 3); // Max 3 levels of indentation
  const paddingLeft = indentLevel * 24; // 24px per level
  const todoPlaceholder = placeholder || 'To-do';

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

  const handleCheckedChange = (newChecked: boolean) => {
    if (onPropertyChange) {
      onPropertyChange({ checked: newChecked });
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
      <div className="flex items-start gap-2.5 py-1 px-2 transition-all duration-200 ease-out" style={{ paddingLeft: `${paddingLeft + 8}px` }}>
        <div className="mt-[2px]">
          <Checkbox
            checked={checked}
            onCheckedChange={handleCheckedChange}
            className="w-[20px] h-[20px] border-2 data-[state=unchecked]:border-foreground/30 hover:data-[state=unchecked]:border-foreground/50 transition-colors"
          />
        </div>
        <div className="relative flex-1">
          {/* Formatted preview layer (visible) */}
          <div
            className={`absolute inset-0 pointer-events-none ${fontSizeClass} z-10 ${
              checked ? 'line-through text-muted-foreground/60' : ''
            }`}
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
            placeholder={todoPlaceholder}
            className={`relative w-full ${fontSizeClass} border-none outline-none bg-transparent placeholder:text-muted-foreground/40 ${
              checked ? 'line-through text-muted-foreground/60' : ''
            }`}
            style={{
              color: 'transparent',
              caretColor: 'currentColor',
              WebkitTextFillColor: 'transparent'
            }}
            autoFocus={isFocused}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 py-1 px-2 transition-all duration-200 ease-out" style={{ paddingLeft: `${paddingLeft + 8}px` }}>
      <div className="mt-[2px]">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-[20px] h-[20px] border-2 data-[state=unchecked]:border-foreground/30 hover:data-[state=unchecked]:border-foreground/50 transition-colors"
        />
      </div>
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
        placeholder={todoPlaceholder}
        className={`flex-1 ${fontSizeClass} border-none outline-none bg-transparent placeholder:text-muted-foreground/40 ${
          checked ? 'line-through text-muted-foreground/60' : ''
        }`}
        autoFocus={isFocused}
      />
    </div>
  );
};