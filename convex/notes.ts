import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all notes for a user (excluding deleted)
export const getNotes = query({
  args: {
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { userId, folderId }) => {
    const notesQuery = ctx.db
      .query("notes")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", userId).eq("isDeleted", false)
      );

    const notes = await notesQuery.collect();

    // Filter by folder if specified
    if (folderId !== undefined) {
      const filteredNotes = notes.filter((note) => note.folderId === folderId);
      return filteredNotes;
    }

    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get a single note
export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    return await ctx.db.get(noteId);
  },
});

// Search notes
export const searchNotes = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, { userId, searchTerm }) => {
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
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
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
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { userId, folderId, title, content }) => {
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
  },
  handler: async (ctx, { noteId, folderId, ...updates }) => {
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
    await ctx.db.patch(noteId, {
      isDeleted: true,
      deletedAt: Date.now(),
    });
  },
});

// Restore a note from trash
export const restoreNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    await ctx.db.patch(noteId, {
      isDeleted: false,
      deletedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// Permanently delete a note
export const permanentDeleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
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
    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

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
    const note = await ctx.db.get(noteId);
    if (!note) throw new Error("Note not found");

    await ctx.db.patch(noteId, {
      isFavorite: !note.isFavorite,
      updatedAt: Date.now(),
    });
  },
});

// Get favorite notes for a user
export const getFavoriteNotes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
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

// Move note to different folder
export const moveNoteToFolder = mutation({
  args: {
    noteId: v.id("notes"),
    folderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, { noteId, folderId }) => {
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
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 10 }) => {
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
