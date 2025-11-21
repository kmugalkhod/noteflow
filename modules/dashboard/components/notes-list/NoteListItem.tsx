"use client";

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";
import { Star } from "lucide-react";
import { formatRelativeDate, formatTime } from "@/modules/shared/utils/format-relative-date";
import { countWords } from "@/modules/shared/utils/text-utils";

interface NoteListItemProps {
  id: Id<"notes">;
  title: string;
  content: string;
  updatedAt: number;
  isSelected: boolean;
  isFavorite?: boolean;
  viewMode?: "card" | "compact";
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
  viewMode = "card",
  onClick,
  onFavorite,
  onDragStart,
}: NoteListItemProps) {
  // Extract plain text from content (remove any markdown/formatting)
  const getPreviewText = (text: string) => {
    return text.replace(/[#*_`~\[\]]/g, "").trim().substring(0, 100);
  };

  const preview = getPreviewText(content);
  const relativeDate = formatRelativeDate(updatedAt);
  const time = formatTime(updatedAt);
  const wordCount = countWords(content);

  // Compact mode: smaller padding, no preview
  if (viewMode === "compact") {
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
          relative px-3 py-2 cursor-pointer rounded-lg border
          transition-all duration-200 ease-out group
          ${
            isSelected
              ? "bg-primary/5 border-primary/20"
              : "bg-transparent border-transparent hover:bg-accent/50"
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
            className="absolute top-2 right-2 p-0.5 rounded hover:bg-accent transition-colors"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-3 h-3 ${isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`} />
          </button>
        )}

        <div className="flex items-center justify-between pr-6">
          <h3 className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
            {title || "Untitled"}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
          <span>{relativeDate}</span>
          {wordCount > 0 && (
            <>
              <span>•</span>
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Card mode: full preview with metadata
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
        relative px-4 py-3 cursor-pointer rounded-lg border
        transition-all duration-200 ease-out group
        ${
          isSelected
            ? "bg-primary/5 border-primary/20 shadow-sm"
            : "bg-transparent border-transparent hover:bg-accent/50 hover:border-border/50"
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
          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`} />
        </button>
      )}

      <div className="flex items-start justify-between mb-1">
        <h3 className={`text-sm font-semibold truncate leading-tight pr-8 ${isSelected ? "text-primary" : "text-foreground"}`}>
          {title || "Untitled"}
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
        {preview || "No content"}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-medium">
        <span className={isSelected ? "text-primary/70" : ""}>{relativeDate}</span>
        <span>•</span>
        <span>{time}</span>
        {wordCount > 0 && (
          <>
            <span>•</span>
            <span className="bg-muted/50 px-2 py-0.5 rounded text-[9px]">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </>
        )}
      </div>
    </div>
  );
});
