"use client";

import { useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { NoteCard } from "@/modules/notes/components/note-card";
import { useMutation } from "convex/react";
import { Loader2, Pin, FileText } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { Id } from "@/convex/_generated/dataModel";

export function WorkspaceView() {
  const convexUser = useConvexUser();
  const { user } = useUser();
  const workspaceData = useQuery(
    api.notes.getWorkspaceNotes,
    convexUser ? { recentLimit: 10 } : "skip"
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

  const handleFavorite = useCallback((noteId: Id<"notes">) => {
    toggleFavorite({ noteId });
  }, [toggleFavorite]);

  if (!convexUser || workspaceData === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { pinnedNotes, recentNotes, totalCount: totalNotes } = workspaceData;
  const greeting = user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome back!";

  return (
    <div className="h-full overflow-auto">
      {/* Hero Section */}
      <div className="p-8 border-b border-border bg-gradient-to-r from-background to-accent/10">
        <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
        <p className="text-muted-foreground mb-4">
          Your new home for writing, editing, tracking and publishing.
        </p>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {totalNotes} {totalNotes === 1 ? "note" : "notes"}
            </span>
          </div>
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                {pinnedNotes.length} pinned
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pin className="w-5 h-5 text-primary" />
            Pinned Notes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note._id}
                id={note._id}
                title={note.title}
                content={note.content}
                updatedAt={note.updatedAt}
                isPinned={note.isPinned}
                isFavorite={note.isFavorite}
                onDelete={() => handleDelete(note._id)}
                onPin={() => handlePin(note._id)}
                onFavorite={() => handleFavorite(note._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes Section */}
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
        {recentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Click &quot;New story&quot; in the sidebar to create your first note
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard
                key={note._id}
                id={note._id}
                title={note.title}
                content={note.content}
                updatedAt={note.updatedAt}
                isPinned={note.isPinned}
                isFavorite={note.isFavorite}
                onDelete={() => handleDelete(note._id)}
                onPin={() => handlePin(note._id)}
                onFavorite={() => handleFavorite(note._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
