"use client";

import { FolderPlus } from "lucide-react";

export function EmptyFolderState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-fade-in">
      <FolderPlus className="w-12 h-12 text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground max-w-[180px]">
        No folders yet. Create one to organize your notes.
      </p>
    </div>
  );
}
