"use client";

import { useRef } from "react";
import { FolderTree, type FolderTreeRef } from "../folder-tree";
import { CreateFolderButton } from "@/modules/folders/components";
import { useNotes } from "../../contexts/NotesContext";
import { Folder, Trash2 } from "lucide-react";
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
  const { selectedFolderId, setSelectedFolderId, setSelectedNoteId } = useNotes();
  const convexUser = useConvexUser();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Get all notes count for "All Notes" section
  const notes = useQuery(
    api.notes.getNotes,
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Get deleted notes count for "Trash" section
  const deletedNotes = useQuery(
    api.notes.getDeletedNotes,
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

  const allNotesCount = notes?.length || 0;
  const deletedNotesCount = deletedNotes?.length || 0;
  const isTrashSelected = pathname === "/trash";
  const isAllNotesSelected = selectedFolderId === "all" && !isTrashSelected;

  // Get display name from user
  const displayName = user?.fullName || user?.firstName || user?.username || "User";

  // If collapsed, don't render
  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="w-[235px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">noteflow</h1>
      </div>

      {/* Folders Navigation */}
      <nav className="flex-1 px-3 py-4 pb-3 overflow-y-auto flex flex-col">
        {/* All Notes */}
        <button
          onClick={handleSelectAllNotes}
          className={`
            w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm mb-1
            transition-colors
            ${
              isAllNotesSelected
                ? "bg-folder-selected-bg text-foreground font-medium"
                : "text-sidebar-foreground hover:bg-folder-hover-bg"
            }
          `}
        >
          <Folder className={`w-4 h-4 ${isAllNotesSelected ? "text-folder-icon-color" : "text-muted-foreground"}`} />
          <span className="flex-1 text-left">All Notes</span>
          <span className="text-xs text-muted-foreground">{allNotesCount}</span>
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
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
