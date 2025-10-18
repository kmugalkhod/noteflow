"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface NotesContextType {
  selectedFolderId: Id<"folders"> | "all" | null;
  setSelectedFolderId: (folderId: Id<"folders"> | "all" | null) => void;
  selectedNoteId: Id<"notes"> | null;
  setSelectedNoteId: (noteId: Id<"notes"> | null) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [selectedFolderId, setSelectedFolderId] = useState<Id<"folders"> | "all" | null>("all");
  const [selectedNoteId, setSelectedNoteId] = useState<Id<"notes"> | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <NotesContext.Provider
      value={{
        selectedFolderId,
        setSelectedFolderId,
        selectedNoteId,
        setSelectedNoteId,
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
