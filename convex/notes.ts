import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId, verifyNoteOwnership } from "./auth";

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

    // Verify ownership before returning sensitive content
    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't have permission to access this note");
    }

    // Return title + content/blocks + coverImage (title is used only on initial load if context is empty)
    return {
      _id: note._id,
      title: note.title,
      content: note.content,
      blocks: note.blocks,
      contentType: note.contentType,
      coverImage: note.coverImage,
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

    const noteId = await ctx.db.insert("notes", {
      userId,
      folderId,
      title,
      content: content || "",
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
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, { noteId, folderId, ...updates }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing update
    await verifyNoteOwnership(ctx, noteId, userId);

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
      ...(folderId !== undefined && {
        folderId: folderId === null ? undefined : folderId
      }),
    };

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
