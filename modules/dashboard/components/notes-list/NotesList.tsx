"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useNotes } from "../../contexts/NotesContext";
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
  const { selectedFolderId, selectedNoteId, setSelectedNoteId } = useNotes();
  const createNote = useMutation(api.notes.createNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Get notes based on selected folder
  const allNotes = useQuery(
    api.notes.getNotes,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const folderNotes = useQuery(
    api.folders.getFolderWithNotes,
    selectedFolderId && selectedFolderId !== "all"
      ? { folderId: selectedFolderId }
      : "skip"
  );

  // Determine which notes to display
  let notes = [];
  if (selectedFolderId === "all") {
    notes = allNotes || [];
  } else if (folderNotes) {
    notes = folderNotes.notes || [];
  }

  // Sort notes by most recent
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);

  // Find selected note for title
  const selectedNote = sortedNotes.find((note) => note._id === selectedNoteId);

  const handleNewNote = async () => {
    if (!convexUser) return;

    try {
      const noteId = await createNote({
        userId: convexUser._id,
        title: "Untitled",
        content: "",
        folderId: selectedFolderId && selectedFolderId !== "all" ? selectedFolderId : undefined,
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
        selectedNoteTitle={selectedNote?.title}
      />

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {!convexUser || allNotes === undefined ? (
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
              content={note.content}
              updatedAt={note.updatedAt}
              isSelected={selectedNoteId === note._id}
              onClick={() => handleSelectNote(note._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
