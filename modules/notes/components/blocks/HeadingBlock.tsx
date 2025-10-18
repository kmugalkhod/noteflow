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
  fontSize?: 'small' | 'normal' | 'large';
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
  fontSize = 'normal',
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

  const getHeadingStyles = (level: number, fontSize: string) => {
    // Base styles by level
    const baseStyles = {
      1: { small: "text-3xl", normal: "text-4xl", large: "text-5xl", weight: "font-bold", leading: "leading-tight" },
      2: { small: "text-2xl", normal: "text-3xl", large: "text-4xl", weight: "font-bold", leading: "leading-tight" },
      3: { small: "text-xl", normal: "text-2xl", large: "text-3xl", weight: "font-semibold", leading: "leading-snug" }
    };

    const style = baseStyles[level as keyof typeof baseStyles] || baseStyles[1];
    const sizeClass = style[fontSize as keyof typeof style.small] || style.normal;

    return `${sizeClass} ${style.weight} ${style.leading} mb-1`;
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
          className={`absolute inset-0 pointer-events-none py-[3px] px-2 z-10 ${getHeadingStyles(level, fontSize)}`}
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
          className={`relative w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 ${getHeadingStyles(level, fontSize)}`}
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
      className={`w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 ${getHeadingStyles(level, fontSize)}`}
      autoFocus={isFocused}
    />
  );
};