"use client";

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NoteCard } from "../note-card";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { type SortOption, type SortDirection, type ViewMode } from "../note-filters";

interface NoteListProps {
  folderId?: Id<"folders">;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  viewMode?: ViewMode;
  selectedTag?: string;
}

export function NoteList({
  folderId,
  sortBy = "updatedAt",
  sortDirection = "desc",
  viewMode = "grid",
  selectedTag
}: NoteListProps) {
  // Fetch notes by tag if selected, otherwise fetch all notes
  const notesByTag = useQuery(
    api.tags.getNotesForTagByName,
    selectedTag ? { tagName: selectedTag } : "skip"
  );

  const allNotes = useQuery(
    api.notes.getNotes,
    !selectedTag ? { folderId } : "skip"
  );

  const deleteNote = useMutation(api.notes.deleteNote);
  const togglePin = useMutation(api.notes.togglePin);
  const toggleFavorite = useMutation(api.notes.toggleFavorite);

  // Use the appropriate data source based on whether tag is selected
  const notes = selectedTag ? notesByTag : allNotes;

  // Sort and filter notes
  const sortedAndFilteredNotes = useMemo(() => {
    if (!notes) return undefined;

    // Filter out null values (defensive programming)
    let filtered = notes.filter((note): note is NonNullable<typeof note> => note !== null);

    // Sort notes
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison = new Date(a._creationTime).getTime() - new Date(b._creationTime).getTime();
          break;
        case "updatedAt":
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    // Sort pinned notes to top regardless of other sorting
    return sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [notes, sortBy, sortDirection]);

  if (sortedAndFilteredNotes === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sortedAndFilteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground mb-2">
          {selectedTag || folderId ? "No notes match your filters" : "No notes yet"}
        </p>
        <p className="text-sm text-muted-foreground">
          {selectedTag || folderId 
            ? "Try adjusting your filters or create a new note" 
            : "Create your first note to get started"
          }
        </p>
      </div>
    );
  }

  const gridClasses = viewMode === "grid" 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
    : "flex flex-col gap-2 p-6";

  return (
    <div className={gridClasses}>
      {sortedAndFilteredNotes.map((note) => (
        <NoteCard
          key={note._id}
          id={note._id}
          title={note.title}
          content={note.content}
          updatedAt={note.updatedAt}
          isPinned={note.isPinned}
          isFavorite={note.isFavorite}
          viewMode={viewMode}
          onDelete={async () => {
            await deleteNote({ noteId: note._id });
          }}
          onPin={async () => {
            await togglePin({ noteId: note._id });
          }}
          onFavorite={async () => {
            await toggleFavorite({ noteId: note._id });
          }}
        />
      ))}
    </div>
  );
}
