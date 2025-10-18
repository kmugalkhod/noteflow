"use client";

import { useEffect, useRef } from 'react';
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';

interface CodeBlockProps {
  content: string | FormattedContent;
  properties?: { language?: string };
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

export const CodeBlock = ({
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
}: CodeBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textContent = typeof content === 'string' ? content : segmentsToString(content);
  const language = properties.language || 'text';
  const codePlaceholder = placeholder || 'Enter code...';

  // Get font size class for code
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-sm';
      default:
        return 'text-[13px]';
    }
  };

  const fontSizeClass = getFontSizeClass();

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
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [textContent]);

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFocused]);

  const handleLanguageChange = (newLanguage: string) => {
    if (onPropertyChange) {
      onPropertyChange({ language: newLanguage });
    }
  };

  return (
    <div className="bg-muted/40 rounded-md border border-border/50 my-1">
      {/* Language selector */}
      <div className="px-3 py-1.5 border-b border-border/30 bg-muted/20">
        <input
          type="text"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          placeholder="Language"
          className="text-xs bg-transparent border-none outline-none text-muted-foreground/70 w-20 font-medium"
        />
      </div>

      {/* Code content */}
      <div className="p-3">
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
          placeholder={codePlaceholder}
          className={`w-full min-h-[100px] ${fontSizeClass} font-mono leading-[1.5] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none overflow-hidden`}
        />
      </div>
    </div>
  );
};