import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedUserId, verifyNoteOwnership } from "./auth";
import {
  sanitizeNoteTitle,
  sanitizeNoteContent,
  sanitizeBlocksJson,
} from "../lib/sanitize";

// Get all notes for a user (excluding deleted)
export const getNotes = query({
  args: {
    folderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, { folderId }) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);

    const notesQuery = ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      );

    const notes = await notesQuery.collect();

    // Filter by folder
    if (folderId === null) {
      // null means show only uncategorized notes (no folder)
      return notes.filter((note) => !note.folderId).sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (folderId !== undefined) {
      // Specific folder ID
      return notes.filter((note) => note.folderId === folderId).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // undefined means all notes
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get notes with minimal data (no content) - for list view performance
export const getNotesMinimal = query({
  args: {
    folderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, { folderId }) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);
    const notesQuery = ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      );

    const notes = await notesQuery.collect();

    // Filter by folder
    let filteredNotes = notes;
    if (folderId === null) {
      // null means show only uncategorized notes (no folder)
      filteredNotes = notes.filter((note) => !note.folderId);
    } else if (folderId !== undefined) {
      // Specific folder ID
      filteredNotes = notes.filter((note) => note.folderId === folderId);
    }

    // Return only essential fields (exclude content and blocks for performance)
    return filteredNotes
      .map((note) => ({
        _id: note._id,
        _creationTime: note._creationTime,
        userId: note.userId,
        folderId: note.folderId,
        title: note.title,
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        isDeleted: note.isDeleted,
        // Provide a short preview from content (first 100 chars)
        contentPreview: note.content?.substring(0, 100) || "",
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get a single note
export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before returning note
    await verifyNoteOwnership(ctx, noteId, userId);

    return await ctx.db.get(noteId);
  },
});

// Get note content for editor (optimized - includes title for page refresh case)
export const getNoteContent = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const note = await ctx.db.get(noteId);
    if (!note) return null;

    // Return null if note is deleted (prevents showing deleted notes in editor)
    if (note.isDeleted) return null;

    // Verify ownership before returning sensitive content
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to access this note");
    }

    // Resolve cover image storage ID to URL if it exists
    let coverImageUrl: string | undefined = undefined;
    if (note.coverImage) {
      // Check if it's a storage ID (starts with "kg")
      if (note.coverImage.startsWith("kg")) {
        try {
          // Cast to storage ID type for Convex
          const resolvedUrl = await ctx.storage.getUrl(note.coverImage as any);
          coverImageUrl = resolvedUrl ?? undefined;
        } catch (error) {
          console.error("Failed to resolve cover image storage ID:", error);
        }
      } else {
        // Legacy data URL or regular URL - use as is
        coverImageUrl = note.coverImage;
      }
    }

    // TODO: Parse blocks and resolve image block storage IDs
    // This would require parsing the blocks JSON, finding image blocks,
    // and resolving their storage IDs to URLs

    // Return title + content/blocks + coverImage (title is used only on initial load if context is empty)
    return {
      _id: note._id,
      title: note.title,
      content: note.content,
      blocks: note.blocks,
      contentType: note.contentType,
      coverImage: note.coverImage, // Keep storage ID for saving
      coverImageUrl, // Resolved URL for display
    };
  },
});

// Search notes
export const searchNotes = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, { searchTerm }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const titleResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", searchTerm).eq("userId", userId).eq("isDeleted", false)
      )
      .collect();

    const contentResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchTerm).eq("userId", userId).eq("isDeleted", false)
      )
      .collect();

    // Merge and deduplicate results
    const allResults = [...titleResults, ...contentResults];
    const uniqueResults = Array.from(
      new Map(allResults.map((note) => [note._id, note])).values()
    );

    return uniqueResults.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get deleted notes (trash)
export const getDeletedNotes = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true)
      )
      .collect();

    return notes.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  },
});

