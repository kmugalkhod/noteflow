"use client";

import { Badge } from "@/components/ui/badge";
import { Folder } from "lucide-react";

interface OriginalLocationBadgeProps {
  folderName?: string | null;
  folderPath?: string | null;
  className?: string;
}

/**
 * OriginalLocationBadge Component
 *
 * Displays a badge showing the original folder location of a deleted note
 * Used in trash view to help users understand where notes came from
 */
export function OriginalLocationBadge({
  folderName,
  folderPath,
  className,
}: OriginalLocationBadgeProps) {
  // If no folder, show "Root"
  if (!folderName) {
    return (
      <Badge variant="outline" className={className}>
        Root
      </Badge>
    );
  }

  // Show folder name with icon
  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 ${className || ""}`}
      title={folderPath || folderName}
    >
      <Folder className="w-3 h-3" />
      {folderName}
    </Badge>
  );
}
