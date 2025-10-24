# Implementation Plan: Enhanced Trash Functionality

## Overview

This plan details the technical approach for enhancing NoteFlow's trash system with automatic expiration, original location tracking, bulk operations, and improved UX. We'll build upon the existing solid foundation to deliver a production-ready trash management experience.

---

## Tech Stack

### Existing Stack (Leverage)
- **Backend**: Convex (serverless backend)
  - Real-time queries and mutations
  - Scheduled functions (cron jobs) for auto-expiration
  - Database with indexes
- **Frontend**: Next.js 15 + React 19
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: Convex React hooks (useQuery, useMutation)
- **Date Utilities**: date-fns (already in use)

### New Dependencies (If Needed)
- **Toast Notifications**: Already using `sonner` (confirmed in codebase)
- **Batch Operations**: Convex batch API (built-in)
- **Scheduled Jobs**: Convex cron (built-in)

---

## Project Structure

```
noteflow/
├── convex/
│   ├── schema.ts                           # Update: Add deletedFromFolderId, folder soft-delete fields
│   ├── notes.ts                            # Update: Enhance mutations, add bulk operations
│   ├── folders.ts                          # Update: Add soft-delete support
│   ├── trash.ts                            # NEW: Bulk operations, expiration logic
│   └── cron.ts                             # NEW: Scheduled cleanup job
│
├── modules/
│   ├── dashboard/
│   │   ├── views/
│   │   │   └── trash-view.tsx              # UPDATE: Add filters, search, bulk select
│   │   └── components/
│   │       └── folder-sidebar/
│   │           └── FolderSidebar.tsx       # Minor updates for folder soft-delete
│   │
│   ├── notes/
│   │   └── components/
│   │       ├── trash-note-card.tsx         # UPDATE: Show expiration, original location
│   │       ├── delete-note-dialog.tsx      # UPDATE: Undo toast integration
│   │       └── bulk-actions-toolbar.tsx    # NEW: Bulk action controls
│   │
│   ├── trash/                              # NEW MODULE
│   │   ├── components/
│   │   │   ├── trash-filters.tsx           # NEW: Filter UI
│   │   │   ├── trash-search.tsx            # NEW: Search box
│   │   │   ├── expiration-badge.tsx        # NEW: Days remaining indicator
│   │   │   ├── original-location-badge.tsx # NEW: Show original folder
│   │   │   └── empty-trash-dialog.tsx      # NEW: Confirmation for empty trash
│   │   ├── hooks/
│   │   │   ├── useTrashFilters.ts          # NEW: Filter state management
│   │   │   ├── useTrashSearch.ts           # NEW: Search logic
│   │   │   └── useBulkSelect.ts            # NEW: Multi-select state
│   │   └── utils/
│   │       ├── expirationHelpers.ts        # NEW: Calculate days remaining
│   │       └── restoreHelpers.ts           # NEW: Smart restore logic
│   │
│   └── shared/
│       └── components/
│           └── undo-toast.tsx              # NEW: Reusable undo toast component
│
└── app/
    └── (dashboard)/
        └── trash/
            └── page.tsx                    # UPDATE: Enhanced trash page with new features
```

---

## Database Schema Changes

### File: `convex/schema.ts`

#### 1. Update Notes Table

```typescript
notes: defineTable({
  userId: v.id("users"),
  folderId: v.optional(v.id("folders")),
  title: v.string(),
  content: v.string(),

  // Soft Delete (existing)
  isDeleted: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),

  // NEW: Original Location Tracking
  deletedFromFolderId: v.optional(v.id("folders")),  // Track original folder
  deletedFromPath: v.optional(v.string()),            // Full path (e.g., "Work > Projects")

  // Timestamps
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_folder", ["folderId"])
  .index("by_user_not_deleted", ["userId", "isDeleted"])
  .index("by_deleted_date", ["isDeleted", "deletedAt"])  // NEW: For expiration queries
  .index("by_deleted_folder", ["deletedFromFolderId"])   // NEW: For location filtering
  .searchIndex("search_title", {
    searchField: "title",
    filterFields: ["userId", "isDeleted"],
  })
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["userId", "isDeleted"],
  })
```

#### 2. Update Folders Table

