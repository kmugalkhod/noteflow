import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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

// Get nested folder tree with counts
export const getNestedFolders = query({
  args: { userId: v.id("users"), parentId: v.optional(v.id("folders")) },
  handler: async (ctx, { userId, parentId }) => {
    // Get folders at this level
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user_and_parent", (q) =>
        q.eq("userId", userId).eq("parentId", parentId ?? undefined)
      )
      .collect();

    // Sort by position (if exists) then by name
    const sortedFolders = folders.sort((a, b) => {
      if (a.position !== undefined && b.position !== undefined) {
        return a.position - b.position;
      }
      return a.name.localeCompare(b.name);
    });

    // For each folder, get note count and subfolder count
    const foldersWithCounts = await Promise.all(
      sortedFolders.map(async (folder) => {
        // Get direct notes in this folder
        const notes = await ctx.db
          .query("notes")
          .withIndex("by_folder", (q) => q.eq("folderId", folder._id))
          .collect();
        const activeNotes = notes.filter((note) => !note.isDeleted);

        // Get subfolders
        const subfolders = await ctx.db
          .query("folders")
          .withIndex("by_parent", (q) => q.eq("parentId", folder._id))
          .collect();

        return {
          ...folder,
          noteCount: activeNotes.length,
          subfolderCount: subfolders.length,
          hasChildren: subfolders.length > 0,
        };
      })
    );

    return foldersWithCounts;
  },
});

// Get folder path (breadcrumb trail)
export const getFolderPath = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, { folderId }) => {
    const path: Array<{ _id: string; name: string }> = [];
    let currentFolderId: Id<"folders"> | undefined = folderId;

    // Traverse up the tree
    while (currentFolderId) {
      const doc = await ctx.db.get(currentFolderId);
      if (!doc) break;

      // Type assertion to tell TypeScript this is a folders document
      const folderDoc = doc as { _id: Id<"folders">; name: string; parentId?: Id<"folders"> };
      path.unshift({ _id: folderDoc._id, name: folderDoc.name });
      currentFolderId = folderDoc.parentId;
    }

    return path;
  },
});

// Move folder to different parent
export const moveFolderToFolder = mutation({
  args: {
    folderId: v.id("folders"),
    newParentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { folderId, newParentId }) => {
    // Prevent moving folder into itself or its descendants
    if (newParentId) {
      let checkParentId: Id<"folders"> | undefined = newParentId;
      while (checkParentId) {
        if (checkParentId === folderId) {
          throw new Error("Cannot move folder into itself or its descendants");
        }
        const doc = await ctx.db.get(checkParentId);
        if (!doc) break;

        // Type assertion to tell TypeScript this is a folders document
        const parentFolderDoc = doc as { parentId?: Id<"folders"> };
        checkParentId = parentFolderDoc.parentId;
      }
    }

    // Update the folder's parent
    await ctx.db.patch(folderId, {
      parentId: newParentId,
    });
  },
});

// Reorder items (folders or notes) by updating their position
export const reorderFolders = mutation({
  args: {
    updates: v.array(
      v.object({
        folderId: v.id("folders"),
        position: v.number(),
      })
    ),
  },
  handler: async (ctx, { updates }) => {
    for (const update of updates) {
      await ctx.db.patch(update.folderId, {
        position: update.position,
      });
    }
  },
});

// Delete folder and handle subfolders recursively
export const deleteFolderRecursive = mutation({
  args: {
    folderId: v.id("folders"),
    deleteNotes: v.optional(v.boolean()),
  },
  handler: async (ctx, { folderId, deleteNotes = false }) => {
    // Helper function to recursively delete folders
    async function deleteFolderAndChildren(fId: string) {
      // Get all subfolders
      const subfolders = await ctx.db
        .query("folders")
        .withIndex("by_parent", (q) => q.eq("parentId", fId as any))
        .collect();

      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteFolderAndChildren(subfolder._id);
      }

      // Get notes in this folder
      const notes = await ctx.db
        .query("notes")
        .withIndex("by_folder", (q) => q.eq("folderId", fId as any))
        .collect();

      if (deleteNotes) {
        // Soft delete notes
        for (const note of notes) {
          await ctx.db.patch(note._id, {
            isDeleted: true,
            deletedAt: Date.now(),
          });
        }
      } else {
        // Move notes to root
        for (const note of notes) {
          await ctx.db.patch(note._id, {
            folderId: undefined,
          });
        }
      }

      // Delete the folder itself
      await ctx.db.delete(fId as any);
    }

    await deleteFolderAndChildren(folderId);
  },
});
