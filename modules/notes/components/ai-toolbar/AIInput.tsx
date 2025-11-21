"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

interface AIInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  onCancel: () => void;
  isGenerating: boolean;
}

export function AIInput({ onSubmit, onCancel, isGenerating }: AIInputProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;
    await onSubmit(prompt);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="bg-accent/50 p-3 rounded-lg border border-border/50 animate-slide-down">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to edit, research, or format..."
          disabled={isGenerating}
          className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate (Enter)"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="p-2 hover:bg-accent rounded-md transition-colors disabled:opacity-50"
          title="Cancel (Esc)"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        Press <kbd className="px-1 py-1 bg-muted rounded text-foreground">Enter</kbd> to generate or{" "}
        <kbd className="px-1 py-1 bg-muted rounded text-foreground">Esc</kbd> to cancel
      </div>
    </div>
  );
}
