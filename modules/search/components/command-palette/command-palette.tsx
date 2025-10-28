"use client";

import { useState, useEffect } from "react";
import { FileText, Folder, Hash } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const convexUser = useConvexUser();

  const searchResults = useQuery(
    api.notes.searchNotes,
    query.length > 1 && convexUser
      ? {
          searchTerm: query
        }
      : "skip"
  );

  const folders = useQuery(
    api.folders.getFolders,
    convexUser ? {} : "skip"
  );

  const tags = useQuery(
    api.tags.getTags,
    convexUser ? {} : "skip"
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          onClose();
        } else {
          // This will be handled by parent component
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSelect = (callback: () => void) => {
    callback();
    onClose();
    setQuery("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Search notes, folders, or type a command..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Navigation Commands */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => handleSelect(() => router.push("/workspace"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Go to Workspace</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/stories"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Go to All Stories</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => router.push("/trash"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Go to Trash</span>
          </CommandItem>
        </CommandGroup>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <CommandGroup heading="Notes">
            {searchResults.map((note) => (
              <CommandItem
                key={note._id}
                onSelect={() => handleSelect(() => router.push(`/note/${note._id}`))}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{note.title || "Untitled"}</span>
                  {note.content && (
                    <span className="text-xs text-muted-foreground truncate">
                      {note.content.substring(0, 60)}...
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Folders */}
        {folders && folders.length > 0 && query.length > 0 && (
          <CommandGroup heading="Folders">
            {folders
              .filter(folder => 
                folder.name.toLowerCase().includes(query.toLowerCase())
              )
              .map((folder) => (
                <CommandItem
                  key={folder._id}
                  onSelect={() => handleSelect(() => router.push(`/folder/${folder._id}`))}
                >
                  <Folder 
                    className="mr-2 h-4 w-4" 
                    style={{ color: folder.color || undefined }}
                  />
                  <span>{folder.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && query.length > 0 && (
          <CommandGroup heading="Tags">
            {tags
              .filter(tag => 
                tag.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map((tag) => (
                <CommandItem
                  key={tag._id}
                  onSelect={() => handleSelect(() => {
                    // Navigate to stories with tag filter
                    router.push(`/stories?tag=${encodeURIComponent(tag.name)}`);
                  })}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  <span>{tag.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}