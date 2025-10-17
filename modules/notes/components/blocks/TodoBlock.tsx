"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface TodoBlockProps {
  content: string;
  properties?: { checked?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const TodoBlock = ({ 
  content, 
  properties = {}, 
  placeholder, 
  isFocused, 
  onChange, 
  onPropertyChange,
  onKeyDown,
  onFocus, 
  onBlur 
}: TodoBlockProps) => {
  const checked = properties.checked || false;
  const todoPlaceholder = placeholder || 'To-do';

  const handleCheckedChange = (newChecked: boolean) => {
    if (onPropertyChange) {
      onPropertyChange({ checked: newChecked });
    }
  };

  return (
    <div className="flex items-start gap-2 py-[3px] px-2">
      <div className="mt-[3px]">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-[18px] h-[18px]"
        />
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value, e.target)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={todoPlaceholder}
        className={`flex-1 text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40 ${
          checked ? 'line-through text-muted-foreground/60' : ''
        }`}
        autoFocus={isFocused}
      />
    </div>
  );
};