"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface NotesContextType {
  selectedFolderId: Id<"folders"> | "all" | null;
  setSelectedFolderId: (folderId: Id<"folders"> | "all" | null) => void;
  selectedNoteId: Id<"notes"> | null;
  setSelectedNoteId: (noteId: Id<"notes"> | null) => void;
  selectedNoteTitle: string;
  setSelectedNoteTitle: (title: string) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SELECTED_NOTE_ID: 'noteflow_selected_note_id',
  SELECTED_NOTE_TITLE: 'noteflow_selected_note_title',
};

export function NotesProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available
  const [selectedFolderId, setSelectedFolderId] = useState<Id<"folders"> | "all" | null>("all");
  const [selectedNoteId, setSelectedNoteId] = useState<Id<"notes"> | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_NOTE_ID);
      return stored ? (stored as Id<"notes">) : null;
    }
    return null;
  });
  const [selectedNoteTitle, setSelectedNoteTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_NOTE_TITLE) || "";
    }
    return "";
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Sync selectedNoteId to localStorage
  useEffect(() => {
    if (selectedNoteId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_NOTE_ID, selectedNoteId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_NOTE_ID);
    }
  }, [selectedNoteId]);

  // Sync selectedNoteTitle to localStorage
  useEffect(() => {
    if (selectedNoteTitle) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_NOTE_TITLE, selectedNoteTitle);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_NOTE_TITLE);
    }
  }, [selectedNoteTitle]);

  return (
    <NotesContext.Provider
      value={{
        selectedFolderId,
        setSelectedFolderId,
        selectedNoteId,
        setSelectedNoteId,
        selectedNoteTitle,
        setSelectedNoteTitle,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
