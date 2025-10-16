"use client";

interface HeadingBlockProps {
  content: string;
  level: number; // 1, 2, or 3
  placeholder?: string;
  isFocused: boolean;
  onChange: (content: string, element?: HTMLElement) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const HeadingBlock = ({ 
  content, 
  level, 
  placeholder, 
  isFocused, 
  onChange, 
  onKeyDown,
  onFocus, 
  onBlur 
}: HeadingBlockProps) => {
  const getHeadingStyles = (level: number) => {
    switch (level) {
      case 1:
        return "text-3xl font-bold leading-tight";
      case 2:
        return "text-2xl font-semibold leading-tight";
      case 3:
        return "text-xl font-medium leading-tight";
      default:
        return "text-lg font-medium leading-tight";
    }
  };

  const headingPlaceholder = placeholder || `Heading ${level}`;

  return (
    <input
      type="text"
      value={content}
      onChange={(e) => onChange(e.target.value, e.target)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={headingPlaceholder}
      className={`w-full border-none outline-none bg-transparent placeholder:text-muted-foreground/50 py-1 ${getHeadingStyles(level)}`}
      autoFocus={isFocused}
    />
  );
};