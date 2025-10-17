"use client";

interface ListBlockProps {
  content: string;
  listType: 'bullet' | 'numbered';
  properties?: { level?: number };
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
  listNumber?: number;
}

export const ListBlock = ({
  content,
  listType,
  properties = {},
  placeholder,
  isFocused,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  listNumber = 1
}: ListBlockProps) => {
  const level = properties.level || 0;
  const indentLevel = Math.min(level, 3); // Max 3 levels of indentation
  const paddingLeft = indentLevel * 24; // 24px per level

  const listMarker = listType === 'bullet' ? '•' : `${listNumber}.`;
  const listPlaceholder = placeholder || 'List item';

  return (
    <div className="flex items-start gap-2 py-[3px] px-2" style={{ paddingLeft: `${paddingLeft + 8}px` }}>
      <span className="text-muted-foreground mt-[3px] flex-shrink-0 w-5 text-center text-sm">
        {listMarker}
      </span>
      <input
        type="text"
        value={content}
        onChange={(e) => onChange(e.target.value, e.target)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={listPlaceholder}
        className="flex-1 text-base leading-[1.6] border-none outline-none bg-transparent placeholder:text-muted-foreground/40"
        autoFocus={isFocused}
      />
    </div>
  );
};