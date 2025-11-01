import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Id } from "@/convex/_generated/dataModel";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Notes store for managing note selection and view mode
 * Note: Removed noteTitlesCache - titles come directly from Convex real-time queries
 */
interface NotesState {
  selectedFolderId: Id<"folders"> | "all" | null;
  selectedNoteId: Id<"notes"> | null;
  viewMode: "list" | "grid";

  // Actions
  setSelectedFolderId: (folderId: Id<"folders"> | "all" | null) => void;
  setSelectedNoteId: (noteId: Id<"notes"> | null) => void;
  setViewMode: (mode: "list" | "grid") => void;
  clearSelection: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      // Initial state
      selectedFolderId: "all",
      selectedNoteId: null,
      viewMode: "list",

      // Actions
      setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),
      setSelectedNoteId: (noteId) => set({ selectedNoteId: noteId }),
      setViewMode: (mode) => set({ viewMode: mode }),

      // Clear selection
      clearSelection: () => set({ selectedNoteId: null }),
    }),
    {
      name: STORAGE_KEYS.NOTEFLOW_NOTES_STORAGE,
      storage: createJSONStorage(() => localStorage),
      // Only persist selection state and view mode (no cache)
      partialize: (state) => ({
        selectedNoteId: state.selectedNoteId,
        selectedFolderId: state.selectedFolderId,
        viewMode: state.viewMode,
      }),
    }
  )
);
