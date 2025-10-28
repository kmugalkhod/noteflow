"use client";

import {
  Folder,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  EditFolderDialog,
  DeleteFolderDialog,
} from "@/modules/folders/components";

export function FolderList() {
  const convexUser = useConvexUser();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{
    id: Id<"folders">;
    name: string;
    color?: string;
    noteCount: number;
  } | null>(null);

  const folders = useQuery(
    api.folders.getFoldersWithCounts,
    convexUser ? {} : "skip"
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleEdit = (
    e: React.MouseEvent,
    folder: { _id: Id<"folders">; name: string; color?: string; noteCount: number }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFolder({
      id: folder._id,
      name: folder.name,
      color: folder.color,
      noteCount: folder.noteCount,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (
    e: React.MouseEvent,
    folder: { _id: Id<"folders">; name: string; noteCount: number }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFolder({
      id: folder._id,
      name: folder.name,
      noteCount: folder.noteCount,
    });
    setDeleteDialogOpen(true);
  };

  if (!folders || folders.length === 0) {
    return (
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground">No folders yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {folders.map((folder) => {
          const isExpanded = expandedFolders.has(folder._id);

          return (
            <div key={folder._id}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent/50 cursor-pointer group">
                <button
                  onClick={() => toggleFolder(folder._id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <Link
                  href={`/folder/${folder._id}`}
                  className="flex items-center gap-2 flex-1 text-sm"
                >
                  <Folder
                    className="w-4 h-4"
                    style={{ color: folder.color || undefined }}
                  />
                  <span className="flex-1">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {folder.noteCount}
                  </span>
                </Link>

                {/* Folder Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => handleEdit(e, folder)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e, folder)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {selectedFolder && (
        <EditFolderDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          folderId={selectedFolder.id}
          currentName={selectedFolder.name}
          currentColor={selectedFolder.color}
        />
      )}

      {/* Delete Dialog */}
      {selectedFolder && (
        <DeleteFolderDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          folderId={selectedFolder.id}
          folderName={selectedFolder.name}
          noteCount={selectedFolder.noteCount}
        />
      )}
    </>
  );
}
