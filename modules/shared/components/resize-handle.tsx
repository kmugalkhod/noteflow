"use client";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing?: boolean;
}

export function ResizeHandle({ onMouseDown, isResizing = false }: ResizeHandleProps) {
  return (
    <div
      className={`
        w-1 h-full cursor-col-resize group relative flex-shrink-0
        ${isResizing ? "bg-primary/50" : "bg-transparent hover:bg-border"}
        transition-colors
      `}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator on hover */}
      <div
        className={`
          absolute inset-y-0 -left-1 -right-1
          ${isResizing ? "bg-primary/20" : "group-hover:bg-primary/10"}
        `}
      />
    </div>
  );
}
