"use client";

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

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  noteTitle?: string;
  isPermanent?: boolean;
  folderName?: string | null; // Original folder location
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  onConfirm,
  noteTitle = "this note",
  isPermanent = false,
  folderName,
}: DeleteNoteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isPermanent ? "Permanently Delete Note?" : "Move to Trash?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isPermanent ? (
              <>
                <p>
                  Are you sure you want to permanently delete <strong>"{noteTitle}"</strong>?
                  This action cannot be undone.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>"{noteTitle}"</strong> will be moved to trash.
                  You can restore it within 30 days.
                </p>
                {folderName && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Currently in: <span className="font-medium">{folderName}</span>
                  </p>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={isPermanent ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isPermanent ? "Delete Forever" : "Move to Trash"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