// Create a new note
export const createNote = mutation({
  args: {
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { folderId, title, content }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const now = Date.now();

    // Sanitize user inputs to prevent XSS attacks
    const sanitizedTitle = sanitizeNoteTitle(title);
    const sanitizedContent = sanitizeNoteContent(content || "");

    const noteId = await ctx.db.insert("notes", {
      userId,
      folderId,
      title: sanitizedTitle,
      content: sanitizedContent,
      isPinned: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return noteId;
  },
});

// Update a note
export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    contentType: v.optional(v.union(v.literal("plain"), v.literal("rich"))),
    blocks: v.optional(v.string()),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
    isPinned: v.optional(v.boolean()),
    color: v.optional(v.string()),
    coverImage: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { noteId, folderId, coverImage, title, content, blocks, ...updates }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing update
    await verifyNoteOwnership(ctx, noteId, userId);

    // Sanitize all user inputs to prevent XSS attacks
    const sanitizedTitle = title !== undefined ? sanitizeNoteTitle(title) : undefined;
    const sanitizedContent = content !== undefined ? sanitizeNoteContent(content) : undefined;
    const sanitizedBlocks = blocks !== undefined ? sanitizeBlocksJson(blocks) : undefined;

    // Handle cover image cleanup when being removed or replaced
    if (coverImage !== undefined) {
      const note = await ctx.db.get(noteId);
      const oldCoverImage = note?.coverImage;

      // If there's an old cover image and it's being changed (removed or replaced)
      if (oldCoverImage && oldCoverImage.startsWith("kg")) {
        // Only delete if it's actually changing (not just re-saving the same image)
        const isChanging = coverImage !== oldCoverImage;

        if (isChanging) {
          try {
            // Delete old cover image from storage
            await ctx.storage.delete(oldCoverImage as any);

            // Delete file metadata record
            const fileRecord = await ctx.db
              .query("files")
              .withIndex("by_storage_id", (q) => q.eq("storageId", oldCoverImage))
              .first();

            if (fileRecord) {
              await ctx.db.delete(fileRecord._id);
            }

            console.log("Old cover image deleted from storage:", oldCoverImage);
          } catch (error) {
            console.error("Failed to delete old cover image:", error);
            // Continue with update even if deletion fails
          }
        }
      }
    }

    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
      ...(folderId !== undefined && {
        folderId: folderId === null ? undefined : folderId
      }),
      // Apply sanitized values
      ...(sanitizedTitle !== undefined && { title: sanitizedTitle }),
      ...(sanitizedContent !== undefined && { content: sanitizedContent }),
      ...(sanitizedBlocks !== undefined && { blocks: sanitizedBlocks }),
    };

    // Handle coverImage: null means remove, string means set, undefined means don't change
    if (coverImage !== undefined) {
      updateData.coverImage = coverImage === null ? undefined : coverImage;
    }

    await ctx.db.patch(noteId, updateData);
  },
});

