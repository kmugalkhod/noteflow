import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId } from "./auth";

/**
 * Generate a signed upload URL for file uploads
 * Client will POST the file directly to this URL
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Authenticate user
    const userId = await getAuthenticatedUserId(ctx);

    // Generate and return upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save file metadata after successful upload
 * Called by client after file upload completes
 */
export const saveFileMetadata = mutation({
  args: {
    storageId: v.string(),
    noteId: v.optional(v.id("notes")),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, { storageId, noteId, fileName, fileSize, fileType }) => {
    const userId = await getAuthenticatedUserId(ctx);

    // Verify note ownership if noteId provided
    if (noteId) {
      const note = await ctx.db.get(noteId);
      if (!note || note.userId !== userId) {
        throw new Error("Unauthorized: You don't own this note");
      }
    }

    // Save metadata
    const fileId = await ctx.db.insert("files", {
      storageId,
      userId,
      noteId,
      fileName,
      fileSize,
      fileType,
      uploadedAt: Date.now(),
    });

    return fileId;
  },
});

/**
 * Delete a file from storage
 */
export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthenticatedUserId(ctx);

    // Find file metadata
    const fileRecord = await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", storageId))
      .first();

    if (!fileRecord) {
      throw new Error("File not found");
    }

    // Verify ownership
    if (fileRecord.userId !== userId) {
      throw new Error("Unauthorized: You don't own this file");
    }

    // Delete from storage
    await ctx.storage.delete(storageId);

    // Delete metadata record
    await ctx.db.delete(fileRecord._id);

    return { success: true };
  },
});

/**
 * Get file URL from storage ID
 * Returns null if file doesn't exist
 */
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, { storageId }) => {
    try {
      const url = await ctx.storage.getUrl(storageId);
      return url;
    } catch (error) {
      console.error("Failed to get file URL:", error);
      return null;
    }
  },
});

/**
 * Get all files for a specific note
 */
export const getFilesForNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthenticatedUserId(ctx);

    // Verify note ownership
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get all files for this note
    const files = await ctx.db
      .query("files")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .collect();

    // Resolve URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        return { ...file, url };
      })
    );

    return filesWithUrls;
  },
});
