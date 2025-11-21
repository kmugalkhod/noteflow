"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useNotesStore } from "../../store/useNotesStore";
import { NotesListToolbar } from "./NotesListToolbar";
import { NoteListItem } from "./NoteListItem";
import { Loader2, FileText, Trash2, PanelRightClose, Search, LayoutGrid, LayoutList, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/modules/shared/lib/toast";
import { NoteListSkeleton } from "@/modules/shared/components";
import { DeleteNoteDialog } from "@/modules/notes/components/delete-note-dialog";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";

interface NotesListProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleNotesPanel?: () => void;
  isCollapsed?: boolean;
  width?: number;
}

export function NotesList({
  onToggleSidebar,
  isSidebarCollapsed = false,
  onToggleNotesPanel,
  isCollapsed = false,
  width = 300,
}: NotesListProps) {
  const convexUser = useConvexUser();
  const router = useRouter();

  // State management
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "title">("newest");
  const [viewMode, setViewMode] = useState<"card" | "compact">("card");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Debounce search for performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("notesViewMode") as "card" | "compact" | null;
    if (savedViewMode) setViewMode(savedViewMode);
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: "card" | "compact") => {
    setViewMode(mode);
    localStorage.setItem("notesViewMode", mode);
  };

  // Zustand store - select only what we need
  const selectedFolderId = useNotesStore((state) => state.selectedFolderId);
  const selectedNoteId = useNotesStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  const createNote = useMutation(api.notes.createNote);
  const deleteNote = useMutation(api.notes.deleteNote);
  const toggleFavorite = useMutation(api.notes.toggleFavorite);
  const moveNoteToFolder = useMutation(api.notes.moveNoteToFolder);

  // Get notes with minimal data (no content for performance)
  const notes = useQuery(
    api.notes.getNotesMinimal,
    convexUser
      ? {
          // null = uncategorized notes, undefined = all notes, specific ID = notes in that folder
          folderId: selectedFolderId === "all" ? null : selectedFolderId || undefined,
        }
      : "skip"
  );

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    if (!notes) return [];

    // Filter by search query
    let filtered = notes;
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = notes.filter((note) =>
        note.title.toLowerCase().includes(query) ||
        (note.contentPreview && note.contentPreview.toLowerCase().includes(query))
      );
    }

    // Sort notes
    const sorted = [...filtered];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case "oldest":
        sorted.sort((a, b) => a.updatedAt - b.updatedAt);
        break;
      case "title":
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
    }

    return sorted;
  }, [notes, debouncedSearch, sortOption]);

  // Find selected note
  const selectedNote = filteredAndSortedNotes.find((note) => note._id === selectedNoteId);

  // Display title directly from database - no cache to prevent flicker
  // Show actual title, or "Untitled" if note exists but has no title
  // Return undefined if note is still loading (selectedNoteId exists but selectedNote doesn't)
  const displayTitle = selectedNoteId && !selectedNote
    ? undefined // Loading
    : selectedNote?.title || "Untitled"; // Show title or "Untitled" if empty

  const handleNewNote = async () => {
    if (!convexUser) return;

    try {
      const noteId = await createNote({
        title: "Untitled",
        content: "",
        // If in "Uncategorized" view, create note without folder
        folderId: selectedFolderId === "all" ? undefined : (selectedFolderId || undefined),
      });
      setSelectedNoteId(noteId);
      router.push(`/note/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;

    const noteTitle = displayTitle || "Untitled";

    try {
      await deleteNote({ noteId: selectedNoteId });
      setSelectedNoteId(null);
      setShowDeleteDialog(false); // Close dialog
      // Navigate to workspace to clear the editor view
      router.push("/workspace");
      toast.success(`"${noteTitle}" moved to trash`);
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleSelectNote = (noteId: string) => {
    // Only update noteId - title comes from database
    setSelectedNoteId(noteId as any);
    router.push(`/note/${noteId}`);
  };

  // If collapsed, don't render
  if (isCollapsed) {
    return null;
  }

  return (
    <div
      className="h-screen bg-notes-list-bg border-r border-sidebar-border flex flex-col flex-shrink-0 transition-all"
      style={{ width: `${width}px` }}
    >
      {/* Header - Enhanced with Search */}
      <div className="px-4 py-4 border-b border-sidebar-border space-y-3">
        {/* Top Row: Title + Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">All Notes</h2>
          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <button
              onClick={() => handleViewModeChange(viewMode === "card" ? "compact" : "card")}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              title={`Switch to ${viewMode === "card" ? "compact" : "card"} view`}
            >
              {viewMode === "card" ? (
                <LayoutList className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {/* Delete button - only show when note is selected */}
            {selectedNoteId && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            )}
            <button
              onClick={handleNewNote}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              title="New note"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {/* Collapse button */}
            {onToggleNotesPanel && (
              <button
                onClick={onToggleNotesPanel}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                title="Hide notes panel (Cmd+\)"
              >
                <PanelRightClose className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-10 pr-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Stats + Sort */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {debouncedSearch ? (
              <span>{filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? 'result' : 'results'}</span>
            ) : (
              <span>{filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? 'note' : 'notes'}</span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              {sortOption === "newest" ? "Newest" : sortOption === "oldest" ? "Oldest" : "Title"}
              <ChevronDown className="w-3 h-3" />
            </button>
            {/* Sort Dropdown Menu */}
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg z-10 animate-scale-in">
                <button
                  onClick={() => { setSortOption("newest"); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${sortOption === "newest" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Newest
                </button>
                <button
                  onClick={() => { setSortOption("oldest"); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${sortOption === "oldest" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => { setSortOption("title"); setShowSortMenu(false); }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors ${sortOption === "title" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Title
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!convexUser || notes === undefined ? (
          <NoteListSkeleton count={6} />
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center animate-fade-in">
            <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
            {debouncedSearch ? (
              <>
                <h3 className="text-base font-semibold text-foreground mb-1">No results found</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Try a different search term
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-foreground mb-1">No notes yet</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Click the + button to create your first note
                </p>
              </>
            )}
          </div>
        ) : (
          <div key={selectedFolderId?.toString() || 'all'} className="animate-fade-in space-y-1">
            {filteredAndSortedNotes.map((note) => (
              <NoteListItem
                key={note._id}
                id={note._id}
                title={note.title}
                content={note.contentPreview}
                updatedAt={note.updatedAt}
                isSelected={selectedNoteId === note._id}
                isFavorite={note.isFavorite}
                viewMode={viewMode}
                onClick={() => handleSelectNote(note._id)}
                onFavorite={async () => {
                  await toggleFavorite({ noteId: note._id });
                }}
                onDragStart={(noteId) => {
                  // Store the dragged note ID for drop handling
                  sessionStorage.setItem("draggedNoteId", noteId);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Note Dialog */}
      <DeleteNoteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteNote}
        noteTitle={displayTitle}
      />
    </div>
  );
}