// Soft delete a note (move to trash)
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

    // Verify ownership before allowing deletion
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to delete this note");
    }

    // Capture original folder location for smart restore
    let deletedFromPath: string | undefined = undefined;
    if (note.folderId) {
      const folder = await ctx.db.get(note.folderId);
      if (folder) {
        // Build full path (simplified for now - could be recursive for nested folders)
        deletedFromPath = folder.name;
        // TODO: Implement full path building for nested folders
      }
    }

    // Auto-revoke any active share links for this note
    const shares = await ctx.db
      .query("sharedNotes")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .collect();

    for (const share of shares) {
      if (share.isActive) {
        await ctx.db.patch(share._id, {
          isActive: false,
          updatedAt: Date.now(),
        });
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

// Restore a note from trash
export const restoreNote = mutation({
  args: {
    noteId: v.id("notes"),
    restoreToFolderId: v.optional(v.id("folders")), // Optional override
  },
  handler: async (ctx, { noteId, restoreToFolderId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const note = await ctx.db.get(noteId);
    if (!note || !note.isDeleted) {
      throw new Error("Note not found or not deleted");
    }

    // Verify ownership before allowing restore
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to restore this note");
    }

    // Determine target folder (smart restore logic)
    let targetFolderId = restoreToFolderId;
    if (!targetFolderId) {
      // Try to restore to original location
      targetFolderId = note.deletedFromFolderId;

      // Verify original folder still exists and is not deleted
      if (targetFolderId) {
        const folder = await ctx.db.get(targetFolderId);
        if (!folder || folder.isDeleted) {
          targetFolderId = undefined; // Fallback to root
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

// Permanently delete a note
export const permanentDeleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing permanent deletion
    await verifyNoteOwnership(ctx, noteId, userId);

    // Delete associated files from storage
    const files = await ctx.db
      .query("files")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .collect();

    for (const file of files) {
      try {
        // Delete from Convex storage
        await ctx.storage.delete(file.storageId);
        // Delete metadata record
        await ctx.db.delete(file._id);
      } catch (error) {
        console.error(`Failed to delete file ${file.storageId}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Delete associated note-tag relationships
    const noteTags = await ctx.db
      .query("noteTags")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .collect();

    for (const noteTag of noteTags) {
      await ctx.db.delete(noteTag._id);
    }

    // Delete the note
    await ctx.db.delete(noteId);
  },
});

// Toggle pin status
export const togglePin = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

    // Verify ownership before allowing toggle
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to modify this note");
    }

    await ctx.db.patch(noteId, {
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
    });
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

    // Verify ownership before allowing toggle
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to modify this note");
    }

    await ctx.db.patch(noteId, {
      isFavorite: !note.isFavorite,
      updatedAt: Date.now(),
    });
  },
});

// Get favorite notes for a user
export const getFavoriteNotes = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_favorite", (q) =>
        q.eq("userId", userId).eq("isFavorite", true)
      )
      .collect();

    // Filter out deleted notes and sort by updated date
    return notes
      .filter((note) => !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get note counts for sidebar (optimized - single query)
export const getNoteCounts = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeNotes = notes.filter((n) => !n.isDeleted);
    const deletedNotes = notes.filter((n) => n.isDeleted);
    const favoriteNotes = notes.filter((n) => n.isFavorite && !n.isDeleted);
    const uncategorizedNotes = activeNotes.filter((n) => !n.folderId);

    return {
      total: activeNotes.length,
      uncategorized: uncategorizedNotes.length,
      deleted: deletedNotes.length,
      favorites: favoriteNotes.length,
    };
  },
});

// Move note to different folder
export const moveNoteToFolder = mutation({
  args: {
    noteId: v.id("notes"),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, { noteId, folderId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing move
    await verifyNoteOwnership(ctx, noteId, userId);

    await ctx.db.patch(noteId, {
      folderId: folderId === null ? undefined : folderId,
      updatedAt: Date.now(),
    });
  },
});

// Reorder notes by updating position
export const reorderNotes = mutation({
  args: {
    updates: v.array(
      v.object({
        noteId: v.id("notes"),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, { updates }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of all notes before updating
    for (const update of updates) {
      await verifyNoteOwnership(ctx, update.noteId, userId);
    }

    // Now perform all updates
    for (const update of updates) {
      await ctx.db.patch(update.noteId, {
        position: update.position,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get recent notes (last 10 updated)
export const getRecentNotes = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .collect();

    return notes
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
});

// Get workspace notes (pinned + recent) - optimized for workspace view
export const getWorkspaceNotes = query({
  args: { recentLimit: v.optional(v.number()) },
  handler: async (ctx, { recentLimit = 10 }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .collect();

    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    const pinnedNotes = sortedNotes.filter((note) => note.isPinned);
    const recentNotes = sortedNotes
      .filter((note) => !note.isPinned)
      .slice(0, recentLimit);

    return {
      pinnedNotes,
      recentNotes,
      totalCount: notes.length,
    };
  },
});

// ==================== PAGINATED QUERIES ====================
// These queries use cursor-based pagination for better performance at scale
// Use these for list views with large datasets

/**
 * Get notes with pagination (optimized for large note collections)
 * Returns paginated results with cursor for next page
 *
 * Performance: Loads only requested page size (default 50)
 * vs getNotes() which loads all notes at once
 */
export const getNotesPaginated = query({
  args: {
    folderId: v.optional(v.union(v.id("folders"), v.null())),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { folderId, paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Note: Convex pagination doesn't support filtering after pagination,
    // so we need to handle folderId filtering differently

    // For now, we'll paginate all notes and filter client-side for folders
    // TODO: Consider creating separate indexes for folder-specific queries
    const result = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .order("desc") // Order by _creationTime descending (newest first)
      .paginate(paginationOpts);

    // Filter by folder if specified
    let filteredPage = result.page;
    if (folderId === null) {
      // null means show only uncategorized notes (no folder)
      filteredPage = result.page.filter((note) => !note.folderId);
    } else if (folderId !== undefined) {
      // Specific folder ID
      filteredPage = result.page.filter((note) => note.folderId === folderId);
    }

    // Sort by updatedAt (since index sorts by _creationTime)
    filteredPage = filteredPage.sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      page: filteredPage,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/**
 * Get notes minimal with pagination
 * Returns only essential fields for list views (excludes content)
 *
 * Performance: ~70% less data transfer than full notes
 */
export const getNotesMinimalPaginated = query({
  args: {
    folderId: v.optional(v.union(v.id("folders"), v.null())),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { folderId, paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const result = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      )
      .order("desc")
      .paginate(paginationOpts);

    // Filter by folder
    let filteredPage = result.page;
    if (folderId === null) {
      filteredPage = result.page.filter((note) => !note.folderId);
    } else if (folderId !== undefined) {
      filteredPage = result.page.filter((note) => note.folderId === folderId);
    }

    // Map to minimal fields
    const minimalNotes = filteredPage
      .map((note) => ({
        _id: note._id,
        _creationTime: note._creationTime,
        userId: note.userId,
        folderId: note.folderId,
        title: note.title,
        updatedAt: note.updatedAt,
        createdAt: note.createdAt,
        isPinned: note.isPinned,
        isFavorite: note.isFavorite,
        isDeleted: note.isDeleted,
        // Provide a short preview from content (first 100 chars)
        contentPreview: note.content?.substring(0, 100) || "",
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      page: minimalNotes,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/**
 * Get deleted notes with pagination (trash)
 */
export const getDeletedNotesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const result = await ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", true)
      )
      .order("desc")
      .paginate(paginationOpts);

    // Sort by deletedAt
    const sortedPage = result.page.sort(
      (a, b) => (b.deletedAt || 0) - (a.deletedAt || 0)
    );

    return {
      page: sortedPage,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/**
 * Get favorite notes with pagination
 */
export const getFavoriteNotesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    const result = await ctx.db
      .query("notes")
      .withIndex("by_user_favorite", (q) =>
        q.eq("userId", userId).eq("isFavorite", true)
      )
      .order("desc")
      .paginate(paginationOpts);

    // Filter out deleted notes and sort by updated date
    const activeFavorites = result.page
      .filter((note) => !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      page: activeFavorites,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/**
 * Search notes with pagination
 * Searches both title and content
 */
export const searchNotesPaginated = query({
  args: {
    searchTerm: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { searchTerm, paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Search in titles
    const titleResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", searchTerm).eq("userId", userId).eq("isDeleted", false)
      )
      .paginate(paginationOpts);

    // Search in content (separate pagination for now)
    const contentResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchTerm).eq("userId", userId).eq("isDeleted", false)
      )
      .paginate(paginationOpts);

    // Merge and deduplicate results
    const allResults = [...titleResults.page, ...contentResults.page];
    const uniqueResults = Array.from(
      new Map(allResults.map((note) => [note._id, note])).values()
    );

    // Sort by relevance (updatedAt as proxy)
    const sortedResults = uniqueResults.sort((a, b) => b.updatedAt - a.updatedAt);

    // Determine if more results exist
    const isDone = titleResults.isDone && contentResults.isDone;

    return {
      page: sortedResults,
      continueCursor: titleResults.continueCursor || contentResults.continueCursor,
      isDone,
    };
  },
});
