"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Hash } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TagInputProps {
  noteId: Id<"notes">;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagInput({ noteId, selectedTags, onTagsChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const convexUser = useConvexUser();

  const existingTags = useQuery(
    api.tags.getTags,
    convexUser ? {} : "skip"
  );

  const createTag = useMutation(api.tags.createTag);
  const addTagToNote = useMutation(api.tags.addTagToNote);
  const removeTagFromNote = useMutation(api.tags.removeTagFromNote);

  const filteredTags = existingTags?.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  ) || [];

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      await handleAddTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      await handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const handleAddTag = async (tagName: string) => {
    if (!convexUser || selectedTags.includes(tagName)) return;

    try {
      // Create tag if it doesn't exist
      const existingTag = existingTags?.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
      
      if (!existingTag) {
        const tagId = await createTag({
          
          name: tagName,
        });
        // Add to note
        await addTagToNote({ noteId, tagId });
      } else {
        // Add existing tag to note
        await addTagToNote({ noteId, tagId: existingTag._id });
      }

      onTagsChange([...selectedTags, tagName]);
      setInputValue("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    if (!convexUser) return;

    try {
      const tag = existingTags?.find(t => t.name === tagName);
      if (tag) {
        await removeTagFromNote({ noteId, tagId: tag._id });
      }
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md min-h-[40px] bg-background focus-within:ring-2 focus-within:ring-ring">
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            <Hash className="h-3 w-3" />
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={() => handleRemoveTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Add tags..."
          className="border-none bg-transparent flex-1 min-w-[120px] focus-visible:ring-0 p-0"
        />
      </div>

      {/* Suggestions dropdown */}
      {isOpen && (inputValue.length > 0 || filteredTags.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
          {inputValue.length > 0 && !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleAddTag(inputValue)}
            >
              <Hash className="h-4 w-4" />
              Create &quot;{inputValue}&quot;
            </button>
          )}
          
          {filteredTags.map((tag) => (
            <button
              key={tag._id}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
              onClick={() => handleAddTag(tag.name)}
            >
              <Hash className="h-4 w-4" />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}