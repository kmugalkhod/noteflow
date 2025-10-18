"use client";

interface DividerBlockProps {
  content?: string; // Always empty for dividers
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const DividerBlock = ({
  isFocused,
  onFocus,
  onBlur,
  onKeyDown
}: DividerBlockProps) => {
  return (
    <div
      className={`py-4 ${isFocused ? 'bg-accent/10 rounded' : ''}`}
      onClick={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <hr className="border-t border-border" />
    </div>
  );
};