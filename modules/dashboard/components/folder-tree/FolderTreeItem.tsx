"use client";

import { memo, useState } from "react";
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
import { useAnimationState } from "@/modules/shared/hooks/use-animation-state";

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

export const FolderTreeItem = memo(function FolderTreeItem({
  folder,
  depth,
  isExpanded,
  onToggle,
  isChildExpanded,
  dragHandlers,
  isDragging = false,
}: FolderTreeItemProps) {
  // Animation state
  const { conditionalAnimationClass } = useAnimationState();
  const [isDragOver, setIsDragOver] = useState(false);

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
      ? { parentId: folder._id }
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

  // Calculate indentation (each level adds 16px, base 12px for 8px-based spacing system)
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
          className={conditionalAnimationClass(
            `flex items-center gap-2 py-2 pr-2.5 rounded-lg cursor-pointer group transition-all duration-200 ${
              isSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "hover:bg-folder-hover-bg text-sidebar-foreground"
            } ${isDragging ? "opacity-50 scale-95" : ""} ${
              isDragOver ? "bg-primary/10 border-2 border-primary/30 border-dashed rounded-lg" : ""
            }`,
            !isSelected && !isDragging ? "" : ""
          )}
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
              ? (e) => {
                  setIsDragOver(true);
                  dragHandlers.handleDragEnter(e, {
                    type: "folder",
                    folderId: folder._id,
                  });
                }
              : undefined
          }
          onDragLeave={(e) => {
            setIsDragOver(false);
            dragHandlers?.handleDragLeave(e);
          }}
          onDrop={
            dragHandlers
              ? (e) => {
                  setIsDragOver(false);
                  dragHandlers.handleDrop(e, {
                    type: "folder",
                    folderId: folder._id,
                  });
                }
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
              <ChevronDown className="w-[16px] h-[16px]" />
            ) : (
              <ChevronRight className="w-[16px] h-[16px]" />
            )}
          </button>
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

          {/* Folder Content */}
          <div className="flex items-center gap-2 flex-1 min-w-0 text-[13px]">
            <Folder
              className={`
                w-[16px] h-[16px] flex-shrink-0 transition-all duration-200
                ${isSelected ? "text-folder-icon-color" : ""}
              `}
              style={folder.color && !isSelected ? { color: folder.color } : undefined}
            />
            <span className="flex-1 truncate">{folder.name}</span>
            {folder.noteCount > 0 && (
              <span className="text-[11px] text-muted-foreground flex-shrink-0 font-normal">
                {folder.noteCount}
              </span>
            )}
          </div>
        </div>
      </FolderContextMenu>

      {/* Recursively render child folders */}
      {isExpanded && childFolders && childFolders.length > 0 && (
        <div className="space-y-0.5 mt-0.5">
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
});
