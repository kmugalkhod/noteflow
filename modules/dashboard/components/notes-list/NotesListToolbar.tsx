"use client";

import { List, Grid3x3, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "../../contexts/NotesContext";

interface NotesListToolbarProps {
  onNewNote: () => void;
  canDelete: boolean;
  onDelete?: () => void;
}

export function NotesListToolbar({
  onNewNote,
  canDelete,
  onDelete,
}: NotesListToolbarProps) {
  const { viewMode, setViewMode } = useNotes();

  return (
    <div className="flex items-center justify-between p-2 border-b border-sidebar-border bg-notes-list-bg">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode("list")}
        >
          <List className={`h-4 w-4 ${viewMode === "list" ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setViewMode("grid")}
        >
          <Grid3x3 className={`h-4 w-4 ${viewMode === "grid" ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onNewNote}
      >
        <Plus className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
