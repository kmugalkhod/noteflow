"use client";

import { useReducer, useEffect, useRef, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Check, Loader2, FileText, Sparkles, Download } from "lucide-react";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { useNotesStore } from "@/modules/dashboard/store/useNotesStore";
import { FolderSelector } from "../folder-selector";
import { TagInput } from "@/modules/tags/components";
import { RichEditor, type RichEditorRef } from "../rich-editor";
import { CoverImage } from "../cover-image";
import { Button } from "@/components/ui/button";
import {
  serializeBlocks,
  deserializeBlocks,
  textToBlocks,
  blocksToText,
  type Block
} from "../../types/blocks";
import { exportNoteToMarkdown } from "../../utils/exportToMarkdown";
import { toast } from "@/modules/shared/lib/toast";
import { ShareButton } from "@/components/share/ShareButton";
import { DEBOUNCE_DELAY_MS, SAVE_INDICATOR_DURATION_MS } from "@/lib/constants";

interface NoteEditorProps {
  noteId: Id<"notes">;
}

// Extended type for note content with cover image
interface NoteContentWithCover {
  _id: Id<"notes">;
  title: string;
  content: string;
  blocks?: string;
  contentType?: "plain" | "rich";
  coverImage?: string;
  coverImageUrl?: string;
}

// State management with useReducer for better performance
interface EditorState {
  title: string;
  content: string;
  blocks: Block[];
  coverImage: string | undefined;
  tags: string[];
  isRichMode: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  isInitialized: boolean;
  isLoading: boolean;
  showSavedIndicator: boolean;
  // Last saved values for change detection
  lastSavedTitle: string;
  lastSavedContent: string;
  lastSavedBlocks: string | undefined;
  lastSavedCoverImage: string | undefined;
}

