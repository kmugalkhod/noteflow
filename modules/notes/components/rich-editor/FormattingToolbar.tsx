"use client";

import { Bold, Italic, Underline, Strikethrough, Palette, Highlighter, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TextColor } from '../../types/blocks';

interface FormattingToolbarProps {
  onFormat: (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => void;
  onColorChange: (color: TextColor) => void;
  onHighlightChange: (color: TextColor) => void;
  onFontSizeChange: (size: 'small' | 'normal' | 'large') => void;
  activeFormats: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
}

const TEXT_COLORS: { name: string; value: TextColor; hex: string }[] = [
  { name: 'Default', value: 'default', hex: '#000000' },
  { name: 'Gray', value: 'gray', hex: '#6B7280' },
  { name: 'Brown', value: 'brown', hex: '#92400E' },
  { name: 'Orange', value: 'orange', hex: '#EA580C' },
  { name: 'Yellow', value: 'yellow', hex: '#CA8A04' },
  { name: 'Green', value: 'green', hex: '#16A34A' },
  { name: 'Blue', value: 'blue', hex: '#2563EB' },
  { name: 'Purple', value: 'purple', hex: '#9333EA' },
  { name: 'Pink', value: 'pink', hex: '#DB2777' },
  { name: 'Red', value: 'red', hex: '#DC2626' },
];

const HIGHLIGHT_COLORS: { name: string; value: TextColor; hex: string }[] = [
  { name: 'None', value: 'default', hex: 'transparent' },
  { name: 'Yellow', value: 'yellow', hex: '#FEF08A' },
  { name: 'Green', value: 'green', hex: '#BBF7D0' },
  { name: 'Blue', value: 'blue', hex: '#BFDBFE' },
  { name: 'Purple', value: 'purple', hex: '#E9D5FF' },
  { name: 'Pink', value: 'pink', hex: '#FBCFE8' },
  { name: 'Red', value: 'red', hex: '#FECACA' },
  { name: 'Orange', value: 'orange', hex: '#FED7AA' },
  { name: 'Gray', value: 'gray', hex: '#E5E7EB' },
];

export function FormattingToolbar({
  onFormat,
  onColorChange,
  onHighlightChange,
  onFontSizeChange,
  activeFormats,
}: FormattingToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 bg-background border border-border rounded-lg shadow-lg animate-scale-in">
      {/* Text Formatting */}
      <Button
        variant={activeFormats.bold ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-8 w-8 p-0 transition-transform hover:scale-110"
        title="Bold (Cmd+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant={activeFormats.italic ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-8 w-8 p-0 transition-transform hover:scale-110"
        title="Italic (Cmd+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant={activeFormats.underline ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('underline')}
        className="h-8 w-8 p-0 transition-transform hover:scale-110"
        title="Underline (Cmd+U)"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant={activeFormats.strikethrough ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('strikethrough')}
        className="h-8 w-8 p-0 transition-transform hover:scale-110"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2">
            <p className="text-xs font-medium mb-2">Text Color</p>
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    console.log('Color button clicked:', color.value);
                    onColorChange(color.value);
                  }}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: color.hex === '#000000' ? 'transparent' : color.hex,
                    border: color.hex === '#000000' ? '2px solid currentColor' : undefined
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <div className="p-2">
            <p className="text-xs font-medium mb-2">Highlight</p>
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onHighlightChange(color.value)}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Font Size */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            title="Font Size"
          >
            <Type className="h-4 w-4 mr-1" />
            <span className="text-xs">Size</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <button
            onClick={() => onFontSizeChange('small')}
            className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
          >
            Small
          </button>
          <button
            onClick={() => onFontSizeChange('normal')}
            className="w-full px-3 py-2 text-left hover:bg-accent"
          >
            Normal
          </button>
          <button
            onClick={() => onFontSizeChange('large')}
            className="w-full px-3 py-2 text-left hover:bg-accent text-lg"
          >
            Large
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
