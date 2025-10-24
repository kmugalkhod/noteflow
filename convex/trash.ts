/**
 * Trash Operations
 *
 * Backend mutations and queries for enhanced trash management including
 * auto-expiration, bulk operations, and advanced filtering
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Constants
const TRASH_RETENTION_DAYS = 30;
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Scheduled function: Automatically delete notes/folders older than 30 days
 * This runs daily at midnight UTC via cron job
 */
export const cleanupExpiredTrash = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expirationThreshold = now - TRASH_RETENTION_MS;

    // Find expired notes
    const expiredNotes = await ctx.db
      .query("notes")
      .withIndex("by_deleted_date", (q) => q.eq("isDeleted", true))
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

      // Audit log
      await ctx.db.insert("trashAuditLog", {
        userId: note.userId,
        action: "auto_delete",
        itemType: "note",
        itemId: note._id,
        itemTitle: note.title,
        timestamp: now,
        metadata: {
          deletedAt: note.deletedAt,
          expirationDate: expirationThreshold,
        },
      });

      // Delete note
      await ctx.db.delete(note._id);
    }

    // Find expired folders
    const expiredFolders = await ctx.db
      .query("folders")
      .withIndex("by_deleted_date", (q) => q.eq("isDeleted", true))
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
        // Delete tags for each note
        const noteTags = await ctx.db
          .query("noteTags")
          .withIndex("by_note", (q) => q.eq("noteId", note._id))
          .collect();

        for (const tag of noteTags) {
          await ctx.db.delete(tag._id);
        }

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
        metadata: {
          deletedAt: folder.deletedAt,
          expirationDate: expirationThreshold,
          childNotesCount: childNotes.length,
        },
      });

      // Delete folder
      await ctx.db.delete(folder._id);
    }

    return {
      notesDeleted: expiredNotes.length,
      foldersDeleted: expiredFolders.length,
      timestamp: now,
    };
  },
});

/**
 * Get deleted items with enhanced metadata including expiration info
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

    // Enhance with expiration info and original folder metadata
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

    // Sort by deletion date (newest first)
    return enhancedNotes.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
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
        results.push({
          noteId,
          success: false,
          reason: "not_found_or_not_deleted",
        });
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

      // Audit log
      await ctx.db.insert("trashAuditLog", {
        userId: note.userId,
        action: "bulk_restore",
        itemType: "note",
        itemId: note._id,
        itemTitle: note.title,
        timestamp: Date.now(),
        metadata: {
          restoredToFolderId: targetFolderId,
          restoredToOriginal: targetFolderId === note.deletedFromFolderId,
        },
      });

      results.push({ noteId, success: true, restoredToFolderId: targetFolderId });
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

      // Audit log
      await ctx.db.insert("trashAuditLog", {
        userId: note.userId,
        action: "bulk_delete",
        itemType: "note",
        itemId: note._id,
        itemTitle: note.title,
        timestamp: Date.now(),
      });

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

    // Delete all notes
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

    // Audit log
    await ctx.db.insert("trashAuditLog", {
      userId,
      action: "empty_trash",
      itemType: "note", // Generic
      itemId: userId, // Use userId as itemId for empty trash action
      itemTitle: "Empty Trash",
      timestamp: Date.now(),
      metadata: {
        notesDeleted: deletedNotes.length,
        foldersDeleted: deletedFolders.length,
      },
    });

    return {
      notesDeleted: deletedNotes.length,
      foldersDeleted: deletedFolders.length,
    };
  },
});