type EditorAction =
  | { type: "INIT_LOADING" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "INIT_NOTE"; payload: { title: string; content: string; blocks: Block[]; coverImage: string | undefined; blocksData: string | undefined } }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_BLOCKS"; payload: Block[] }
  | { type: "SET_COVER_IMAGE"; payload: string | undefined }
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "SET_RICH_MODE"; payload: boolean }
  | { type: "START_SAVING" }
  | { type: "SAVE_SUCCESS"; payload: { title: string; content: string; blocks: string | undefined; coverImage: string | undefined } }
  | { type: "SAVE_ERROR" }
  | { type: "HIDE_SAVED_INDICATOR" };

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "INIT_LOADING":
      return { ...state, isLoading: true, isInitialized: false, lastSaved: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "INIT_NOTE":
      return {
        ...state,
        title: action.payload.title,
        content: action.payload.content,
        blocks: action.payload.blocks,
        coverImage: action.payload.coverImage,
        lastSavedTitle: action.payload.title,
        lastSavedContent: action.payload.content,
        lastSavedBlocks: action.payload.blocksData,
        lastSavedCoverImage: action.payload.coverImage,
        isInitialized: true,
        isRichMode: true,
      };
    case "SET_TITLE":
      return { ...state, title: action.payload };
    case "SET_CONTENT":
      return { ...state, content: action.payload };
    case "SET_BLOCKS":
      return { ...state, blocks: action.payload };
    case "SET_COVER_IMAGE":
      return { ...state, coverImage: action.payload };
    case "SET_TAGS":
      return { ...state, tags: action.payload };
    case "SET_RICH_MODE":
      return { ...state, isRichMode: action.payload };
    case "START_SAVING":
      return { ...state, isSaving: true };
    case "SAVE_SUCCESS":
      return {
        ...state,
        isSaving: false,
        lastSaved: new Date(),
        showSavedIndicator: true,
        lastSavedTitle: action.payload.title,
        lastSavedContent: action.payload.content,
        lastSavedBlocks: action.payload.blocks,
        lastSavedCoverImage: action.payload.coverImage,
      };
    case "SAVE_ERROR":
      return { ...state, isSaving: false };
    case "HIDE_SAVED_INDICATOR":
      return { ...state, showSavedIndicator: false };
    default:
      return state;
  }
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  // Fetch content including title
  const noteContent = useQuery(api.notes.getNoteContent, { noteId }) as NoteContentWithCover | undefined;
  const noteTags = useQuery(api.tags.getTagsForNote, { noteId });
  const updateNote = useMutation(api.notes.updateNote);

  // Zustand store - for syncing selected note
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  // Consolidated state with useReducer for better performance
  const [state, dispatch] = useReducer(editorReducer, {
    title: "",
    content: "",
    blocks: [],
    coverImage: undefined,
    tags: [],
    isRichMode: true,
    isSaving: false,
    lastSaved: null,
    isInitialized: false,
    isLoading: true,
    showSavedIndicator: false,
    lastSavedTitle: "",
    lastSavedContent: "",
    lastSavedBlocks: undefined,
    lastSavedCoverImage: undefined,
  });

  const richEditorRef = useRef<RichEditorRef>(null);
  const currentNoteIdRef = useRef(noteId); // Track current note to prevent stale saves
  const debouncedTitle = useDebounce(state.title, DEBOUNCE_DELAY_MS);
  const debouncedContent = useDebounce(state.content, DEBOUNCE_DELAY_MS);
  const debouncedBlocks = useDebounce(state.blocks, DEBOUNCE_DELAY_MS);
  const debouncedCoverImage = useDebounce(state.coverImage, DEBOUNCE_DELAY_MS);

  // Use debounced title for ShareButton to prevent re-renders on every keystroke
  const shareButtonTitle = useDebounce(state.title, 500);

  // Sync noteId with context when note page loads
  useEffect(() => {
    setSelectedNoteId(noteId);
  }, [noteId, setSelectedNoteId]);

  // Reset when noteId changes
  useEffect(() => {
    currentNoteIdRef.current = noteId; // Update ref to track current note
    dispatch({ type: "INIT_LOADING" });
  }, [noteId]);

  // Check if note content exists after loading
  useEffect(() => {
    if (noteContent !== undefined) {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [noteContent]);

  // Initialize from Convex data ONLY ONCE per note
  useEffect(() => {
    if (noteContent && !state.isInitialized) {
      const initialContent = noteContent.content || "";
      const initialTitle = noteContent.title || "";
      const initialCoverImage = noteContent.coverImage; // Type-safe now!

      let initialBlocks: Block[];
      if (noteContent.blocks && noteContent.contentType === "rich") {
        const deserializedBlocks = deserializeBlocks(noteContent.blocks);
        initialBlocks = deserializedBlocks.length > 0 ? deserializedBlocks : textToBlocks(initialContent);
      } else {
        initialBlocks = textToBlocks(initialContent);
      }

      dispatch({
        type: "INIT_NOTE",
        payload: {
          title: initialTitle,
          content: initialContent,
          blocks: initialBlocks,
          coverImage: initialCoverImage,
          blocksData: noteContent.blocks,
        },
      });
    }
  }, [noteContent, state.isInitialized]);

  // Update tags when noteTags changes
  useEffect(() => {
    if (noteTags) {
      dispatch({ type: "SET_TAGS", payload: noteTags.map(tag => tag.name) });
    }
  }, [noteTags]);

  // Auto-save when debounced values change
  useEffect(() => {
    const { isInitialized, isRichMode, title, content, blocks, lastSavedTitle, lastSavedContent, lastSavedBlocks, lastSavedCoverImage } = state;

    // Don't save if not initialized or if noteId has changed (stale debounced values)
    if (!isInitialized || currentNoteIdRef.current !== noteId) return;

    // CRITICAL: Only save if debounced values match current state
    // This prevents saving stale debounced values from a previous note
    const currentPlainContent = isRichMode ? blocksToText(blocks) : content;
    const debouncedPlainContent = isRichMode ? blocksToText(debouncedBlocks) : debouncedContent;

    const debouncedMatchesCurrent =
      debouncedTitle === title &&
      debouncedPlainContent === currentPlainContent;

    if (!debouncedMatchesCurrent) {
      // Debounced values haven't caught up yet, don't save
      return;
    }

    const currentContent = isRichMode ? blocksToText(debouncedBlocks) : debouncedContent;
    const currentBlocks = isRichMode ? serializeBlocks(debouncedBlocks) : undefined;

    // Compare with last saved values (not server values) to detect changes
    const hasChanges =
      debouncedTitle !== lastSavedTitle ||
      currentContent !== lastSavedContent ||
      (isRichMode && currentBlocks !== lastSavedBlocks) ||
      debouncedCoverImage !== lastSavedCoverImage;

    if (hasChanges) {
      dispatch({ type: "START_SAVING" });

      updateNote({
        noteId,
        title: debouncedTitle,
        content: currentContent,
        contentType: isRichMode ? "rich" : "plain",
        blocks: currentBlocks,
        coverImage: debouncedCoverImage || null,
      })
        .then(() => {
          // Only update last saved values if we're still on the same note
          if (currentNoteIdRef.current === noteId) {
            dispatch({
              type: "SAVE_SUCCESS",
              payload: {
                title: debouncedTitle,
                content: currentContent,
                blocks: currentBlocks,
                coverImage: debouncedCoverImage,
              },
            });

            // Hide "Saved" message after configured duration
            setTimeout(() => {
              dispatch({ type: "HIDE_SAVED_INDICATOR" });
            }, SAVE_INDICATOR_DURATION_MS);
          }
        })
        .catch((error) => {
          console.error("Failed to save:", error);
          const errorMessage = error instanceof Error ? error.message : "Your changes could not be saved. Please try again.";
          toast.error("Failed to save note", errorMessage, () => {
            // Retry save by triggering a state update
            dispatch({ type: "SET_TITLE", payload: title + " " });
            setTimeout(() => dispatch({ type: "SET_TITLE", payload: title }), 0);
          });
          dispatch({ type: "SAVE_ERROR" });
        });
    }
  }, [debouncedTitle, debouncedContent, debouncedBlocks, debouncedCoverImage, state, noteId, updateNote]);

  // Handle rich editor changes
  const handleRichEditorChange = (newBlocks: Block[], serialized: string) => {
    dispatch({ type: "SET_BLOCKS", payload: newBlocks });
    dispatch({ type: "SET_CONTENT", payload: blocksToText(newBlocks) }); // Keep plain text version in sync
  };

  // Handle plain text changes
  const handlePlainTextChange = (newContent: string) => {
    dispatch({ type: "SET_CONTENT", payload: newContent });
    dispatch({ type: "SET_BLOCKS", payload: textToBlocks(newContent) }); // Keep blocks in sync
  };

  // Toggle between rich and plain mode
  const toggleEditorMode = () => {
    const newIsRichMode = !state.isRichMode;
    dispatch({ type: "SET_RICH_MODE", payload: newIsRichMode });

    if (newIsRichMode) {
      // Convert plain text to blocks
      const newBlocks = textToBlocks(state.content);
      dispatch({ type: "SET_BLOCKS", payload: newBlocks });
      richEditorRef.current?.setBlocks(newBlocks);
    } else {
      // Convert blocks to plain text
      const plainText = blocksToText(state.blocks);
      dispatch({ type: "SET_CONTENT", payload: plainText });
    }
  };

  // Export note to Markdown
  const handleExport = () => {
    try {
      exportNoteToMarkdown(state.title || "Untitled", state.blocks);
      toast.success("Note exported successfully");
    } catch (error) {
      console.error("Failed to export note:", error);
      toast.error("Failed to export note");
    }
  };

  // Show skeleton loader while fetching with smooth fade-in
  if (state.isLoading) {
    return (
      <div className="h-full flex flex-col bg-editor-bg px-8 py-16 w-full max-w-4xl mx-auto animate-fade-in">
        {/* Title skeleton - matches actual title styling */}
        <div className="h-16 bg-muted/20 rounded-lg animate-pulse w-2/3 mb-12 transition-opacity" />

        {/* Content skeleton - multiple lines with varying widths */}
        <div className="space-y-4 animate-pulse">
          <div className="h-5 bg-muted/15 rounded w-full transition-opacity" />
          <div className="h-5 bg-muted/15 rounded w-11/12 transition-opacity" />
          <div className="h-5 bg-muted/15 rounded w-4/5 transition-opacity" />
          <div className="h-5 bg-muted/15 rounded w-10/12 transition-opacity" />
          <div className="h-5 bg-muted/15 rounded w-3/4 transition-opacity" />
          <div className="h-5 bg-muted/15 rounded w-9/12 transition-opacity" />
        </div>
      </div>
    );
  }

  // Show error state if note content doesn't exist
  if (!noteContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-editor-bg px-6">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Note Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This note doesn't exist or has been deleted. Please select another note from the list or create a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-editor-bg animate-fade-in">
      {/* Action Buttons - Above Cover */}
      <div className="flex justify-end gap-2 px-8 pt-4 pb-2">
        <ShareButton noteId={noteId} noteTitle={shareButtonTitle} />
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export as Markdown
        </Button>
      </div>

      {/* Cover Image */}
      <CoverImage
        coverImage={state.coverImage}
        coverImageUrl={noteContent.coverImageUrl}
        noteId={noteId}
        onCoverChange={(newCoverImage) => dispatch({ type: "SET_COVER_IMAGE", payload: newCoverImage })}
        editable={true}
      />

      {/* Minimal Editor - Apple Notes Style with Rich Editing */}
      <div className="flex-1 overflow-auto px-8 py-12 w-full max-w-4xl mx-auto">
        <textarea
          value={state.title}
          onChange={(e) => dispatch({ type: "SET_TITLE", payload: e.target.value })}
          placeholder="Untitled"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Move focus to the editor
              richEditorRef.current?.focus();
            }
          }}
          className="w-full text-5xl font-semibold border-none focus:outline-none px-0 mb-8 placeholder:text-muted-foreground/20 bg-transparent leading-[1.15] tracking-[-0.02em] resize-none overflow-hidden text-foreground transition-colors"
        />

        {state.isInitialized && state.isRichMode ? (
          <RichEditor
            key={noteId} // Force remount on note change
            ref={richEditorRef}
            initialContent={serializeBlocks(state.blocks)}
            placeholder="Type '/' for commands or just start writing..."
            onChange={handleRichEditorChange}
            className="min-h-[calc(100vh-16rem)]"
          />
        ) : !state.isInitialized ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <textarea
            value={state.content}
            onChange={(e) => handlePlainTextChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-16rem)] text-base leading-relaxed border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none font-[inherit]"
          />
        )}
      </div>

      {/* Auto-save indicator (minimal, bottom-right corner) */}
      {(state.isSaving || state.showSavedIndicator) && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm animate-slide-up">
          {state.isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          ) : state.showSavedIndicator ? (
            <>
              <Check className="w-3 h-3 text-green-500 animate-scale-in" />
              <span className="text-green-600 dark:text-green-400">Saved</span>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
