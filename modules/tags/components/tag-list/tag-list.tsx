"use client";

import { Hash, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TagListProps {
  tags: string[];
  onRemoveTag?: (tag: string) => void;
  variant?: "default" | "secondary" | "outline";
  removable?: boolean;
  className?: string;
}

export function TagList({ 
  tags, 
  onRemoveTag, 
  variant = "secondary",
  removable = false,
  className = ""
}: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={variant}
          className="flex items-center gap-1 px-2 py-1 text-xs"
        >
          <Hash className="h-3 w-3" />
          {tag}
          {removable && onRemoveTag && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={() => onRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Badge>
      ))}
    </div>
  );
}