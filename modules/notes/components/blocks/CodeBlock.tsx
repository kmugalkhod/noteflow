"use client";

import { useEffect, useRef } from 'react';

interface CodeBlockProps {
  content: string;
  properties?: { language?: string };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
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
    <div className="bg-muted/50 rounded-md border">
      {/* Language selector */}
      <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
        <input
          type="text"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          placeholder="Language"
          className="text-xs bg-transparent border-none outline-none text-muted-foreground w-20"
        />
      </div>
      
      {/* Code content */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value, e.target)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={codePlaceholder}
          className="w-full min-h-[100px] text-sm font-mono leading-6 border-none outline-none bg-transparent placeholder:text-muted-foreground/50 resize-none overflow-hidden"
        />
      </div>
    </div>
  );
};