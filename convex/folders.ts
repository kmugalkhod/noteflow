import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all folders for a user
export const getFolders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return folders.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get a single folder with note count
export const getFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) return null;

    // Get note count for this folder
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .collect();

    const activeNotes = notes.filter((note) => !note.isDeleted);

    return {
      ...folder,
      noteCount: activeNotes.length,
    };
  },
});

// Get folder with its notes
export const getFolderWithNotes = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const folder = await ctx.db.get(folderId);
    if (!folder) return null;

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .collect();

    const activeNotes = notes
      .filter((note) => !note.isDeleted)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      folder,
      notes: activeNotes,
    };
  },
});

// Create a new folder
export const createFolder = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { userId, name, color, parentId }) => {
    const folderId = await ctx.db.insert("folders", {
      userId,
      name,
      color,
      parentId,
      createdAt: Date.now(),
    });

    return folderId;
  },
});

// Update a folder
export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { folderId, name, color }) => {
    await ctx.db.patch(folderId, {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    });
  },
});

// Delete a folder (and optionally its notes)
export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
    deleteNotes: v.optional(v.boolean()), // If true, delete notes; if false, move to root
  },
  handler: async (ctx, { folderId, deleteNotes = false }) => {
    // Get all notes in this folder
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_folder", (q) => q.eq("folderId", folderId))
      .collect();

    if (deleteNotes) {
      // Soft delete all notes in the folder
      for (const note of notes) {
        await ctx.db.patch(note._id, {
          isDeleted: true,
          deletedAt: Date.now(),
        });
      }
    } else {
      // Move notes to root (no folder)
      for (const note of notes) {
        await ctx.db.patch(note._id, {
          folderId: undefined,
        });
      }
    }

    // Delete the folder
    await ctx.db.delete(folderId);
  },
});

// Get folders with note counts
export const getFoldersWithCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get note counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const notes = await ctx.db
          .query("notes")
          .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
          .collect();

        const activeNotes = notes.filter((note) => !note.isDeleted);

        return {
          ...folder,
          noteCount: activeNotes.length,
        };
      })
    );

    return foldersWithCounts.sort((a, b) => a.name.localeCompare(b.name));
  },
});
