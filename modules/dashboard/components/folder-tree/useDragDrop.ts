"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type DragItem = {
  type: "folder" | "note";
  id: string;
  name: string;
  parentId?: string;
};

type DropTarget = {
  type: "folder" | "root";
  folderId?: string;
};

export function useDragDrop() {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mutations
  const moveFolderToFolder = useMutation(api.folders.moveFolderToFolder);
  const moveNoteToFolder = useMutation(api.notes.moveNoteToFolder);

  // Start dragging
  const handleDragStart = useCallback(
    (e: React.DragEvent, item: DragItem) => {
      setDraggedItem(item);
      setIsDragging(true);

      // Set drag data for browser compatibility
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(item));

      // Add visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "0.5";
      }
    },
    []
  );

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropTarget(null);

    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  }, []);

  // Handle drag over (required for drop to work)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drag enter (visual feedback)
  const handleDragEnter = useCallback(
    (e: React.DragEvent, target: DropTarget) => {
      e.preventDefault();
      setDropTarget(target);

      // Add visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add("drag-over");
      }
    },
    []
  );

  // Handle drag leave (remove visual feedback)
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only remove feedback if leaving the element (not entering a child)
    if (e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        e.currentTarget.classList.remove("drag-over");
      }
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    async (e: React.DragEvent, target: DropTarget) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove("drag-over");
      }

      if (!draggedItem) return;

      // Get drop target folder ID (undefined for root)
      const targetFolderId = target.type === "folder" ? target.folderId : undefined;

      try {
        if (draggedItem.type === "folder") {
          // Move folder
          // Don't move if dropping on itself
          if (draggedItem.id === targetFolderId) {
            return;
          }

          // Don't move if already in this folder
          if (draggedItem.parentId === targetFolderId) {
            return;
          }

          await moveFolderToFolder({
            folderId: draggedItem.id as Id<"folders">,
            newParentId: targetFolderId as Id<"folders"> | undefined,
          });

          console.log(`Moved folder "${draggedItem.name}" to ${target.type === "root" ? "root" : "folder"}`);
        } else if (draggedItem.type === "note") {
          // Move note
          // Don't move if already in this folder
          if (draggedItem.parentId === targetFolderId) {
            return;
          }

          await moveNoteToFolder({
            noteId: draggedItem.id as Id<"notes">,
            folderId: targetFolderId ? (targetFolderId as Id<"folders">) : null,
          });

          console.log(`Moved note "${draggedItem.name}" to ${target.type === "root" ? "root" : "folder"}`);
        }
      } catch (error) {
        console.error("Failed to move item:", error);
        // You could add toast notification here
      } finally {
        setDraggedItem(null);
        setDropTarget(null);
        setIsDragging(false);
      }
    },
    [draggedItem, moveFolderToFolder, moveNoteToFolder]
  );

  return {
    draggedItem,
    dropTarget,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}
