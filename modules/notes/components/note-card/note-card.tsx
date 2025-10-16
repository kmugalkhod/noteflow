"use client";

import { formatDistanceToNow } from "date-fns";
import { FileText, MoreVertical, Pin } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import type { Id } from "@/convex/_generated/dataModel";
import { type ViewMode } from "../note-filters";

interface NoteCardProps {
  id: Id<"notes">;
  title: string;
  content: string;
  updatedAt: number;
  isPinned?: boolean;
  viewMode?: ViewMode;
  onDelete?: () => void;
  onPin?: () => void;
}

export function NoteCard({
  id,
  title,
  content,
  updatedAt,
  isPinned,
  viewMode = "grid",
  onDelete,
  onPin,
}: NoteCardProps) {
  // Extract plain text from content (assuming it might be JSON or HTML)
  const getPreview = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return parsed.text || text;
    } catch {
      return text;
    }
  };

  const preview = getPreview(content).substring(0, 150);
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });

  return (
    <Card className="group relative overflow-hidden hover:shadow-md transition-all">
      <Link href={`/note/${id}`} className="block p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <h3 className="font-semibold text-card-foreground truncate">
              {title || "Untitled"}
            </h3>
          </div>

          {isPinned && (
            <Pin className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
          )}
        </div>

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {preview || "No content yet..."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{timeAgo}</span>
        </div>
      </Link>

      {/* Actions Menu */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md hover:bg-accent"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onPin && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}>
                <Pin className="w-4 h-4 mr-2" />
                {isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
