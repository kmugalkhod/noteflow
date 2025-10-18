"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NotesProvider } from "../contexts/NotesContext";
import { FolderSidebar } from "../components/folder-sidebar";
import { NotesList } from "../components/notes-list";
import { CommandPalette } from "@/modules/search/components";
import { EmptyEditorState } from "../components/EmptyEditorState";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Show empty state when on workspace, stories, shared, blog, or trash pages (not viewing a specific note)
  const isViewingNote = pathname?.startsWith("/note/");
  const showEmptyState = !isViewingNote;

  return (
    <NotesProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Column 1: Folders Sidebar */}
        <FolderSidebar />

        {/* Column 2: Notes List */}
        <NotesList />

        {/* Column 3: Note Editor/Content */}
        <main className="flex-1 overflow-auto bg-editor-bg">
          {showEmptyState ? <EmptyEditorState /> : children}
        </main>

        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
    </NotesProvider>
  );
}
