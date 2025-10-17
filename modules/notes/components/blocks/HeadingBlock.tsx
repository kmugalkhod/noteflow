"use client";

import { useEffect, useRef } from 'react';

interface HeadingBlockProps {
  content: string;
  level: number; // 1, 2, or 3
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
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
}: HeadingBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <input
      ref={inputRef}
      type="text"
      value={content}
      onChange={(e) => onChange(e.target.value, e.target)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={headingPlaceholder}
      className={`w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-[3px] px-2 ${getHeadingStyles(level)}`}
      autoFocus={isFocused}
    />
  );
};