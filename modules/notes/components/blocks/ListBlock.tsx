"use client";

interface ListBlockProps {
  content: string;
  listType: 'bullet' | 'numbered';
  properties?: { level?: number };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const ListBlock = ({ 
  content, 
  listType, 
  properties = {}, 
  placeholder, 
  isFocused, 
  onChange, 
  onFocus, 
  onBlur 
}: ListBlockProps) => {
  const level = properties.level || 0;
  const indentLevel = Math.min(level, 3); // Max 3 levels of indentation
  const paddingLeft = indentLevel * 24; // 24px per level

  const listMarker = listType === 'bullet' ? '•' : '1.';
  const listPlaceholder = placeholder || 'List item';

  return (
    <div className="flex items-start gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
      <span className="text-muted-foreground mt-1 flex-shrink-0 w-4 text-center">
        {listMarker}
      </span>
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value, e.target)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={listPlaceholder}
        className="flex-1 text-base border-none outline-none bg-transparent placeholder:text-muted-foreground/50 py-1"
        autoFocus={isFocused}
      />
    </div>
  );
};