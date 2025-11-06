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
    <div className="flex items-center gap-0.5 px-1.5 py-1.5 bg-background border border-border/50 rounded-lg shadow-sm animate-scale-in">
      {/* Text Formatting */}
      <Button
        variant={activeFormats.bold ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-7 w-7 p-0 transition-colors"
        title="Bold (Cmd+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant={activeFormats.italic ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-7 w-7 p-0 transition-colors"
        title="Italic (Cmd+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant={activeFormats.underline ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('underline')}
        className="h-7 w-7 p-0 transition-colors"
        title="Underline (Cmd+U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant={activeFormats.strikethrough ? "default" : "ghost"}
        size="sm"
        onClick={() => onFormat('strikethrough')}
        className="h-7 w-7 p-0 transition-colors"
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Button>

      <div className="w-px h-5 bg-border/50 mx-1" />

      {/* Text Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 transition-colors"
            title="Text Color"
          >
            <Palette className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2">
            <p className="text-xs font-medium mb-2 text-muted-foreground">Text Color</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    console.log('Color button clicked:', color.value);
                    onColorChange(color.value);
                  }}
                  className="w-7 h-7 rounded border border-border/50 hover:border-border transition-colors"
                  style={{
                    backgroundColor: color.hex === '#000000' ? 'transparent' : color.hex,
                    border: color.hex === '#000000' ? '1px solid currentColor' : undefined
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
            className="h-7 w-7 p-0 transition-colors"
            title="Highlight"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <div className="p-2">
            <p className="text-xs font-medium mb-2 text-muted-foreground">Highlight</p>
            <div className="grid grid-cols-4 gap-1.5">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onHighlightChange(color.value)}
                  className="w-7 h-7 rounded border border-border/50 hover:border-border transition-colors"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-5 bg-border/50 mx-1" />

      {/* Font Size */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 transition-colors"
            title="Font Size"
          >
            <Type className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Size</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <button
            onClick={() => onFontSizeChange('small')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent text-sm transition-colors rounded-sm"
          >
            Small
          </button>
          <button
            onClick={() => onFontSizeChange('normal')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent transition-colors rounded-sm"
          >
            Normal
          </button>
          <button
            onClick={() => onFontSizeChange('large')}
            className="w-full px-3 py-1.5 text-left hover:bg-accent text-lg transition-colors rounded-sm"
          >
            Large
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