```typescript
folders: defineTable({
  userId: v.id("users"),
  parentId: v.optional(v.id("folders")),
  name: v.string(),
  color: v.optional(v.string()),
  position: v.optional(v.number()),

  // NEW: Soft Delete Support
  isDeleted: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),
  deletedFromParentId: v.optional(v.id("folders")),  // Original parent for restore

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_parent", ["parentId"])
  .index("by_user_and_parent", ["userId", "parentId"])
  .index("by_user_not_deleted", ["userId", "isDeleted"])  // NEW
  .index("by_deleted_date", ["isDeleted", "deletedAt"])   // NEW: For expiration
```

#### 3. New Audit Log Table (Optional)

```typescript
trashAuditLog: defineTable({
  userId: v.id("users"),
  action: v.string(),  // "auto_delete", "restore", "permanent_delete"
  itemType: v.string(), // "note" or "folder"
  itemId: v.string(),
  itemTitle: v.string(),
  timestamp: v.number(),
  metadata: v.optional(v.any()),  // Additional context
})
  .index("by_user", ["userId"])
  .index("by_timestamp", ["timestamp"])
```

---

## Backend Implementation

### File: `convex/cron.ts` (NEW)

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const cron = cronJobs();

// Run daily at midnight UTC
cron.daily(
  "cleanup-expired-trash",
  { hourUTC: 0, minuteUTC: 0 },
  internal.trash.cleanupExpiredTrash
);

export default cron;
```

### File: `convex/trash.ts` (NEW)

```typescript
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

// Constants
const TRASH_RETENTION_DAYS = 30;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Scheduled function: Automatically delete notes/folders older than 30 days
 */
export const cleanupExpiredTrash = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expirationThreshold = now - TRASH_RETENTION_MS;

    // Find expired notes
    const expiredNotes = await ctx.db
      .query("notes")
      .withIndex("by_deleted_date", (q) =>
        q.eq("isDeleted", true)
      )
      .filter((note) => (note.deletedAt || 0) < expirationThreshold)
      .collect();

    // Permanently delete expired notes
    for (const note of expiredNotes) {
      // Delete associated tags
      const noteTags = await ctx.db
        .query("noteTags")
        .withIndex("by_note", (q) => q.eq("noteId", note._id))
        .collect();

      for (const tag of noteTags) {
        await ctx.db.delete(tag._id);
      }

      // Audit log (optional)
      await ctx.db.insert("trashAuditLog", {
        userId: note.userId,
        action: "auto_delete",
        itemType: "note",
        itemId: note._id,
        itemTitle: note.title,
        timestamp: now,
        metadata: { deletedAt: note.deletedAt },
      });

      // Delete note
      await ctx.db.delete(note._id);
    }

    // Find expired folders
    const expiredFolders = await ctx.db
      .query("folders")
      .withIndex("by_deleted_date", (q) =>
        q.eq("isDeleted", true)
      )
      .filter((folder) => (folder.deletedAt || 0) < expirationThreshold)
      .collect();

    // Permanently delete expired folders
    for (const folder of expiredFolders) {
      // Delete child notes in this folder (if any still exist)
      const childNotes = await ctx.db
        .query("notes")
        .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
        .collect();

      for (const note of childNotes) {
        await ctx.db.delete(note._id);
      }

      // Audit log
      await ctx.db.insert("trashAuditLog", {
        userId: folder.userId,
        action: "auto_delete",
        itemType: "folder",
        itemId: folder._id,
        itemTitle: folder.name,
        timestamp: now,
        metadata: { deletedAt: folder.deletedAt },
      });

      // Delete folder
      await ctx.db.delete(folder._id);
    }

    return {
      notesDeleted: expiredNotes.length,
      foldersDeleted: expiredFolders.length,
    };
  },
});

/**
 * Bulk restore notes
 */
export const bulkRestoreNotes = mutation({
  args: {
    noteIds: v.array(v.id("notes")),
  },
  handler: async (ctx, { noteIds }) => {
    const results = [];

    for (const noteId of noteIds) {
      const note = await ctx.db.get(noteId);
      if (!note || !note.isDeleted) {
        results.push({ noteId, success: false, reason: "not_found_or_not_deleted" });
        continue;
      }

      // Restore to original folder if it exists
      let targetFolderId = note.deletedFromFolderId;
      if (targetFolderId) {
        const folder = await ctx.db.get(targetFolderId);
        if (!folder || folder.isDeleted) {
          // Original folder gone or deleted - restore to root
          targetFolderId = undefined;
        }
      }

      await ctx.db.patch(noteId, {
        isDeleted: false,
        deletedAt: undefined,
        folderId: targetFolderId,
        updatedAt: Date.now(),
      });

      results.push({ noteId, success: true });
    }

    return results;
  },
});

