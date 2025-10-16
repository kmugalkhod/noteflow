"use client";

import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NoteCard } from "../note-card";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { type SortOption, type SortDirection, type ViewMode } from "../note-filters";

interface NoteListProps {
  userId: Id<"users">;
  folderId?: Id<"folders">;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  viewMode?: ViewMode;
  selectedTag?: string;
}

export function NoteList({ 
  userId, 
  folderId, 
  sortBy = "updatedAt", 
  sortDirection = "desc",
  viewMode = "grid",
  selectedTag 
}: NoteListProps) {
  const notes = useQuery(api.notes.getNotes, { userId, folderId });
  const deleteNote = useMutation(api.notes.deleteNote);
  const togglePin = useMutation(api.notes.togglePin);

  // Sort and filter notes
  const sortedAndFilteredNotes = useMemo(() => {
    if (!notes) return undefined;

    let filtered = notes;

    // Filter by tag if selected
    if (selectedTag) {
      // This would require a more complex query - for now we'll implement basic client-side filtering
      // In a real app, you'd want to do this on the backend
      filtered = notes.filter(() => 
        // This is a placeholder - you'd need to fetch note tags and filter
        true // TODO: Implement tag filtering
      );
    }

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
  }, [notes, sortBy, sortDirection, selectedTag]);

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
          viewMode={viewMode}
          onDelete={async () => {
            await deleteNote({ noteId: note._id });
          }}
          onPin={async () => {
            await togglePin({ noteId: note._id });
          }}
        />
      ))}
    </div>
  );
}
