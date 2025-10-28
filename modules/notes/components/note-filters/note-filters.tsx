"use client";

import { Filter, Grid3x3, List, Hash, Folder } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortOption = "updatedAt" | "title" | "createdAt";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";

interface NoteFiltersProps {
  sortBy: SortOption;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  selectedFolder?: Id<"folders">;
  selectedTag?: string;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFolderChange: (folderId?: Id<"folders">) => void;
  onTagChange: (tag?: string) => void;
}

export function NoteFilters({
  sortBy,
  sortDirection,
  viewMode,
  selectedFolder,
  selectedTag,
  onSortChange,
  onViewModeChange,
  onFolderChange,
  onTagChange,
}: NoteFiltersProps) {
  const convexUser = useConvexUser();

  const folders = useQuery(
    api.folders.getFolders,
    convexUser ? {} : "skip"
  );

  const tags = useQuery(
    api.tags.getTags,
    convexUser ? {} : "skip"
  );

  const selectedFolderName = folders?.find(f => f._id === selectedFolder)?.name;
  const hasActiveFilters = selectedFolder || selectedTag;

  const clearFilters = () => {
    onFolderChange(undefined);
    onTagChange(undefined);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
      <div className="flex items-center gap-2">
        {/* Sort Controls */}
        <Select
          value={`${sortBy}-${sortDirection}`}
          onValueChange={(value) => {
            const [sort, direction] = value.split('-') as [SortOption, SortDirection];
            onSortChange(sort, direction);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt-desc">Recent first</SelectItem>
            <SelectItem value="updatedAt-asc">Oldest first</SelectItem>
            <SelectItem value="title-asc">A to Z</SelectItem>
            <SelectItem value="title-desc">Z to A</SelectItem>
            <SelectItem value="createdAt-desc">Newest created</SelectItem>
            <SelectItem value="createdAt-asc">Oldest created</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[16px] h-4 text-xs">
                  {(selectedFolder ? 1 : 0) + (selectedTag ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onFolderChange(undefined)}>
              <span className={selectedFolder ? "text-muted-foreground" : "font-medium"}>
                All folders
              </span>
            </DropdownMenuItem>
            {folders?.map((folder) => (
              <DropdownMenuItem
                key={folder._id}
                onClick={() => onFolderChange(folder._id)}
              >
                <Folder
                  className="mr-2 h-4 w-4"
                  style={{ color: folder.color || undefined }}
                />
                <span className={selectedFolder === folder._id ? "font-medium" : ""}>
                  {folder.name}
                </span>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onTagChange(undefined)}>
              <span className={selectedTag ? "text-muted-foreground" : "font-medium"}>
                All tags
              </span>
            </DropdownMenuItem>
            {tags?.slice(0, 10).map((tag) => (
              <DropdownMenuItem
                key={tag._id}
                onClick={() => onTagChange(tag.name)}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span className={selectedTag === tag.name ? "font-medium" : ""}>
                  {tag.name}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Active Filter Badges */}
        {selectedFolderName && (
          <Badge variant="secondary" className="gap-1">
            <Folder className="h-3 w-3" />
            {selectedFolderName}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={() => onFolderChange(undefined)}
            >
              ×
            </Button>
          </Badge>
        )}
        
        {selectedTag && (
          <Badge variant="secondary" className="gap-1">
            <Hash className="h-3 w-3" />
            {selectedTag}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 hover:bg-transparent"
              onClick={() => onTagChange(undefined)}
            >
              ×
            </Button>
          </Badge>
        )}

        {/* View Mode Toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}