/**
 * Bulk permanently delete notes
 */
export const bulkPermanentDeleteNotes = mutation({
  args: {
    noteIds: v.array(v.id("notes")),
  },
  handler: async (ctx, { noteIds }) => {
    const results = [];

    for (const noteId of noteIds) {
      const note = await ctx.db.get(noteId);
      if (!note) {
        results.push({ noteId, success: false, reason: "not_found" });
        continue;
      }

      // Delete tags
      const noteTags = await ctx.db
        .query("noteTags")
        .withIndex("by_note", (q) => q.eq("noteId", noteId))
        .collect();

      for (const tag of noteTags) {
        await ctx.db.delete(tag._id);
      }

      // Delete note
      await ctx.db.delete(noteId);

      results.push({ noteId, success: true });
    }

    return results;
  },
});

/**
 * Empty entire trash (permanently delete all deleted items)
 */
export const emptyTrash = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    // Get all deleted notes for this user
    const deletedNotes = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true)
      )
      .collect();

    // Delete all
    for (const note of deletedNotes) {
      // Delete tags
      const noteTags = await ctx.db
        .query("noteTags")
        .withIndex("by_note", (q) => q.eq("noteId", note._id))
        .collect();

      for (const tag of noteTags) {
        await ctx.db.delete(tag._id);
      }

      await ctx.db.delete(note._id);
    }

    // Get all deleted folders for this user
    const deletedFolders = await ctx.db
      .query("folders")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true)
      )
      .collect();

    for (const folder of deletedFolders) {
      await ctx.db.delete(folder._id);
    }

    return {
      notesDeleted: deletedNotes.length,
      foldersDeleted: deletedFolders.length,
    };
  },
});

/**
 * Get deleted items with enhanced metadata
 */
export const getDeletedItems = query({
  args: {
    userId: v.id("users"),
    folderFilter: v.optional(v.id("folders")),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, { userId, folderFilter, searchQuery }) => {
    let notes = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true)
      )
      .collect();

    // Filter by original folder if specified
    if (folderFilter) {
      notes = notes.filter((note) => note.deletedFromFolderId === folderFilter);
    }

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      notes = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Enhance with expiration info
    const now = Date.now();
    const enhancedNotes = await Promise.all(
      notes.map(async (note) => {
        const deletedAt = note.deletedAt || 0;
        const expiresAt = deletedAt + TRASH_RETENTION_MS;
        const daysRemaining = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));

        // Get original folder name if exists
        let originalFolderName = null;
        if (note.deletedFromFolderId) {
          const folder = await ctx.db.get(note.deletedFromFolderId);
          originalFolderName = folder ? folder.name : null;
        }

        return {
          ...note,
          expiresAt,
          daysRemaining,
          originalFolderName,
        };
      })
    );

    return enhancedNotes.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  },
});
```

### File: `convex/notes.ts` (UPDATE)

```typescript
// Update deleteNote to capture original location
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

    // Capture original folder location
    let deletedFromPath = null;
    if (note.folderId) {
      const folder = await ctx.db.get(note.folderId);
      if (folder) {
        // Build full path (could be recursive for nested folders)
        deletedFromPath = folder.name;
        // TODO: Implement full path building for nested folders
      }
    }

    await ctx.db.patch(noteId, {
      isDeleted: true,
      deletedAt: Date.now(),
      deletedFromFolderId: note.folderId,
      deletedFromPath,
    });

    return { success: true, noteId };
  },
});

