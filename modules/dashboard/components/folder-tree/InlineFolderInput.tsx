"use client";

import { useState, useEffect, useRef } from "react";
import { Folder, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InlineFolderInputProps {
  defaultName?: string;
  depth: number;
  parentId?: string;
  onConfirm: (name: string) => Promise<void>;
  onCancel: () => void;
  color?: string;
}

export function InlineFolderInput({
  defaultName = "New Folder",
  depth,
  onConfirm,
  onCancel,
  color,
}: InlineFolderInputProps) {
  const [name, setName] = useState(defaultName);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleConfirm = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      onCancel();
      return;
    }

    setIsCreating(true);
    try {
      await onConfirm(trimmedName);
    } catch (error) {
      console.error("Failed to create folder:", error);
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events to register
    setTimeout(() => {
      if (!isCreating) {
        handleConfirm();
      }
    }, 150);
  };

  // Calculate indentation (each level adds 16px)
  const indentStyle = {
    paddingLeft: `${depth * 16 + 12}px`,
  };

  return (
    <div
      className="flex items-center gap-2 py-2 pr-3 rounded-md bg-sidebar-accent/50 border border-sidebar-ring"
      style={indentStyle}
    >
      {/* Spacer for folder icon alignment */}
      <div className="w-4 flex-shrink-0" />

      {/* Folder Icon */}
      <Folder
        className="w-4 h-4 flex-shrink-0 text-muted-foreground"
        style={{ color: color || undefined }}
      />

      {/* Input Field */}
      <div className="flex-1 min-w-0">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isCreating}
          className="h-6 px-1 py-0 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Folder name"
        />
      </div>

      {/* Loading indicator */}
      {isCreating && (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
