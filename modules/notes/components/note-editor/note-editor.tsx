"use client";

import { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";

interface NoteEditorProps {
  noteId: Id<"notes">;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  // Fetch content including title
  const noteContent = useQuery(api.notes.getNoteContent, { noteId });
  const noteTags = useQuery(api.tags.getTagsForNote, { noteId });
  const updateNote = useMutation(api.notes.updateNote);

  // Zustand store - for syncing selected note
  const setSelectedNoteId = useNotesStore((state) => state.setSelectedNoteId);

  // Initialize title empty - will load from database
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [isRichMode, setIsRichMode] = useState(true); // Default to rich mode
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  // Track last saved values for change detection (instead of comparing with server)
  const [lastSavedTitle, setLastSavedTitle] = useState("");
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [lastSavedBlocks, setLastSavedBlocks] = useState<string | undefined>(undefined);
  const [lastSavedCoverImage, setLastSavedCoverImage] = useState<string | undefined>(undefined);

  const richEditorRef = useRef<RichEditorRef>(null);
  const currentNoteIdRef = useRef(noteId); // Track current note to prevent stale saves
  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(content, 1500);
  const debouncedBlocks = useDebounce(blocks, 1500);
  const debouncedCoverImage = useDebounce(coverImage, 1500);

  // Sync noteId with context when note page loads
  useEffect(() => {
    setSelectedNoteId(noteId);
  }, [noteId, setSelectedNoteId]);

  // Reset when noteId changes
  useEffect(() => {
    currentNoteIdRef.current = noteId; // Update ref to track current note
    setIsInitialized(false);
    setIsLoading(true);
    setLastSaved(null);
  }, [noteId]);

  // Check if note content exists after loading
  useEffect(() => {
    if (noteContent !== undefined) {
      setIsLoading(false);
    }
  }, [noteContent]);

  // Initialize from Convex data ONLY ONCE per note
  useEffect(() => {
    if (noteContent && !isInitialized) {
      const initialContent = noteContent.content || "";
      const initialTitle = noteContent.title || "";
      const initialCoverImage = (noteContent as any).coverImage;

      // Set all state including title, content, blocks, coverImage, and last saved values
      setTitle(initialTitle);
      setContent(initialContent);
      setCoverImage(initialCoverImage);
      setIsRichMode(true);

      if (noteContent.blocks && noteContent.contentType === "rich") {
        const deserializedBlocks = deserializeBlocks(noteContent.blocks);
        const initialBlocks = deserializedBlocks.length > 0 ? deserializedBlocks : textToBlocks(initialContent);
        setBlocks(initialBlocks);
      } else {
        const initialBlocks = textToBlocks(initialContent);
        setBlocks(initialBlocks);
      }

      // Set last saved values to match current values (prevents spurious saves)
      setLastSavedTitle(initialTitle);
      setLastSavedContent(initialContent);
      setLastSavedBlocks(noteContent.blocks);
      setLastSavedCoverImage(initialCoverImage);

      setIsInitialized(true);
    }
  }, [noteContent, isInitialized]);

  // Update tags when noteTags changes
  useEffect(() => {
    if (noteTags) {
      setTags(noteTags.map(tag => tag.name));
    }
  }, [noteTags]);

  // Auto-save when debounced values change
  useEffect(() => {
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
      setIsSaving(true);
      updateNote({
        noteId,
        title: debouncedTitle,
        content: currentContent,
        contentType: isRichMode ? "rich" : "plain",
        blocks: currentBlocks,
        coverImage: debouncedCoverImage,
      })
        .then(() => {
          // Only update last saved values if we're still on the same note
          if (currentNoteIdRef.current === noteId) {
            setLastSavedTitle(debouncedTitle);
            setLastSavedContent(currentContent);
            setLastSavedBlocks(currentBlocks);
            setLastSavedCoverImage(debouncedCoverImage);

            setLastSaved(new Date());
            setIsSaving(false);
            setShowSavedIndicator(true);

            // Hide "Saved" message after 2 seconds
            setTimeout(() => {
              setShowSavedIndicator(false);
            }, 2000);
          }
        })
        .catch((error) => {
          console.error("Failed to save:", error);
          setIsSaving(false);
        });
    }
  }, [debouncedTitle, debouncedContent, debouncedBlocks, debouncedCoverImage, title, content, blocks, coverImage, isRichMode, isInitialized, lastSavedTitle, lastSavedContent, lastSavedBlocks, lastSavedCoverImage, noteId, updateNote]);

  // Handle rich editor changes
  const handleRichEditorChange = (newBlocks: Block[], serialized: string) => {
    setBlocks(newBlocks);
    setContent(blocksToText(newBlocks)); // Keep plain text version in sync
  };

  // Handle plain text changes
  const handlePlainTextChange = (newContent: string) => {
    setContent(newContent);
    setBlocks(textToBlocks(newContent)); // Keep blocks in sync
  };

  // Toggle between rich and plain mode
  const toggleEditorMode = () => {
    const newIsRichMode = !isRichMode;
    setIsRichMode(newIsRichMode);

    if (newIsRichMode) {
      // Convert plain text to blocks
      const newBlocks = textToBlocks(content);
      setBlocks(newBlocks);
      richEditorRef.current?.setBlocks(newBlocks);
    } else {
      // Convert blocks to plain text
      const plainText = blocksToText(blocks);
      setContent(plainText);
    }
  };

  // Export note to Markdown
  const handleExport = () => {
    try {
      exportNoteToMarkdown(title || "Untitled", blocks);
      toast.success("Note exported successfully");
    } catch (error) {
      console.error("Failed to export note:", error);
      toast.error("Failed to export note");
    }
  };

  // Show skeleton loader while fetching
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-editor-bg px-5 py-16 space-y-6">
        <div className="h-12 bg-muted/30 rounded-md animate-pulse w-2/3" />
        <div className="space-y-3">
          <div className="h-4 bg-muted/20 rounded animate-pulse w-full" />
          <div className="h-4 bg-muted/20 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-muted/20 rounded animate-pulse w-4/5" />
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
      {/* Export Button - Top Right */}
      <div className="fixed top-4 right-4 z-10">
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
        coverImage={coverImage}
        onCoverChange={setCoverImage}
        editable={true}
      />

      {/* Minimal Editor - Apple Notes Style with Rich Editing */}
      <div className="flex-1 overflow-auto px-8 py-12 w-full max-w-4xl mx-auto">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-4xl font-bold border-none focus-visible:ring-0 px-0 mb-6 placeholder:text-muted-foreground/30 h-auto bg-transparent leading-tight tracking-tight"
        />

        {isInitialized && isRichMode ? (
          <RichEditor
            key={noteId} // Force remount on note change
            ref={richEditorRef}
            initialContent={serializeBlocks(blocks)}
            placeholder="Type '/' for commands or just start writing..."
            onChange={handleRichEditorChange}
            className="min-h-[calc(100vh-16rem)]"
          />
        ) : !isInitialized ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handlePlainTextChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-16rem)] text-base leading-relaxed border-none outline-none bg-transparent placeholder:text-muted-foreground/40 resize-none font-[inherit]"
          />
        )}
      </div>

      {/* Auto-save indicator (minimal, bottom-right corner) */}
      {(isSaving || showSavedIndicator) && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm animate-slide-up">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          ) : showSavedIndicator ? (
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
