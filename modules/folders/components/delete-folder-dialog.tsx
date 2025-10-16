"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: Id<"folders"> | null;
  folderName: string;
  noteCount: number;
}

export function DeleteFolderDialog({
  open,
  onOpenChange,
  folderId,
  folderName,
  noteCount,
}: DeleteFolderDialogProps) {
  const [deleteNotes, setDeleteNotes] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  const handleDelete = async () => {
    if (!folderId) return;

    setIsDeleting(true);
    try {
      await deleteFolder({
        folderId,
        deleteNotes,
      });

      onOpenChange(false);
      setDeleteNotes(false);
    } catch (error) {
      console.error("Failed to delete folder:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setDeleteNotes(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Folder
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            folder &quot;{folderName}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {noteCount > 0 && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-3">
                This folder contains{" "}
                <span className="font-semibold text-foreground">
                  {noteCount} {noteCount === 1 ? "note" : "notes"}
                </span>
                . What would you like to do with them?
              </p>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="delete-notes"
                  checked={deleteNotes}
                  onCheckedChange={(checked) =>
                    setDeleteNotes(checked as boolean)
                  }
                  disabled={isDeleting}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="delete-notes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Delete all notes in this folder
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {deleteNotes
                      ? "Notes will be moved to trash and can be recovered for 30 days"
                      : "Notes will be moved to the root level (no folder)"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {noteCount === 0 && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                This folder is empty and can be safely deleted.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
