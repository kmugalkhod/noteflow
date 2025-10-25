"use client";

import {
  Folder,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { FolderContextMenu } from "./FolderContextMenu";
import { useNotesStore } from "../../store/useNotesStore";
import { useRouter, usePathname } from "next/navigation";

interface FolderData {
  _id: Id<"folders">;
  userId: Id<"users">;
  name: string;
  color?: string;
  position?: number;
  parentId?: Id<"folders">;
  createdAt: number;
  noteCount: number;
  subfolderCount: number;
  hasChildren: boolean;
}

interface FolderTreeItemProps {
  folder: FolderData;
  depth: number;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  isChildExpanded: (folderId: string) => boolean;
  dragHandlers?: {
    handleDragStart: (e: React.DragEvent, item: any) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragEnter: (e: React.DragEvent, target: any) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, target: any) => void;
  };
  isDragging?: boolean;
}

export function FolderTreeItem({
  folder,
  depth,
  isExpanded,
  onToggle,
  isChildExpanded,
  dragHandlers,
  isDragging = false,
}: FolderTreeItemProps) {
  // Zustand store
  const selectedFolderId = useNotesStore((state) => state.selectedFolderId);
  const setSelectedFolderId = useNotesStore((state) => state.setSelectedFolderId);
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch child folders if expanded
  const childFolders = useQuery(
    api.folders.getNestedFolders,
    isExpanded
      ? { userId: folder.userId, parentId: folder._id }
      : "skip"
  );

  // Check if this folder is selected
  const isSelected = selectedFolderId === folder._id;

  // Handle folder selection
  const handleFolderClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the expand/collapse button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedFolderId(folder._id);
    setSelectedNoteId(null);

    // Navigate to workspace if currently on trash or favorites page
    // This ensures the notes panel becomes visible
    if (pathname === "/trash" || pathname === "/favorites") {
      router.push("/workspace");
    }
  };

  // Calculate indentation (each level adds 16px)
  const indentStyle = {
    paddingLeft: `${depth * 16 + 12}px`,
  };

  return (
    <>
      <FolderContextMenu
        folderId={folder._id}
        folderName={folder.name}
        folderColor={folder.color}
        noteCount={folder.noteCount}
      >
        <div
          onClick={handleFolderClick}
          className={`
            flex items-center gap-2 py-1.5 pr-3 rounded-md cursor-pointer group
            transition-all duration-200 ease-out
            ${
              isSelected
                ? "bg-folder-selected-bg text-foreground font-medium"
                : "hover:bg-folder-hover-bg text-sidebar-foreground hover:translate-x-0.5"
            }
          `}
          style={indentStyle}
          draggable={!!dragHandlers}
          onDragStart={
            dragHandlers
              ? (e) =>
                  dragHandlers.handleDragStart(e, {
                    type: "folder",
                    id: folder._id,
                    name: folder.name,
                    parentId: folder.parentId,
                  })
              : undefined
          }
          onDragEnd={dragHandlers?.handleDragEnd}
          onDragOver={dragHandlers?.handleDragOver}
          onDragEnter={
            dragHandlers
              ? (e) =>
                  dragHandlers.handleDragEnter(e, {
                    type: "folder",
                    folderId: folder._id,
                  })
              : undefined
          }
          onDragLeave={dragHandlers?.handleDragLeave}
          onDrop={
            dragHandlers
              ? (e) =>
                  dragHandlers.handleDrop(e, {
                    type: "folder",
                    folderId: folder._id,
                  })
              : undefined
          }
        >
        {/* Expand/Collapse Button */}
        {folder.hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(folder._id);
            }}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

          {/* Folder Content */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0 text-sm">
            <Folder
              className={`
                w-4 h-4 flex-shrink-0 transition-all duration-200
                ${isSelected ? "text-folder-icon-color scale-110" : "group-hover:scale-105"}
              `}
              style={folder.color && !isSelected ? { color: folder.color } : undefined}
            />
            <span className="flex-1 truncate">{folder.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {folder.noteCount}
            </span>
          </div>
        </div>
      </FolderContextMenu>

      {/* Recursively render child folders */}
      {isExpanded && childFolders && childFolders.length > 0 && (
        <div className="space-y-1">
          {childFolders.map((childFolder) => (
            <FolderTreeItem
              key={childFolder._id}
              folder={childFolder}
              depth={depth + 1}
              isExpanded={isChildExpanded(childFolder._id)}
              onToggle={onToggle}
              isChildExpanded={isChildExpanded}
              dragHandlers={dragHandlers}
              isDragging={isDragging}
            />
          ))}
        </div>
      )}
    </>
  );
}
