"use client";

import { useEffect, useRef } from 'react';

interface QuoteBlockProps {
  content: string;
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const QuoteBlock = ({ 
  content, 
  placeholder, 
  isFocused, 
  onChange, 
  onFocus, 
  onBlur 
}: QuoteBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quotePlaceholder = placeholder || 'Quote';

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div className="border-l-4 border-primary/30 pl-4 py-1">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value, e.target)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={quotePlaceholder}
        className="w-full text-base leading-7 italic border-none outline-none bg-transparent placeholder:text-muted-foreground/50 text-muted-foreground resize-none overflow-hidden min-h-[28px]"
        rows={1}
      />
    </div>
  );
};