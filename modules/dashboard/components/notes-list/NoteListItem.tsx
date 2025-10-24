"use client";

import { formatDistanceToNow } from "date-fns";
import type { Id } from "@/convex/_generated/dataModel";

interface NoteListItemProps {
  id: Id<"notes">;
  title: string;
  content: string;
  updatedAt: number;
  isSelected: boolean;
  onClick: () => void;
}

export function NoteListItem({
  id,
  title,
  content,
  updatedAt,
  isSelected,
  onClick,
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
      className={`
        px-5 py-3.5 cursor-pointer border-b border-border/50
        transition-all duration-200 ease-out
        ${
          isSelected
            ? "bg-secondary shadow-sm"
            : "hover:bg-secondary/50 hover:shadow-sm hover:scale-[1.01]"
        }
      `}
    >
      <h3 className={`text-sm font-semibold mb-1.5 truncate leading-snug ${isSelected ? "text-foreground" : "text-foreground"}`}>
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
