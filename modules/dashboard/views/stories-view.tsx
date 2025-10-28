"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NoteList } from "@/modules/notes/components/note-list";
import { NoteFilters, type SortOption, type SortDirection, type ViewMode } from "@/modules/notes/components/note-filters";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import { Loader2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

function StoriesContent() {
  const convexUser = useConvexUser();
  const searchParams = useSearchParams();
  
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  // Initialize from URL params
  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) {
      setSelectedTag(tag);
    }
  }, [searchParams]);

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSortChange = (newSortBy: SortOption, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 border-b border-border">
        <h1 className="text-2xl font-bold mb-2">All Stories</h1>
        <p className="text-muted-foreground">
          All your notes in one place
        </p>
      </div>

      <NoteFilters
        sortBy={sortBy}
        sortDirection={sortDirection}
        viewMode={viewMode}
        selectedFolder={selectedFolder}
        selectedTag={selectedTag}
        onSortChange={handleSortChange}
        onViewModeChange={setViewMode}
        onFolderChange={setSelectedFolder}
        onTagChange={setSelectedTag}
      />

      <div className="flex-1 overflow-auto">
        <NoteList
          folderId={selectedFolder}
          sortBy={sortBy}
          sortDirection={sortDirection}
          viewMode={viewMode}
          selectedTag={selectedTag}
        />
      </div>
    </div>
  );
}

export function StoriesView() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <StoriesContent />
    </Suspense>
  );
}
