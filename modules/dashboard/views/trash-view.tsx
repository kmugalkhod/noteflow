"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { TrashNoteCard } from "@/modules/notes/components/trash-note-card";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

export function TrashView() {
  const convexUser = useConvexUser();
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Id<"notes"> | null>(null);

  const deletedNotes = useQuery(
    api.notes.getDeletedNotes,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const restoreNote = useMutation(api.notes.restoreNote);
  const permanentDeleteNote = useMutation(api.notes.permanentDeleteNote);

  const handleRestore = async (noteId: string) => {
    try {
      console.log("Restoring note:", noteId);
      await restoreNote({ noteId: noteId as Id<"notes"> });
      console.log("Note restored successfully");
      // Redirect back to main view
      router.push("/");
    } catch (error) {
      console.error("Failed to restore note:", error);
      alert("Failed to restore note. Please try again.");
    }
  };

  const handlePermanentDelete = (noteId: string) => {
    setNoteToDelete(noteId as Id<"notes">);
    setDeleteConfirmOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!noteToDelete) return;

    try {
      await permanentDeleteNote({ noteId: noteToDelete });
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error("Failed to permanently delete note:", error);
    }
  };

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deletedNotes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Trash</h1>
        </div>
        <p className="text-muted-foreground">
          Notes in trash will be permanently deleted after 30 days.
        </p>
      </div>

      {deletedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
          <Trash2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold mb-2 tracking-tight">Trash is empty</h2>
          <p className="text-muted-foreground">
            Deleted notes will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deletedNotes.map((note) => (
            <TrashNoteCard
              key={note._id}
              note={note}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              note and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
