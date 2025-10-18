"use client";

import { useEffect, useRef } from 'react';
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface QuoteBlockProps {
  content: string | FormattedContent;
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
}

export const QuoteBlock = ({
  content,
  placeholder,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect
}: QuoteBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const quotePlaceholder = placeholder || 'Quote';

  // Handle selection changes
  const handleSelect = () => {
    if (onSelect && textareaRef.current) {
      const start = textareaRef.current.selectionStart || 0;
      const end = textareaRef.current.selectionEnd || 0;
      onSelect(start, end);
    }
  };

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [textContent]);

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  // If content is formatted, show formatted preview with editable overlay
  if (isFormatted) {
    return (
      <div className="border-l-4 border-foreground/20 pl-4 py-[3px] px-2 my-1">
        <div className="relative">
          {/* Formatted preview layer (visible) */}
          <div
            className="absolute inset-0 pointer-events-none text-base leading-[1.6] whitespace-pre-wrap break-words z-10"
            aria-hidden="true"
          >
            <FormattedText content={content} />
          </div>

          {/* Editable text layer (invisible but functional) */}
          <textarea
            ref={textareaRef}
            value={textContent}
            onChange={(e) => onChange(e.target.value, e.target)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onSelect={handleSelect}
            onMouseUp={handleSelect}
            onKeyUp={handleSelect}
            placeholder={quotePlaceholder}
            className="relative w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none overflow-hidden min-h-[32px] selection:bg-blue-200 dark:selection:bg-blue-800"
            style={{
              color: 'transparent',
              caretColor: 'currentColor',
              WebkitTextFillColor: 'transparent'
            }}
            rows={1}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-foreground/20 pl-4 py-[3px] px-2 my-1">
      <textarea
        ref={textareaRef}
        value={textContent}
        onChange={(e) => onChange(e.target.value, e.target)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        placeholder={quotePlaceholder}
        className="w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none overflow-hidden min-h-[32px]"
        rows={1}
      />
    </div>
  );
};