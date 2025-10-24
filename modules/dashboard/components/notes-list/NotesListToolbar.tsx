"use client";

import { useState } from "react";
import { List, Grid3x3, Trash2, Plus, PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "../../contexts/NotesContext";
import { DeleteNoteDialog } from "@/modules/notes/components/delete-note-dialog";

interface NotesListToolbarProps {
  onNewNote: () => void;
  canDelete: boolean;
  onDelete?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleNotesPanel?: () => void;
  selectedNoteTitle?: string;
}

export function NotesListToolbar({
  onNewNote,
  canDelete,
  onDelete,
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleNotesPanel,
  selectedNoteTitle,
}: NotesListToolbarProps) {
  const { viewMode, setViewMode } = useNotes();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 border-b border-sidebar-border bg-notes-list-bg">
      <div className="flex items-center gap-1">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-150 hover:scale-110"
          onClick={() => setViewMode("list")}
        >
          <List className={`h-4 w-4 transition-colors ${viewMode === "list" ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-150 hover:scale-110"
          onClick={() => setViewMode("grid")}
        >
          <Grid3x3 className={`h-4 w-4 transition-colors ${viewMode === "grid" ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-all duration-150 hover:scale-110"
          onClick={onNewNote}
        >
          <Plus className="h-4 w-4 text-muted-foreground transition-transform hover:rotate-90" />
        </Button>
        {onToggleNotesPanel && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleNotesPanel}
            title="Hide notes panel"
          >
            <PanelRightClose className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      <DeleteNoteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => onDelete?.()}
        noteTitle={selectedNoteTitle}
      />
    </div>
  );
}
