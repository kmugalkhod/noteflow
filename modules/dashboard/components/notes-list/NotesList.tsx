"use client";

import { useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useNotesStore } from "../../store/useNotesStore";
import { NotesListToolbar } from "./NotesListToolbar";
import { NoteListItem } from "./NoteListItem";
import { Loader2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

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
          userId: convexUser._id,
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
        userId: convexUser._id,
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

    try {
      await deleteNote({ noteId: selectedNoteId });
      setSelectedNoteId(null);
    } catch (error) {
      console.error("Failed to delete note:", error);
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
      {/* Toolbar */}
      <NotesListToolbar
        onNewNote={handleNewNote}
        canDelete={!!selectedNoteId}
        onDelete={handleDeleteNote}
        onToggleSidebar={onToggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleNotesPanel={onToggleNotesPanel}
        selectedNoteTitle={displayTitle}
      />

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {!convexUser || notes === undefined ? (
          <div className="p-4 space-y-3">
            <div className="h-20 bg-muted/30 rounded-md animate-pulse" />
            <div className="h-20 bg-muted/20 rounded-md animate-pulse" />
            <div className="h-20 bg-muted/10 rounded-md animate-pulse" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center animate-fade-in">
            <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-1">No notes yet</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Click the + button to create your first note
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => (
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
          ))
        )}
      </div>
    </div>
  );
}
