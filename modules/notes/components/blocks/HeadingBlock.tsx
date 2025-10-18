"use client";

import { useEffect, useRef } from 'react';
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface HeadingBlockProps {
  content: string | FormattedContent;
  level: number; // 1, 2, or 3
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
}

export const HeadingBlock = ({
  content,
  level,
  placeholder,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect,
}: HeadingBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;

  // Handle selection changes
  const handleSelect = () => {
    if (onSelect && inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      onSelect(start, end);
    }
  };

  const getHeadingStyles = (level: number) => {
    switch (level) {
      case 1:
        return "text-3xl font-bold leading-[1.2] mb-1";
      case 2:
        return "text-2xl font-semibold leading-[1.3] mb-0.5";
      case 3:
        return "text-xl font-semibold leading-[1.4]";
      default:
        return "text-lg font-medium leading-[1.4]";
    }
  };

  const headingPlaceholder = placeholder || `Heading ${level}`;

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // If content is formatted, show formatted preview with editable overlay
  if (isFormatted) {
    return (
      <div className="relative">
        {/* Formatted preview layer (visible) */}
        <div
          className={`absolute inset-0 pointer-events-none py-[3px] px-2 z-10 ${getHeadingStyles(level)}`}
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
          placeholder={headingPlaceholder}
          className={`relative w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 ${getHeadingStyles(level)}`}
          style={{
            color: 'transparent',
            caretColor: 'currentColor',
            WebkitTextFillColor: 'transparent'
          }}
          autoFocus={isFocused}
        />
      </div>
    );
  }

  return (
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
      placeholder={headingPlaceholder}
      className={`w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 ${getHeadingStyles(level)}`}
      autoFocus={isFocused}
    />
  );
};