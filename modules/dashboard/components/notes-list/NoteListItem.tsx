"use client";

import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";
import { Star } from "lucide-react";

interface NoteListItemProps {
  id: Id<"notes">;
  title: string;
  content: string;
  updatedAt: number;
  isSelected: boolean;
  isFavorite?: boolean;
  onClick: () => void;
  onFavorite?: () => void;
  onDragStart?: (noteId: Id<"notes">) => void;
}

export function NoteListItem({
  id,
  title,
  content,
  updatedAt,
  isSelected,
  isFavorite,
  onClick,
  onFavorite,
  onDragStart,
}: NoteListItemProps) {
  // Extract plain text from content (remove any markdown/formatting)
  const getPreviewText = (text: string) => {
    return text.replace(/[#*_`~\[\]]/g, "").trim().substring(0, 100);
  };

  const preview = getPreviewText(content);
  const timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={(e) => {
        if (onDragStart) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("noteId", id);
          onDragStart(id);
        }
      }}
      className={`
        relative px-5 py-3.5 cursor-pointer border-b border-border/50
        transition-all duration-200 ease-out group
        ${
          isSelected
            ? "bg-secondary shadow-sm"
            : "hover:bg-secondary/50 hover:shadow-sm hover:scale-[1.01]"
        }
      `}
    >
      {/* Favorite Star Button */}
      {onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          className="absolute top-3 right-3 p-1 rounded hover:bg-accent transition-colors"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/60 group-hover:text-muted-foreground"}`} />
        </button>
      )}

      <h3 className={`text-sm font-semibold mb-1.5 truncate leading-snug pr-8 ${isSelected ? "text-foreground" : "text-foreground"}`}>
        {title || "Untitled"}
      </h3>
      <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2 leading-relaxed">
        {preview || "No content"}
      </p>
      <time className="text-xs text-muted-foreground font-medium">
        {timeAgo}
      </time>
    </div>
  );
}
