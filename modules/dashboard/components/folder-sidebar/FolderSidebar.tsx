"use client";

import { useRef } from "react";
import { FolderTree, type FolderTreeRef } from "../folder-tree";
import { CreateFolderButton } from "@/modules/folders/components";
import { useNotesStore } from "../../store/useNotesStore";
import { Folder, Trash2, Star } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { ThemeToggle } from "@/modules/shared/components/theme-toggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

interface FolderSidebarProps {
  isCollapsed?: boolean;
}

export function FolderSidebar({ isCollapsed = false }: FolderSidebarProps) {
  const folderTreeRef = useRef<FolderTreeRef>(null);

  // Zustand store
  const selectedFolderId = useNotesStore((state) => state.selectedFolderId);
  const setSelectedFolderId = useNotesStore((state) => state.setSelectedFolderId);
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  const convexUser = useConvexUser();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Get note counts with single optimized query
  const noteCounts = useQuery(
    api.notes.getNoteCounts,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  const handleNewFolder = () => {
    folderTreeRef.current?.startCreatingFolder();
  };

  const handleSelectAllNotes = () => {
    setSelectedFolderId("all");
    setSelectedNoteId(null);
    router.push("/");
  };

  const uncategorizedCount = noteCounts?.uncategorized || 0;
  const deletedNotesCount = noteCounts?.deleted || 0;
  const favoriteNotesCount = noteCounts?.favorites || 0;
  const isTrashSelected = pathname === "/trash";
  const isFavoritesSelected = pathname === "/favorites";
  const isUncategorizedSelected = selectedFolderId === "all" && !isTrashSelected && !isFavoritesSelected;

  // Get display name from user
  const displayName = user?.fullName || user?.firstName || user?.username || "User";

  // If collapsed, don't render
  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-[235px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">noteflow</h1>
      </div>

      {/* Folders Navigation */}
      <nav className="flex-1 px-4 py-4 pb-3 overflow-y-auto flex flex-col">
        {/* Uncategorized Notes */}
        <button
          onClick={handleSelectAllNotes}
          className={`
            w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm mb-1
            transition-colors
            ${
              isUncategorizedSelected
                ? "bg-folder-selected-bg text-foreground font-medium"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Folder className={`w-4 h-4 ${isUncategorizedSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Uncategorized</span>
          <span className="text-xs text-muted-foreground">{uncategorizedCount}</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => router.push("/favorites")}
          className={`
            w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm mb-1
            transition-colors
            ${
              isFavoritesSelected
                ? "bg-folder-selected-bg text-foreground font-medium"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Star className={`w-4 h-4 ${isFavoritesSelected ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Favorites</span>
          <span className="text-xs text-muted-foreground">{favoriteNotesCount}</span>
        </button>

        {/* Trash */}
        <button
          onClick={() => router.push("/trash")}
          className={`
            w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm mb-1
            transition-colors
            ${
              isTrashSelected
                ? "bg-folder-selected-bg text-foreground font-medium"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Trash2 className={`w-4 h-4 ${isTrashSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Trash</span>
          <span className="text-xs text-muted-foreground">{deletedNotesCount}</span>
        </button>

        {/* Folders Section Header */}
        <div className="px-3 pt-4 pb-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Folders
          </h3>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto">
          <FolderTree ref={folderTreeRef} />
        </div>

        {/* New Folder Button - Above bottom line */}
        <div className="pt-2">
          <CreateFolderButton onClick={handleNewFolder} />
        </div>
      </nav>

      {/* Footer - User & Theme */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "shadow-xl"
                }
              }}
            />
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {displayName}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
