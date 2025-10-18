"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Custom hook for managing folder tree expand/collapse state
 * Syncs with user preferences in Convex
 */
export function useFolderTree() {
  const convexUser = useConvexUser();
  const [localExpandedFolders, setLocalExpandedFolders] = useState<Set<string>>(new Set());

  // Get user preferences (includes expandedFolders array)
  const user = useQuery(
    api.users.getUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Update user preferences mutation
  const updateUser = useMutation(api.users.updateUser);

  // Sync local state with server state on mount/user change
  useEffect(() => {
    if (user?.expandedFolders) {
      setLocalExpandedFolders(new Set(user.expandedFolders));
    }
  }, [user?.expandedFolders]);

  // Persist expanded folders to server
  const persistExpandedFolders = useCallback(
    async (expandedSet: Set<string>) => {
      if (!convexUser) return;

      try {
        await updateUser({
          userId: convexUser._id,
          expandedFolders: Array.from(expandedSet) as Id<"folders">[],
        });
      } catch (error) {
        console.error("Failed to persist expanded folders:", error);
      }
    },
    [convexUser, updateUser]
  );

  // Toggle folder expanded/collapsed
  const toggleFolder = useCallback(
    (folderId: string) => {
      setLocalExpandedFolders((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) {
          next.delete(folderId);
        } else {
          next.add(folderId);
        }

        // Persist to server (debounced via async)
        persistExpandedFolders(next);

        return next;
      });
    },
    [persistExpandedFolders]
  );

  // Expand a specific folder
  const expandFolder = useCallback(
    (folderId: string) => {
      setLocalExpandedFolders((prev) => {
        if (prev.has(folderId)) return prev;

        const next = new Set(prev);
        next.add(folderId);
        persistExpandedFolders(next);

        return next;
      });
    },
    [persistExpandedFolders]
  );

  // Collapse a specific folder
  const collapseFolder = useCallback(
    (folderId: string) => {
      setLocalExpandedFolders((prev) => {
        if (!prev.has(folderId)) return prev;

        const next = new Set(prev);
        next.delete(folderId);
        persistExpandedFolders(next);

        return next;
      });
    },
    [persistExpandedFolders]
  );

  // Expand all folders
  const expandAll = useCallback(
    (folderIds: string[]) => {
      const next = new Set(folderIds);
      setLocalExpandedFolders(next);
      persistExpandedFolders(next);
    },
    [persistExpandedFolders]
  );

  // Collapse all folders
  const collapseAll = useCallback(() => {
    setLocalExpandedFolders(new Set());
    persistExpandedFolders(new Set());
  }, [persistExpandedFolders]);

  // Check if a folder is expanded
  const isExpanded = useCallback(
    (folderId: string) => localExpandedFolders.has(folderId),
    [localExpandedFolders]
  );

  return {
    expandedFolders: localExpandedFolders,
    toggleFolder,
    expandFolder,
    collapseFolder,
    expandAll,
    collapseAll,
    isExpanded,
  };
}
