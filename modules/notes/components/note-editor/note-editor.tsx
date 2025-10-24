"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Check, Loader2, FileText, Sparkles } from "lucide-react";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { FolderSelector } from "../folder-selector";
import { TagInput } from "@/modules/tags/components";
import { RichEditor, type RichEditorRef } from "../rich-editor";
import { Button } from "@/components/ui/button";
import { 
  serializeBlocks, 
  deserializeBlocks, 
  textToBlocks, 
  blocksToText,
  type Block 
} from "../../types/blocks";

interface NoteEditorProps {
  noteId: Id<"notes">;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const note = useQuery(api.notes.getNote, { noteId });
  const noteTags = useQuery(api.tags.getTagsForNote, { noteId });
  const updateNote = useMutation(api.notes.updateNote);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isRichMode, setIsRichMode] = useState(true); // Default to rich mode
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  const richEditorRef = useRef<RichEditorRef>(null);
  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  const debouncedBlocks = useDebounce(blocks, 500);

  // Reset when noteId changes
  useEffect(() => {
    setIsInitialized(false);
    setTitle("");
    setContent("");
    setBlocks([]);
    setTags([]);
    setIsRichMode(true); // Default to rich mode
    setLastSaved(null);
  }, [noteId]);

  // Check if note exists after loading
  useEffect(() => {
    if (note !== undefined) {
      setIsLoading(false);
    }
  }, [note]);

  // Initialize from Convex data ONLY ONCE per note
  useEffect(() => {
    if (note && !isInitialized) {
      setTitle(note.title);
      setContent(note.content);

      // Always use rich mode, but load content appropriately
      setIsRichMode(true);

      if (note.blocks && note.contentType === "rich") {
        // Load existing rich content
        const deserializedBlocks = deserializeBlocks(note.blocks);
        setBlocks(deserializedBlocks.length > 0 ? deserializedBlocks : textToBlocks(note.content));
      } else {
        // Convert plain text to rich blocks
        setBlocks(textToBlocks(note.content || ""));
      }

      setIsInitialized(true);
    }
  }, [note, isInitialized]);

  // Update tags when noteTags changes
  useEffect(() => {
    if (noteTags) {
      setTags(noteTags.map(tag => tag.name));
    }
  }, [noteTags]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (!note || !isInitialized) return;

    const currentContent = isRichMode ? blocksToText(debouncedBlocks) : debouncedContent;
    const currentBlocks = isRichMode ? serializeBlocks(debouncedBlocks) : undefined;
    
    const hasChanges =
      debouncedTitle !== note.title || 
      currentContent !== note.content ||
      (isRichMode && currentBlocks !== note.blocks);

    if (hasChanges) {
      setIsSaving(true);
      updateNote({
        noteId,
        title: debouncedTitle,
        content: currentContent,
        contentType: isRichMode ? "rich" : "plain",
        blocks: currentBlocks,
      })
        .then(() => {
          setLastSaved(new Date());
          setIsSaving(false);
          setShowSavedIndicator(true);

          // Hide "Saved" message after 2 seconds
          setTimeout(() => {
            setShowSavedIndicator(false);
          }, 2000);
        })
        .catch((error) => {
          console.error("Failed to save:", error);
          setIsSaving(false);
        });
    }
  }, [debouncedTitle, debouncedContent, debouncedBlocks, isRichMode, isInitialized, note]);

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

  // Show loader while fetching
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state if note doesn't exist
  if (!note) {
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
      {/* Minimal Editor - Apple Notes Style with Rich Editing */}
      <div className="flex-1 overflow-auto px-5 py-16 w-full">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-4xl font-bold border-none focus-visible:ring-0 px-0 mb-6 placeholder:text-muted-foreground/40 h-auto bg-transparent"
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
