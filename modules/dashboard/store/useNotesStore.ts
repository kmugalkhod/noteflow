import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Id } from "@/convex/_generated/dataModel";

interface NotesState {
  selectedFolderId: Id<"folders"> | "all" | null;
  selectedNoteId: Id<"notes"> | null;
  viewMode: "list" | "grid";

  // Title cache: Map of noteId -> title
  // This is the side panel cache, updated from database on load
  noteTitlesCache: Record<string, string>;

  // Actions
  setSelectedFolderId: (folderId: Id<"folders"> | "all" | null) => void;
  setSelectedNoteId: (noteId: Id<"notes"> | null) => void;
  setViewMode: (mode: "list" | "grid") => void;

  // Cache management
  setNoteTitlesCache: (titles: Record<string, string>) => void;
  updateNoteTitle: (noteId: string, title: string) => void;

  // Clear selection
  clearSelection: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      // Initial state
      selectedFolderId: "all",
      selectedNoteId: null,
      viewMode: "list",
      noteTitlesCache: {}, // This gets rebuilt from database on load

      // Actions
      setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),

      setSelectedNoteId: (noteId) => set({ selectedNoteId: noteId }),

      setViewMode: (mode) => set({ viewMode: mode }),

      // Set entire cache (from database on page load)
      setNoteTitlesCache: (titles) => set({ noteTitlesCache: titles }),

      // Update single title in cache (when user edits)
      updateNoteTitle: (noteId, title) =>
        set((state) => ({
          noteTitlesCache: {
            ...state.noteTitlesCache,
            [noteId]: title,
          },
        })),

      // Clear selection
      clearSelection: () =>
        set({
          selectedNoteId: null,
        }),
    }),
    {
      name: "noteflow-notes-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist everything including cache
      partialize: (state) => ({
        selectedNoteId: state.selectedNoteId,
        selectedFolderId: state.selectedFolderId,
        viewMode: state.viewMode,
        noteTitlesCache: state.noteTitlesCache,
      }),
    }
  )
);