// Update restoreNote to restore to original location
export const restoreNote = mutation({
  args: {
    noteId: v.id("notes"),
    restoreToFolderId: v.optional(v.id("folders")),  // Optional override
  },
  handler: async (ctx, { noteId, restoreToFolderId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || !note.isDeleted) {
      throw new Error("Note not found or not deleted");
    }

    // Determine target folder
    let targetFolderId = restoreToFolderId;
    if (!targetFolderId) {
      // Try to restore to original location
      targetFolderId = note.deletedFromFolderId;

      // Verify original folder still exists and not deleted
      if (targetFolderId) {
        const folder = await ctx.db.get(targetFolderId);
        if (!folder || folder.isDeleted) {
          targetFolderId = undefined;  // Fallback to root
        }
      }
    }

    await ctx.db.patch(noteId, {
      isDeleted: false,
      deletedAt: undefined,
      folderId: targetFolderId,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      noteId,
      restoredToFolderId: targetFolderId,
      restoredToOriginal: targetFolderId === note.deletedFromFolderId,
    };
  },
});
```

### File: `convex/folders.ts` (UPDATE)

```typescript
// Update deleteFolder to support soft-delete
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
    deleteNotes: v.optional(v.boolean()),
    softDelete: v.optional(v.boolean()),  // NEW: Soft delete option
  },
  handler: async (ctx, { folderId, deleteNotes = false, softDelete = true }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) throw new Error("Folder not found");

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .collect();

    if (softDelete) {
      // Soft delete folder
      await ctx.db.patch(folderId, {
        isDeleted: true,
        deletedAt: Date.now(),
        deletedFromParentId: folder.parentId,
      });

      // Soft delete all notes in folder
      for (const note of notes) {
        await ctx.db.patch(note._id, {
          isDeleted: true,
          deletedAt: Date.now(),
          deletedFromFolderId: folderId,
        });
      }
    } else {
      // Hard delete (existing behavior)
      if (deleteNotes) {
        for (const note of notes) {
          await ctx.db.patch(note._id, {
            isDeleted: true,
            deletedAt: Date.now(),
          });
        }
      } else {
        for (const note of notes) {
          await ctx.db.patch(note._id, { folderId: undefined });
        }
      }

      await ctx.db.delete(folderId);
    }

    return { success: true };
  },
});

