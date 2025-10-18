"use client";

import { useRef, useEffect } from 'react';
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface ListBlockProps {
  content: string | FormattedContent;
  listType: 'bullet' | 'numbered';
  properties?: { level?: number };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
  listNumber?: number;
}

export const ListBlock = ({
  content,
  listType,
  properties = {},
  placeholder,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect,
  listNumber = 1
}: ListBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const level = properties.level || 0;
  const indentLevel = Math.min(level, 3); // Max 3 levels of indentation
  const paddingLeft = indentLevel * 24; // 24px per level

  const listMarker = listType === 'bullet' ? '•' : `${listNumber}.`;
  const listPlaceholder = placeholder || 'List item';

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
      <div className="flex items-start gap-2 py-[3px] px-2" style={{ paddingLeft: `${paddingLeft + 8}px` }}>
        <span className="text-muted-foreground mt-[3px] flex-shrink-0 w-5 text-center text-sm">
          {listMarker}
        </span>
        <div className="relative flex-1">
          {/* Formatted preview layer (visible) */}
          <div
            className="absolute inset-0 pointer-events-none text-base leading-[1.6] z-10"
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
            placeholder={listPlaceholder}
            className="relative w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
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
    <div className="flex items-start gap-2 py-[3px] px-2" style={{ paddingLeft: `${paddingLeft + 8}px` }}>
      <span className="text-muted-foreground mt-[3px] flex-shrink-0 w-5 text-center text-sm">
        {listMarker}
      </span>
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
        placeholder={listPlaceholder}
        className="flex-1 text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
        autoFocus={isFocused}
      />
    </div>
  );
};