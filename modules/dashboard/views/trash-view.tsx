"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { Trash2, Loader2, RotateCcw, FileText, Folder } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "@/modules/shared/lib/toast";

export function TrashView() {
  const convexUser = useConvexUser();
  const router = useRouter();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Id<"notes"> | null>(null);

  const deletedNotes = useQuery(
    api.trash.getDeletedItems,
    convexUser ? {} : "skip"
  );

  const restoreNote = useMutation(api.notes.restoreNote);
  const permanentDeleteNote = useMutation(api.notes.permanentDeleteNote);

  const handleRestore = async (noteId: string, noteTitle: string, originalFolder?: string | null) => {
    try {
      await restoreNote({ noteId: noteId as Id<"notes"> });
      const location = originalFolder || "All Notes";
      toast.success(`"${noteTitle}" restored to ${location}`);
    } catch (error) {
      console.error("Failed to restore note:", error);
      toast.error("Failed to restore note. Please try again.");
    }
  };

  const handlePermanentDelete = (noteId: string, noteTitle: string) => {
    setNoteToDelete(noteId as Id<"notes">);
    setDeleteConfirmOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!noteToDelete) return;

    // Find the note to get its title
    const note = deletedNotes?.find(n => n._id === noteToDelete);
    const noteTitle = note?.title || "Untitled";

    try {
      await permanentDeleteNote({ noteId: noteToDelete });
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
      toast.success(`"${noteTitle}" permanently deleted`);
    } catch (error) {
      console.error("Failed to permanently delete note:", error);
      toast.error("Failed to permanently delete note. Please try again.");
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
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Trash2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Trash</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Pages in Trash for over 30 days will be automatically deleted
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {deletedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Trash2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Trash is empty</h2>
            <p className="text-sm text-muted-foreground">
              Deleted notes will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {deletedNotes.map((note) => (
              <div
                key={note._id}
                className="px-6 py-3 hover:bg-accent/50 transition-colors group flex items-center justify-between"
              >
                {/* Left side - Note info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{note.title}</div>
                    {note.originalFolderName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Folder className="h-3 w-3" />
                        <span className="truncate">{note.originalFolderName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Action buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(note._id, note.title, note.originalFolderName)}
                    className="h-8 gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePermanentDelete(note._id, note.title)}
                    className="h-8 gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
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
