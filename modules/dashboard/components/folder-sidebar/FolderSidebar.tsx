"use client";

import { useRef } from "react";
import { FolderTree, type FolderTreeRef } from "../folder-tree";
import { CreateFolderButton } from "@/modules/folders/components";
import { useNotesStore } from "../../store/useNotesStore";
import { Folder, Trash2, Star, Paintbrush, PanelLeftClose, Settings } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { ThemeToggle } from "@/modules/shared/components/theme-toggle";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

interface FolderSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function FolderSidebar({ isCollapsed = false, onToggle }: FolderSidebarProps) {
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
    convexUser ? {} : "skip"
  );

  const handleNewFolder = () => {
    folderTreeRef.current?.startCreatingFolder();
  };

  const handleSelectAllNotes = () => {
    setSelectedFolderId("all");
    setSelectedNoteId(null);
    router.push("/workspace");
  };

  const uncategorizedCount = noteCounts?.uncategorized || 0;
  const deletedNotesCount = noteCounts?.deleted || 0;
  const favoriteNotesCount = noteCounts?.favorites || 0;
  const isTrashSelected = pathname === "/trash";
  const isFavoritesSelected = pathname === "/favorites";
  const isDrawingSelected = pathname === "/drawing";
  const isSettingsSelected = pathname === "/settings";
  const isUncategorizedSelected = selectedFolderId === "all" && !isTrashSelected && !isFavoritesSelected && !isDrawingSelected && !isSettingsSelected;

  // Get display name from user
  const displayName = user?.fullName || user?.firstName || user?.username || "User";

  // If collapsed, don't render
  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-[250px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">noteflow</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your Personal Workspace</p>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-folder-hover-bg transition-colors"
              title="Hide sidebar (Cmd+B)"
            >
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Folders Navigation */}
      <nav className="flex-1 px-3 py-3 pb-2 overflow-y-auto flex flex-col">
        {/* Uncategorized Notes */}
        <button
          onClick={handleSelectAllNotes}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5
            transition-all duration-200
            ${
              isUncategorizedSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Folder className={`w-[18px] h-[18px] flex-shrink-0 ${isUncategorizedSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">All Notes</span>
          {uncategorizedCount > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">{uncategorizedCount}</span>
          )}
        </button>

        {/* Favorites */}
        <button
          onClick={() => router.push("/favorites")}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5
            transition-all duration-200
            ${
              isFavoritesSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Star className={`w-[18px] h-[18px] flex-shrink-0 ${isFavoritesSelected ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Favorites</span>
          {favoriteNotesCount > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">{favoriteNotesCount}</span>
          )}
        </button>

        {/* Trash */}
        <button
          onClick={() => router.push("/trash")}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5
            transition-all duration-200
            ${
              isTrashSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Trash2 className={`w-[18px] h-[18px] flex-shrink-0 ${isTrashSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Trash</span>
          {deletedNotesCount > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">{deletedNotesCount}</span>
          )}
        </button>

        {/* Drawing */}
        <button
          onClick={() => router.push("/drawing")}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5
            transition-all duration-200
            ${
              isDrawingSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Paintbrush className={`w-[18px] h-[18px] flex-shrink-0 ${isDrawingSelected ? "text-purple-500" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Drawing</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => router.push("/settings")}
          className={`
            w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5
            transition-all duration-200
            ${
              isSettingsSelected
                ? "bg-folder-selected-bg text-foreground font-medium shadow-sm"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Settings className={`w-[18px] h-[18px] flex-shrink-0 ${isSettingsSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">Settings</span>
        </button>

        {/* Folders Section Header */}
        <div className="px-2.5 pt-5 pb-1.5">
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
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
      <div className="border-t border-sidebar-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7",
                  userButtonPopoverCard: "shadow-xl"
                }
              }}
            />
            <span className="text-[13px] font-medium text-sidebar-foreground truncate">
              {displayName}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
