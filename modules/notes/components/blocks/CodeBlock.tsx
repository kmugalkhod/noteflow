"use client";

import { useEffect, useRef } from 'react';

interface CodeBlockProps {
  content: string;
  properties?: { language?: string };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
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
  onBlur 
}: CodeBlockProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const language = properties.language || 'text';
  const codePlaceholder = placeholder || 'Enter code...';

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [content]);

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
          value={content}
          onChange={(e) => onChange(e.target.value, e.target)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={codePlaceholder}
          className="w-full min-h-[100px] text-[13px] font-mono leading-[1.5] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none overflow-hidden"
        />
      </div>
    </div>
  );
};