"use client";

import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  FileText,
  FolderPlus,
  Edit,
  Trash2,
  FolderOpen,
  Star,
  Copy,
  Palette,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import {
  EditFolderDialog,
  DeleteFolderDialog,
} from "@/modules/folders/components";

interface FolderContextMenuProps {
  folderId: Id<"folders">;
  folderName: string;
  folderColor?: string;
  noteCount: number;
  children: React.ReactNode;
}

const FOLDER_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#9333EA" },
  { name: "Pink", value: "#EC4899" },
];

export function FolderContextMenu({
  folderId,
  folderName,
  folderColor,
  noteCount,
  children,
}: FolderContextMenuProps) {
  const router = useRouter();
  const convexUser = useConvexUser();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mutations
  const createNote = useMutation(api.notes.createNote);
  const createFolder = useMutation(api.folders.createFolder);
  const updateFolder = useMutation(api.folders.updateFolder);

  // Get all folders for "Move to..." submenu
  const allFolders = useQuery(
    api.folders.getFoldersWithCounts,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const handleNewNote = async () => {
    if (!convexUser) return;

    try {
      const noteId = await createNote({
        userId: convexUser._id,
        folderId: folderId,
        title: "Untitled",
        content: "",
      });

      router.push(`/note/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleNewSubfolder = async () => {
    if (!convexUser) return;

    try {
      const newFolderId = await createFolder({
        userId: convexUser._id,
        name: "New Subfolder",
        parentId: folderId,
      });

      console.log("Created subfolder:", newFolderId);
    } catch (error) {
      console.error("Failed to create subfolder:", error);
    }
  };

  const handleChangeColor = async (color: string) => {
    try {
      await updateFolder({
        folderId,
        color,
      });
    } catch (error) {
      console.error("Failed to update folder color:", error);
    }
  };

  const handleOpenFolder = () => {
    router.push(`/folder/${folderId}`);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={handleOpenFolder}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Open Folder
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={handleNewNote}>
            <FileText className="mr-2 h-4 w-4" />
            New Note
          </ContextMenuItem>

          <ContextMenuItem onClick={handleNewSubfolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Subfolder
          </ContextMenuItem>

          <ContextMenuSeparator />

          {/* Color submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {FOLDER_COLORS.map((color) => (
                <ContextMenuItem
                  key={color.value}
                  onClick={() => handleChangeColor(color.value)}
                >
                  <div
                    className="mr-2 h-4 w-4 rounded border"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                  {folderColor === color.value && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleChangeColor("")}>
                None
                {!folderColor && <span className="ml-auto text-xs">✓</span>}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>

          <ContextMenuItem onClick={() => console.log("Duplicate folder")}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Edit Dialog */}
      <EditFolderDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        folderId={folderId}
        currentName={folderName}
        currentColor={folderColor}
      />

      {/* Delete Dialog */}
      <DeleteFolderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        folderId={folderId}
        folderName={folderName}
        noteCount={noteCount}
      />
    </>
  );
}
