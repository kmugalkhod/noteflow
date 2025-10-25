"use client";

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreVertical, Pin, Star } from "lucide-react";
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
  isFavorite?: boolean;
  viewMode?: ViewMode;
  onDelete?: () => void;
  onPin?: () => void;
  onFavorite?: () => void;
}

export const NoteCard = memo(function NoteCard({
  id,
  title,
  content,
  updatedAt,
  isPinned,
  isFavorite,
  viewMode = "grid",
  onDelete,
  onPin,
  onFavorite,
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

      {/* Favorite Star Button */}
      {onFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-background/90 hover:bg-accent border border-border shadow-sm hover:scale-105 transition-all"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`} />
        </button>
      )}

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md hover:bg-accent bg-background/90 border border-border shadow-sm transition-all"
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
            {onFavorite && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}>
                <Star className={`w-4 h-4 mr-2 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
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
});
