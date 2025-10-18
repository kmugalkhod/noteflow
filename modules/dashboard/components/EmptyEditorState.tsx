"use client";

import { FileText, Sparkles } from "lucide-react";

export function EmptyEditorState() {
  return (
    <div className="h-full flex items-center justify-center bg-editor-bg">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold mb-3 text-foreground">
          No Note Selected
        </h2>

        <p className="text-muted-foreground mb-6 leading-relaxed">
          Select a note from the list to start editing, or create a new note to begin writing.
        </p>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Type <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">/</kbd> for commands</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">⌘K</kbd>
            <span>to open command palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
