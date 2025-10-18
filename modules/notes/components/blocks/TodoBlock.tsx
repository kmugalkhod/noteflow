"use client";

import { useRef, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface TodoBlockProps {
  content: string | FormattedContent;
  properties?: { checked?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
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
  onSelect
}: TodoBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const checked = properties.checked || false;
  const todoPlaceholder = placeholder || 'To-do';

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
      <div className="flex items-start gap-2 py-[3px] px-2">
        <div className="mt-[3px]">
          <Checkbox
            checked={checked}
            onCheckedChange={handleCheckedChange}
            className="w-[18px] h-[18px]"
          />
        </div>
        <div className="relative flex-1">
          {/* Formatted preview layer (visible) */}
          <div
            className={`absolute inset-0 pointer-events-none text-base leading-[1.6] z-10 ${
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
            className={`relative w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 ${
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
    <div className="flex items-start gap-2 py-[3px] px-2">
      <div className="mt-[3px]">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-[18px] h-[18px]"
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
        className={`flex-1 text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 ${
          checked ? 'line-through text-muted-foreground/60' : ''
        }`}
        autoFocus={isFocused}
      />
    </div>
  );
};