"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useNotesStore } from "../../store/useNotesStore";
import { NotesListToolbar } from "./NotesListToolbar";
import { NoteListItem } from "./NoteListItem";
import { Loader2, FileText, Trash2, PanelRightClose } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/modules/shared/lib/toast";
import { NoteListSkeleton } from "@/modules/shared/components";
import { DeleteNoteDialog } from "@/modules/notes/components/delete-note-dialog";

interface NotesListProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleNotesPanel?: () => void;
  isCollapsed?: boolean;
  width?: number;
}

export function NotesList({
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleNotesPanel,
  isCollapsed = false,
  width = 300,
}: NotesListProps) {
  const convexUser = useConvexUser();
  const router = useRouter();

  // State for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Zustand store - select only what we need
  const selectedFolderId = useNotesStore((state) => state.selectedFolderId);
  const selectedNoteId = useNotesStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  const createNote = useMutation(api.notes.createNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const toggleFavorite = useMutation(api.notes.toggleFavorite);
  const moveNoteToFolder = useMutation(api.notes.moveNoteToFolder);

  // Get notes with minimal data (no content for performance)
  const notes = useQuery(
    api.notes.getNotesMinimal,
    convexUser
      ? {
          // null = uncategorized notes, undefined = all notes, specific ID = notes in that folder
          folderId: selectedFolderId === "all" ? null : selectedFolderId || undefined,
        }
      : "skip"
  );

  // Sort notes by most recent (no position tracking - natural order)
  const sortedNotes = useMemo(() => {
    if (!notes) return [];
    // Simple sort by updatedAt - most recent first
    return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes]);

  // Find selected note
  const selectedNote = sortedNotes.find((note) => note._id === selectedNoteId);

  // Display title directly from database - no cache to prevent flicker
  // Show actual title, or "Untitled" if note exists but has no title
  // Return undefined if note is still loading (selectedNoteId exists but selectedNote doesn't)
  const displayTitle = selectedNoteId && !selectedNote
    ? undefined // Loading
    : selectedNote?.title || "Untitled"; // Show title or "Untitled" if empty

  const handleNewNote = async () => {
    if (!convexUser) return;

    try {
      const noteId = await createNote({
        title: "Untitled",
        content: "",
        // If in "Uncategorized" view, create note without folder
        folderId: selectedFolderId === "all" ? undefined : (selectedFolderId || undefined),
      });
      setSelectedNoteId(noteId);
      router.push(`/note/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;

    const noteTitle = displayTitle || "Untitled";

    try {
      await deleteNote({ noteId: selectedNoteId });
      setSelectedNoteId(null);
      setShowDeleteDialog(false); // Close dialog
      // Navigate to workspace to clear the editor view
      router.push("/workspace");
      toast.success(`"${noteTitle}" moved to trash`);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleSelectNote = (noteId: string) => {
    // Only update noteId - title comes from database
    setSelectedNoteId(noteId as any);
    router.push(`/note/${noteId}`);
  };

  // If collapsed, don't render
  if (isCollapsed) {
    return null;
  }

  return (
    <div
      className="h-screen bg-notes-list-bg border-r border-sidebar-border flex flex-col flex-shrink-0 transition-all"
      style={{ width: `${width}px` }}
    >
      {/* Header - Stitch Style */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-foreground">All Notes</h2>
          <div className="flex items-center gap-1.5">
            {/* Delete button - only show when note is selected */}
            {selectedNoteId && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            )}
            <button
              onClick={handleNewNote}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="New note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {/* Collapse button */}
            {onToggleNotesPanel && (
              <button
                onClick={onToggleNotesPanel}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                title="Hide notes panel (Cmd+\)"
              >
                <PanelRightClose className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}</span>
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Sort
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!convexUser || notes === undefined ? (
          <NoteListSkeleton count={6} />
        ) : sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center animate-fade-in">
            <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Click the + button to create your first note
            </p>
          </div>
        ) : (
          <div key={selectedFolderId?.toString() || 'all'} className="animate-fade-in space-y-1">
            {sortedNotes.map((note) => (
              <NoteListItem
                key={note._id}
                id={note._id}
                title={note.title}
                content={note.contentPreview}
                updatedAt={note.updatedAt}
                isSelected={selectedNoteId === note._id}
                isFavorite={note.isFavorite}
                onClick={() => handleSelectNote(note._id)}
                onFavorite={async () => {
                  await toggleFavorite({ noteId: note._id });
                }}
                onDragStart={(noteId) => {
                  // Store the dragged note ID for drop handling
                  sessionStorage.setItem("draggedNoteId", noteId);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Note Dialog */}
      <DeleteNoteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteNote}
        noteTitle={displayTitle}
      />
    </div>
  );
}
