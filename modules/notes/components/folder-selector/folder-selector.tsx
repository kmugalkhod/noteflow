"use client";

import { Folder } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FolderSelectorProps {
  value?: Id<"folders">;
  onChange: (folderId?: Id<"folders"> | null) => void;
  placeholder?: string;
}

export function FolderSelector({
  value,
  onChange,
  placeholder = "No folder",
}: FolderSelectorProps) {
  const convexUser = useConvexUser();

  const folders = useQuery(
    api.folders.getFolders,
    convexUser ? {} : "skip"
  );

  if (!folders) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Folder className="h-4 w-4" />
        <span>Loading folders...</span>
      </div>
    );
  }

  return (
    <Select
      value={value || "none"}
      onValueChange={(val) => onChange(val === "none" ? null : (val as Id<"folders">))}
    >
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span>No folder</span>
          </div>
        </SelectItem>
        {folders.map((folder) => (
          <SelectItem key={folder._id} value={folder._id}>
            <div className="flex items-center gap-2">
              <Folder
                className="h-4 w-4"
                style={{ color: folder.color || undefined }}
              />
              <span>{folder.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
