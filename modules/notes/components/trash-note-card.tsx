"use client";

import { formatDistanceToNow } from "date-fns";
import { RotateCcw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpirationBadge } from "@/modules/trash/components/expiration-badge";
import { OriginalLocationBadge } from "@/modules/trash/components/original-location-badge";
import { toast } from "sonner";

interface TrashNoteCardProps {
  note: {
    _id: string;
    title: string;
    content: string;
    deletedAt?: number;
    originalFolderName?: string | null;
    deletedFromPath?: string | null;
    daysRemaining?: number;
  };
  onRestore: (noteId: string) => void;
  onPermanentDelete: (noteId: string) => void;
}

export function TrashNoteCard({
  note,
  onRestore,
  onPermanentDelete,
}: TrashNoteCardProps) {
  const preview = note.content.substring(0, 150);
  const timeAgo = note.deletedAt
    ? formatDistanceToNow(note.deletedAt, { addSuffix: true })
    : "Unknown time";

  // Check if original folder is missing (was deleted or no longer exists)
  const hasOriginalFolder = note.originalFolderName !== undefined;
  const folderMissing = hasOriginalFolder && !note.originalFolderName;

  const handleRestore = () => {
    if (folderMissing) {
      toast.info("Original folder no longer exists", {
        description: "Note will be restored to root folder",
      });
    }
    onRestore(note._id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {preview || "No content"}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {/* Original location badge */}
          {hasOriginalFolder && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">From:</span>
              <OriginalLocationBadge
                folderName={note.originalFolderName}
                folderPath={note.deletedFromPath}
              />
            </div>
          )}

          {/* Expiration badge */}
          {note.deletedAt && (
            <ExpirationBadge deletedAt={note.deletedAt} />
          )}
        </div>

        {/* Warning for missing folder */}
        {folderMissing && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3 w-3" />
            <span>Original folder no longer exists</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <p className="text-xs text-muted-foreground">Deleted {timeAgo}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestore}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restore
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onPermanentDelete(note._id)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Forever
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
