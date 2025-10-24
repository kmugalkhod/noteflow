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
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  onConfirm,
  noteTitle = "this note",
  isPermanent = false,
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
          <AlertDialogDescription>
            {isPermanent ? (
              <>
                Are you sure you want to permanently delete <strong>"{noteTitle}"</strong>?
                This action cannot be undone.
              </>
            ) : (
              <>
                <strong>"{noteTitle}"</strong> will be moved to trash.
                You can restore it within 30 days.
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
