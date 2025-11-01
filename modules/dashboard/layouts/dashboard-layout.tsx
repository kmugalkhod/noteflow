"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FolderSidebar } from "../components/folder-sidebar";
import { NotesList } from "../components/notes-list";
import { CommandPalette } from "@/modules/search/components";
import { EmptyEditorState } from "../components/EmptyEditorState";
import { ResizeHandle } from "@/modules/shared/components";
import {
  NOTES_PANEL_WIDTH_DEFAULT,
  NOTES_PANEL_WIDTH_MIN,
  NOTES_PANEL_WIDTH_MAX,
  STORAGE_KEYS,
} from "@/lib/constants";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotesPanelCollapsed, setIsNotesPanelCollapsed] = useState(false);
  const [notesPanelWidth, setNotesPanelWidth] = useState(NOTES_PANEL_WIDTH_DEFAULT);
  const [isResizing, setIsResizing] = useState(false);
  const pathname = usePathname();

  // Load state from localStorage on mount
  useEffect(() => {
    const sidebarCollapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    const notesCollapsed = localStorage.getItem(STORAGE_KEYS.NOTES_PANEL_COLLAPSED);
    const notesWidth = localStorage.getItem(STORAGE_KEYS.NOTES_PANEL_WIDTH);

    if (sidebarCollapsed !== null) {
      setIsSidebarCollapsed(sidebarCollapsed === "true");
    }
    if (notesCollapsed !== null) {
      setIsNotesPanelCollapsed(notesCollapsed === "true");
    }
    if (notesWidth !== null) {
      const width = parseInt(notesWidth, 10);
      if (!isNaN(width)) {
        setNotesPanelWidth(width);
      }
    }
  }, []);

  // Consolidated: Save all state to localStorage (prevents layout thrashing)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isSidebarCollapsed));
    localStorage.setItem(STORAGE_KEYS.NOTES_PANEL_COLLAPSED, String(isNotesPanelCollapsed));
    localStorage.setItem(STORAGE_KEYS.NOTES_PANEL_WIDTH, String(notesPanelWidth));
  }, [isSidebarCollapsed, isNotesPanelCollapsed, notesPanelWidth]);

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

  // Show empty state only when on workspace, stories, shared, or blog pages (not viewing a specific note, trash, favorites, or drawing)
  const isViewingNote = pathname?.startsWith("/note/");
  const isTrashPage = pathname === "/trash";
  const isFavoritesPage = pathname === "/favorites";
  const isDrawingPage = pathname === "/drawing";
  const showEmptyState = !isViewingNote && !isTrashPage && !isFavoritesPage && !isDrawingPage;

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = notesPanelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;

      // Enforce min/max constraints using constants
      const constrainedWidth = Math.min(
        Math.max(newWidth, NOTES_PANEL_WIDTH_MIN),
        NOTES_PANEL_WIDTH_MAX
      );
      setNotesPanelWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
        {/* Column 1: Folders Sidebar */}
        <FolderSidebar isCollapsed={isSidebarCollapsed} />

        {/* Column 2: Notes List - Hide on trash, favorites, and drawing pages */}
        {!isTrashPage && !isFavoritesPage && !isDrawingPage && (
          <>
            <NotesList
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleNotesPanel={() => setIsNotesPanelCollapsed(!isNotesPanelCollapsed)}
              isCollapsed={isNotesPanelCollapsed}
              width={notesPanelWidth}
            />

            {/* Resize Handle */}
            {!isNotesPanelCollapsed && (
              <ResizeHandle onMouseDown={handleResizeStart} isResizing={isResizing} />
            )}
          </>
        )}

        {/* Column 3: Note Editor/Content */}
        <main className="flex-1 overflow-auto bg-editor-bg relative">
          {/* Show notes panel button when collapsed - but not on trash, favorites, or drawing pages */}
          {isNotesPanelCollapsed && !isTrashPage && !isFavoritesPage && !isDrawingPage && (
            <button
              onClick={() => setIsNotesPanelCollapsed(false)}
              className="fixed top-4 left-4 z-10 p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors shadow-md"
              title="Show notes panel"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          )}
          {showEmptyState ? <EmptyEditorState /> : children}
        </main>

        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
  );
}
