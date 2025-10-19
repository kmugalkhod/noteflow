import { useState, useCallback, useEffect, useRef } from "react";

interface UseResizableOptions {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  onResize?: (width: number) => void;
}

export function useResizable({
  minWidth,
  maxWidth,
  defaultWidth,
  onResize,
}: UseResizableOptions) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;

      // Enforce min/max constraints
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

      setWidth(constrainedWidth);
      onResize?.(constrainedWidth);
    },
    [isResizing, minWidth, maxWidth, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    width,
    setWidth,
    isResizing,
    handleMouseDown,
  };
}
