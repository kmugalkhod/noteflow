"use client";

import { useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { Star, Loader2 } from "lucide-react";
import { NoteCard } from "@/modules/notes/components/note-card";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export function FavoritesView() {
  const convexUser = useConvexUser();

  const favoriteNotes = useQuery(
    api.notes.getFavoriteNotes,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const deleteNote = useMutation(api.notes.deleteNote);
  const togglePin = useMutation(api.notes.togglePin);
  const toggleFavorite = useMutation(api.notes.toggleFavorite);

  // Memoized handlers to prevent creating new functions on every render
  const handleDelete = useCallback((noteId: Id<"notes">) => {
    deleteNote({ noteId });
  }, [deleteNote]);

  const handlePin = useCallback((noteId: Id<"notes">) => {
    togglePin({ noteId });
  }, [togglePin]);

  const handleFavorite = useCallback(async (noteId: Id<"notes">, noteTitle: string) => {
    try {
      await toggleFavorite({ noteId });
      toast.success(`"${noteTitle}" removed from favorites`);
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      toast.error("Failed to update favorite status");
    }
  }, [toggleFavorite]);

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!favoriteNotes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h1 className="text-2xl font-semibold">Favorites</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Quick access to your starred notes
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {favoriteNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Star className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-sm text-muted-foreground">
              Star notes to add them to your favorites for quick access
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {favoriteNotes.map((note) => (
              <NoteCard
                key={note._id}
                id={note._id}
                title={note.title}
                content={note.content}
                updatedAt={note.updatedAt}
                isPinned={note.isPinned}
                isFavorite={note.isFavorite}
                viewMode="grid"
                onDelete={() => handleDelete(note._id)}
                onPin={() => handlePin(note._id)}
                onFavorite={() => handleFavorite(note._id, note.title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
