"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Copy, Check, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ShareDialogProps {
  noteId: Id<"notes">;
  noteTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({
  noteId,
  noteTitle,
  isOpen,
  onClose,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Query existing share
  const existingShare = useQuery(
    api.sharedNotes.getShareByNoteId,
    isOpen ? { noteId } : "skip"
  );

  // Mutations
  const createShare = useMutation(api.sharedNotes.createShareLink);
  const revokeShare = useMutation(api.sharedNotes.revokeShareLink);

  const handleCreateShare = async () => {
    try {
      await createShare({ noteId });
      toast.success("Share link created!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create share link"
      );
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handlePreview = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRevokeClick = () => {
    setShowRevokeDialog(true);
  };

  const handleRevokeConfirm = async () => {
    setIsRevoking(true);
    try {
      await revokeShare({ noteId });
      toast.success("Share link revoked successfully");
      setShowRevokeDialog(false);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke share link"
      );
    } finally {
      setIsRevoking(false);
    }
  };

  // Loading state
  if (existingShare === undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Share Settings</DialogTitle>
            <DialogDescription>
              Please wait while we load the share information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not shared state
  if (!existingShare) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share &quot;{noteTitle || "Untitled"}&quot;</DialogTitle>
            <DialogDescription>
              Create a public link that anyone can view
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Anyone with the link will be able to view this note. The note will
              be displayed in a clean, read-only format.
            </p>
            <Button onClick={handleCreateShare} className="w-full">
              Create Share Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Shared state
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share &quot;{noteTitle || "Untitled"}&quot;</DialogTitle>
          <DialogDescription>
            This note is shared publicly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Share URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={existingShare.shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyLink(existingShare.shareUrl)}
              >
                {copied ? (
                  <Check className="text-green-600" />
                ) : (
                  <Copy />
                )}
              </Button>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
            <div className="text-sm">
              <p className="font-medium">{existingShare.viewCount} views</p>
              {existingShare.lastAccessedAt && (
                <p className="text-xs text-muted-foreground">
                  Last viewed {new Date(existingShare.lastAccessedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handlePreview(existingShare.shareUrl)}
            >
              <ExternalLink />
              Preview
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleRevokeClick}
            >
              <Trash2 />
              Revoke Link
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the note no longer accessible via the public link.
              You can create a new share link later if needed. Analytics data
              will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Revoking...
                </>
              ) : (
                "Revoke Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
