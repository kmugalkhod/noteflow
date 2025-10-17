"use client";

import { useEffect, useRef } from 'react';

interface TextBlockProps {
  content: string;
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const TextBlock = ({
  content,
  placeholder,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
}: TextBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value, e.target)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 resize-none overflow-hidden min-h-[32px]"
      rows={1}
    />
  );
};