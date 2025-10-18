"use client";

import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import type { FormattedContent } from '../../types/blocks';
import { segmentsToString } from '../../utils/textFormatting';
import { FormattedText } from '../rich-editor/FormattedText';

interface CalloutBlockProps {
  content: string | FormattedContent;
  properties?: { icon?: string; color?: string };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSelect?: (start: number, end: number) => void;
}

type CalloutColor = 'default' | 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'brown' | 'orange' | 'pink';

export const CalloutBlock = ({
  content,
  properties = {},
  placeholder,
  isFocused,
  onChange,
  onPropertyChange,
  onKeyDown,
  onFocus,
  onBlur,
  onSelect
}: CalloutBlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFormatted = typeof content !== 'string';
  const textContent = isFormatted ? segmentsToString(content) : content;
  const icon = properties.icon || '💡';
  const color = (properties.color || 'default') as CalloutColor;
  const calloutPlaceholder = placeholder || 'Callout text...';
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  const colorOptions: { name: CalloutColor; label: string; preview: string }[] = [
    { name: 'default', label: 'Default', preview: 'bg-accent/50 border-border' },
    { name: 'gray', label: 'Gray', preview: 'bg-gray-100 border-gray-300' },
    { name: 'blue', label: 'Blue', preview: 'bg-blue-100 border-blue-300' },
    { name: 'green', label: 'Green', preview: 'bg-green-100 border-green-300' },
    { name: 'yellow', label: 'Yellow', preview: 'bg-yellow-100 border-yellow-300' },
    { name: 'orange', label: 'Orange', preview: 'bg-orange-100 border-orange-300' },
    { name: 'red', label: 'Red', preview: 'bg-red-100 border-red-300' },
    { name: 'purple', label: 'Purple', preview: 'bg-purple-100 border-purple-300' },
    { name: 'pink', label: 'Pink', preview: 'bg-pink-100 border-pink-300' },
    { name: 'brown', label: 'Brown', preview: 'bg-amber-100 border-amber-300' },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gray':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
      case 'blue':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'green':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'orange':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'red':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'purple':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      case 'pink':
        return 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800';
      case 'brown':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800';
      default:
        return 'bg-accent/50 border-border';
    }
  };

  const handleIconChange = (newIcon: string) => {
    if (onPropertyChange) {
      onPropertyChange({ icon: newIcon, color });
    }
  };

  const handleColorChange = (newColor: CalloutColor) => {
    if (onPropertyChange) {
      onPropertyChange({ icon, color: newColor });
    }
    setShowColorPicker(false);
  };

  // If content is formatted, show formatted preview with editable overlay
  if (isFormatted) {
    return (
      <div className={`group relative rounded-md border p-3 my-1 ${getColorClasses(color)}`}>
        <div className="flex items-start gap-2.5">
          <input
            type="text"
            value={icon}
            onChange={(e) => handleIconChange(e.target.value)}
            className="w-7 text-center bg-transparent border-none outline-none text-lg leading-[1.6]"
            maxLength={4}
          />
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
              placeholder={calloutPlaceholder}
              className="relative w-full text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
              style={{
                color: 'transparent',
                caretColor: 'currentColor',
                WebkitTextFillColor: 'transparent'
              }}
              autoFocus={isFocused}
            />
          </div>

          {/* Color picker button */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Change color"
              type="button"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Color picker dropdown */}
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-popover border border-border rounded-lg shadow-lg p-2 w-32">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-1">Color</div>
                <div className="space-y-1">
                  {colorOptions.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => handleColorChange(option.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                        color === option.name ? 'bg-accent' : ''
                      }`}
                      type="button"
                    >
                      <div className={`w-4 h-4 rounded border ${option.preview}`} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-md border p-3 my-1 ${getColorClasses(color)}`}>
      <div className="flex items-start gap-2.5">
        <input
          type="text"
          value={icon}
          onChange={(e) => handleIconChange(e.target.value)}
          className="w-7 text-center bg-transparent border-none outline-none text-lg leading-[1.6]"
          maxLength={4}
        />
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
          placeholder={calloutPlaceholder}
          className="flex-1 text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
          autoFocus={isFocused}
        />

        {/* Color picker button */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Change color"
            type="button"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Color picker dropdown */}
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-popover border border-border rounded-lg shadow-lg p-2 w-32">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-1">Color</div>
              <div className="space-y-1">
                {colorOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => handleColorChange(option.name)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors ${
                      color === option.name ? 'bg-accent' : ''
                    }`}
                    type="button"
                  >
                    <div className={`w-4 h-4 rounded border ${option.preview}`} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};