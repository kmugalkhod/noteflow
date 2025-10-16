"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface TodoBlockProps {
  content: string;
  properties?: { checked?: boolean };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
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
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          className="w-4 h-4"
        />
      </div>
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value, e.target)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={todoPlaceholder}
        className={`flex-1 text-base border-none outline-none bg-transparent placeholder:text-muted-foreground/50 py-1 ${
          checked ? 'line-through text-muted-foreground' : ''
        }`}
        autoFocus={isFocused}
      />
    </div>
  );
};