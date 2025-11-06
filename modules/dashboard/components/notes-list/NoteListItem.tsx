"use client";

import { memo } from "react";
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

export const NoteListItem = memo(function NoteListItem({
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
        relative px-3 py-3 cursor-pointer rounded-lg border
        transition-all duration-200 ease-out group
        ${
          isSelected
            ? "bg-primary/5 border-primary/20 shadow-sm"
            : "bg-card border-border/50 hover:border-border hover:shadow-sm"
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
          className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-accent transition-colors"
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`} />
        </button>
      )}

      <h3 className={`text-[13px] font-semibold mb-1 truncate leading-tight pr-7 ${isSelected ? "text-foreground" : "text-foreground"}`}>
        {title || "Untitled"}
      </h3>
      <p className="text-[12px] text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
        {preview || "No content"}
      </p>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <time className="font-normal">
          Last modified {timeAgo}
        </time>
        {/* Word count placeholder - can be added later */}
        {/* <span>450 words</span> */}
      </div>
    </div>
  );
});