// New mutation: Restore folder
export const restoreFolder = mutation({
  args: {
    folderId: v.id("folders"),
    restoreNotes: v.optional(v.boolean()),
  },
  handler: async (ctx, { folderId, restoreNotes = true }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder || !folder.isDeleted) {
      throw new Error("Folder not found or not deleted");
    }

    // Verify original parent exists
    let targetParentId = folder.deletedFromParentId;
    if (targetParentId) {
      const parentFolder = await ctx.db.get(targetParentId);
      if (!parentFolder || parentFolder.isDeleted) {
        targetParentId = undefined;  // Restore to root
      }
    }

    // Restore folder
    await ctx.db.patch(folderId, {
      isDeleted: false,
      deletedAt: undefined,
      parentId: targetParentId,
      updatedAt: Date.now(),
    });

    // Optionally restore notes
    if (restoreNotes) {
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_deleted_folder", (q) => q.eq("deletedFromFolderId", folderId))
        .collect();

      for (const note of notes) {
        await ctx.db.patch(note._id, {
          isDeleted: false,
          deletedAt: undefined,
          folderId: folderId,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true, notesRestored: restoreNotes };
  },
});
```

---

## Frontend Implementation

### File: `modules/trash/components/expiration-badge.tsx` (NEW)

```typescript
import { differenceInDays } from "date-fns";

interface ExpirationBadgeProps {
  deletedAt: number;
  retentionDays?: number;
}

export function ExpirationBadge({ deletedAt, retentionDays = 30 }: ExpirationBadgeProps) {
  const expiresAt = deletedAt + retentionDays * 24 * 60 * 60 * 1000;
  const daysRemaining = differenceInDays(expiresAt, Date.now());

  const getVariant = () => {
    if (daysRemaining <= 3) return "destructive";
    if (daysRemaining <= 7) return "warning";
    return "default";
  };

  return (
    <Badge variant={getVariant()}>
      {daysRemaining > 0 ? `${daysRemaining} days left` : "Expiring soon"}
    </Badge>
  );
}
```

### File: `modules/trash/components/original-location-badge.tsx` (NEW)

```typescript
interface OriginalLocationBadgeProps {
  folderName?: string | null;
  folderPath?: string | null;
}

export function OriginalLocationBadge({ folderName, folderPath }: OriginalLocationBadgeProps) {
  if (!folderName) return <Badge variant="outline">Root</Badge>;

  return (
    <Badge variant="secondary" title={folderPath || folderName}>
      <Folder className="w-3 h-3 mr-1" />
      {folderName}
    </Badge>
  );
}
```

### File: `modules/trash/hooks/useBulkSelect.ts` (NEW)

```typescript
import { useState, useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useBulkSelect(allIds: Id<"notes">[]) {
  const [selectedIds, setSelectedIds] = useState<Set<Id<"notes">>>(new Set());

  const toggleSelect = useCallback((id: Id<"notes">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: Id<"notes">) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
  };
}
```

### File: `modules/trash/hooks/useTrashFilters.ts` (NEW)

```typescript
import { useState, useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface TrashFilters {
  folderFilter: Id<"folders"> | null;
  dateRange: "all" | "last7" | "7-14" | "14-30";
  expiringFilter: "all" | "expiring" | "urgent";
  searchQuery: string;
}

export function useTrashFilters() {
  const [filters, setFilters] = useState<TrashFilters>({
    folderFilter: null,
    dateRange: "all",
    expiringFilter: "all",
    searchQuery: "",
  });

  const setFolderFilter = useCallback((folderId: Id<"folders"> | null) => {
    setFilters((prev) => ({ ...prev, folderFilter: folderId }));
  }, []);

  const setDateRange = useCallback((range: TrashFilters["dateRange"]) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  }, []);

  const setExpiringFilter = useCallback((filter: TrashFilters["expiringFilter"]) => {
    setFilters((prev) => ({ ...prev, expiringFilter: filter }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      folderFilter: null,
      dateRange: "all",
      expiringFilter: "all",
      searchQuery: "",
    });
  }, []);

  return {
    filters,
    setFolderFilter,
    setDateRange,
    setExpiringFilter,
    setSearchQuery,
    clearFilters,
  };
}
```

### File: `modules/shared/components/undo-toast.tsx` (NEW)

```typescript
import { toast } from "sonner";

interface UndoToastOptions {
  noteTitle: string;
  onUndo: () => void;
  duration?: number;
}

export function showUndoToast({ noteTitle, onUndo, duration = 10000 }: UndoToastOptions) {
  toast(`"${noteTitle}" moved to trash`, {
    action: {
      label: "Undo",
      onClick: () => {
        onUndo();
        toast.success("Note restored");
      },
    },
    duration,
  });
}
```

---

## UI/UX Patterns

### 1. Trash View Layout

```
┌─────────────────────────────────────────────────────────┐
│ Trash                                     [Empty Trash]  │
│                                                          │
│ [Search box] [Folder Filter ▾] [Date ▾] [Expiring ▾]   │
│ ✓ Select All (15 items)                   [Clear]       │
├─────────────────────────────────────────────────────────┤
│ [5 items selected]  [Restore] [Delete Forever]          │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ │ ☐ Note 1     │  │ ☑ Note 2     │  │ ☑ Note 3     │  │
│ │ Originally:  │  │ Originally:  │  │ Originally:  │  │
│ │ [Work]       │  │ [Personal]   │  │ [Root]       │  │
│ │ 5 days left  │  │ 2 days left  │  │ 25 days left │  │
│ │ [Restore]    │  │ [Delete]     │  │ [Delete]     │  │
│ └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2. Expiration Visual Hierarchy

- **25-30 days**: Gray badge, neutral
- **7-24 days**: Default badge, informational
- **3-6 days**: Yellow/warning badge
- **0-2 days**: Red/destructive badge, pulsing animation

### 3. Bulk Actions Flow

```
User selects notes → Bulk toolbar appears → Confirm action → Progress indicator → Success toast
```

### 4. Empty Trash Confirmation

```
┌───────────────────────────────────────┐
│ Permanently Delete All Trash?         │
│                                        │
│ This will permanently delete 15 notes │
│ and 2 folders. This cannot be undone. │
│                                        │
│ [Cancel]         [Delete Everything]  │
└───────────────────────────────────────┘
```

---

## Performance Considerations

### Database Optimization

1. **Indexes for Trash Queries**
   - `by_deleted_date` for expiration queries
   - `by_deleted_folder` for location filtering
   - Composite index on `[userId, isDeleted, deletedAt]`

2. **Batch Operations**
   - Limit bulk operations to 100 items per mutation
   - Show progress bar for large batches
   - Use `Promise.all` with chunking for parallel processing

3. **Scheduled Job Efficiency**
   - Run cleanup at low-traffic time (midnight UTC)
   - Process in batches of 100
   - Add timeout protection (max 5 minutes)

### Frontend Optimization

1. **Virtual Scrolling**
   - Use `react-window` or `tanstack-virtual` for large trash lists
   - Render only visible items
   - Lazy load metadata

2. **Debounced Search**
   - Debounce search input (300ms)
   - Cancel in-flight queries on new input

3. **Optimistic Updates**
   - Immediately update UI on restore/delete
   - Rollback on error

---

## Error Handling

### Scenarios

1. **Restore to Deleted Folder**
   - Detection: Check folder existence before restore
   - Fallback: Restore to root with notification
   - Option: Offer to restore folder first

2. **Partial Bulk Operation Failure**
   - Track individual operation results
   - Show summary: "10 restored, 2 failed"
   - Allow retry for failed items

3. **Scheduled Job Failure**
   - Log errors to audit table
   - Retry next day
   - Alert admin if repeated failures

4. **Race Conditions**
   - Note deleted while viewing: Show "Item no longer exists"
   - Note restored by another session: Refresh trash view

---

## Migration Strategy

### Phase 1: Schema Update (Non-Breaking)

```typescript
// Add new fields as optional - no data migration needed
// Existing notes without deletedFromFolderId will restore to root (current behavior)
```

### Phase 2: Enable Soft Delete Tracking

```typescript
// New deletes will capture original location
// Old deleted notes remain functional but without location tracking
```

### Phase 3: Deploy Scheduled Job

```typescript
// Start with dry-run mode (logging only)
// After 1 week, enable actual deletion
```

### Phase 4: Folder Soft Delete

```typescript
// Update folder deletion to use soft delete by default
// Keep hard delete as option for admin cleanup
```

---

## Testing Strategy

### Unit Tests

- Expiration calculation helpers
- Filter logic (date ranges, folder matching)
- Restore path resolution

### Integration Tests

- Bulk restore with mixed success/failure
- Scheduled job execution
- Search across deleted notes

### E2E Tests (Manual QA)

1. Delete note → Verify appears in trash with original location
2. Wait 31 days → Verify auto-deletion
3. Select 10 notes → Bulk restore → Verify all restored correctly
4. Delete folder → Verify folder and notes in trash → Restore folder → Verify hierarchy
5. Search trash → Verify results
6. Undo delete from toast → Verify immediate restore

---

## Rollout Plan

### MVP (P1 User Stories)

1. Deploy schema changes
2. Deploy auto-expiration scheduled job
3. Deploy original location tracking
4. Update UI to show expiration and location

### Phase 2 (P2 User Stories)

1. Deploy bulk operations backend
2. Deploy bulk select UI
3. Deploy empty trash feature

### Phase 3 (P3 User Stories)

1. Deploy filters and search
2. Deploy undo toast
3. Deploy folder soft-delete

---

## Monitoring & Observability

### Metrics to Track

- Daily auto-deletions count
- Average trash size per user
- Bulk operation success rate
- Scheduled job execution time
- Restore-to-original success rate

### Alerts

- Scheduled job failure
- Bulk operation timeout
- Trash size exceeding threshold (10,000 items)

---

## Security Considerations

- Users can only access their own trash
- Permanent delete requires authentication
- Audit log for all auto-deletions
- Rate limiting on bulk operations
- CSRF protection on destructive actions

---

## Open Technical Questions

1. **Should we implement soft-delete for tags?**
   - Currently tags are hard-deleted when note is permanently deleted
   - Consider: Tag soft-delete with separate expiration

2. **How to handle restore conflicts (name collisions)?**
   - Note restored to folder with duplicate title
   - Strategy: Append timestamp or auto-rename?

3. **Should scheduled job send notifications?**
   - Email digest before auto-deletion?
   - Push notification for expiring items?

4. **Pagination strategy for large trash?**
   - Infinite scroll vs traditional pagination
   - Default page size (20, 50, 100?)

---

## Dependencies Between Features

```
Schema Changes (foundational)
    ↓
Auto-Expiration + Original Location (P1)
    ↓
Bulk Operations (P2)
    ↓
Filters/Search (P3) + Undo Toast (P3) + Folder Soft-Delete (P3)
```

All P3 features are independent and can be developed in parallel after P2.
