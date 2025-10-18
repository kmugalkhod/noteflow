"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { FolderTreeItem } from "./FolderTreeItem";
import { InlineFolderInput } from "./InlineFolderInput";
import { useFolderTree } from "./useFolderTree";
import { useDragDrop } from "./useDragDrop";
import { Loader2 } from "lucide-react";

interface FolderTreeProps {
  onStartCreating?: () => void;
  onFinishCreating?: () => void;
}

export interface FolderTreeRef {
  startCreatingFolder: () => void;
}

export const FolderTree = forwardRef<FolderTreeRef, FolderTreeProps>(function FolderTree(
  { onStartCreating, onFinishCreating },
  ref
) {
  const convexUser = useConvexUser();
  const { isExpanded, toggleFolder } = useFolderTree();
  const {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useDragDrop();
  const createFolder = useMutation(api.folders.createFolder);

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Fetch root-level folders (folders with no parent)
  const rootFolders = useQuery(
    api.folders.getNestedFolders,
    convexUser ? { userId: convexUser._id, parentId: undefined } : "skip"
  );

  const handleCreateFolder = async (name: string) => {
    if (!convexUser) return;

    try {
      await createFolder({
        userId: convexUser._id,
        name,
        color: "#6B7280", // Default gray color
      });
      setIsCreatingFolder(false);
      onFinishCreating?.();
    } catch (error) {
      console.error("Failed to create folder:", error);
      throw error;
    }
  };

  const handleCancelCreate = () => {
    setIsCreatingFolder(false);
    onFinishCreating?.();
  };

  // Expose method to start creating folder
  const startCreatingFolder = () => {
    setIsCreatingFolder(true);
    onStartCreating?.();
  };

  // Expose the startCreatingFolder method via ref
  useImperativeHandle(ref, () => ({
    startCreatingFolder,
  }));

  const dragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };

  // Loading state - check AFTER all hooks are called
  if (rootFolders === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!rootFolders || rootFolders.length === 0) {
    return (
      <div className="space-y-1">
        {isCreatingFolder ? (
          <InlineFolderInput
            depth={0}
            onConfirm={handleCreateFolder}
            onCancel={handleCancelCreate}
          />
        ) : (
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">No folders yet</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="space-y-1"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, { type: "root" })}
    >
      {rootFolders.map((folder) => (
        <FolderTreeItem
          key={folder._id}
          folder={folder}
          depth={0}
          isExpanded={isExpanded(folder._id)}
          onToggle={toggleFolder}
          isChildExpanded={isExpanded}
          dragHandlers={dragHandlers}
          isDragging={isDragging}
        />
      ))}

      {/* Show inline input at the end when creating */}
      {isCreatingFolder && (
        <InlineFolderInput
          depth={0}
          onConfirm={handleCreateFolder}
          onCancel={handleCancelCreate}
        />
      )}
    </div>
  );
});
