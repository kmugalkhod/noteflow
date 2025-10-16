"use client";

import { formatDistanceToNow } from "date-fns";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TrashNoteCardProps {
  note: {
    _id: string;
    title: string;
    content: string;
    deletedAt?: number;
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {preview || "No content"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <p className="text-xs text-muted-foreground">Deleted {timeAgo}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRestore(note._id)}
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
