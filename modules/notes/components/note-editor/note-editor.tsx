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
  const [isRichMode, setIsRichMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
    setIsRichMode(false);
    setLastSaved(null);
  }, [noteId]);

  // Initialize from Convex data ONLY ONCE per note
  useEffect(() => {
    if (note && !isInitialized) {
      setTitle(note.title);
      setContent(note.content);
      
      // Determine if this is rich content or plain text
      const isRich = note.contentType === "rich" || Boolean(note.blocks);
      setIsRichMode(isRich);
      
      if (isRich && note.blocks) {
        // Load rich content
        const deserializedBlocks = deserializeBlocks(note.blocks);
        setBlocks(deserializedBlocks.length > 0 ? deserializedBlocks : textToBlocks(note.content));
      } else {
        // Load plain text content
        setBlocks(textToBlocks(note.content));
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

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with folder selector and save status */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderSelector
              value={note.folderId}
              onChange={(folderId) => {
                console.log("Updating note folder:", { noteId, folderId, currentFolderId: note.folderId });
                updateNote({ noteId, folderId });
              }}
            />
            
            {/* Editor Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleEditorMode}
              className="flex items-center gap-2"
            >
              {isRichMode ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Rich
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Plain
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span>Saved</span>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Tags Section */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Tags
          </label>
          <TagInput
            noteId={noteId}
            selectedTags={tags}
            onTagsChange={setTags}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto px-12 py-10 max-w-5xl mx-auto w-full">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-5xl font-bold border-none focus-visible:ring-0 px-0 mb-8 placeholder:text-muted-foreground/30 h-auto"
        />

        {isRichMode ? (
          <RichEditor
            ref={richEditorRef}
            initialContent={serializeBlocks(blocks)}
            placeholder="Type '/' for commands or just start writing..."
            onChange={handleRichEditorChange}
            className="min-h-[calc(100vh-20rem)]"
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => handlePlainTextChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-20rem)] text-base leading-relaxed border-none outline-none bg-transparent placeholder:text-muted-foreground/30 resize-none"
          />
        )}
      </div>
    </div>
  );
}
