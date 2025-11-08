import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthenticatedUserId, verifyNoteOwnership } from "./auth";
import { generateShareId } from "../lib/shareUtils";

/**
 * Get share link for a specific note (internal helper)
 */
export const getShareByNoteId = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership
    await verifyNoteOwnership(ctx, noteId, userId);

    // Query for existing share
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .first();

    if (!share) {
      return null;
    }

    // Return share (client will build full URL)
    return share;
  },
});

/**
 * Create a public share link for a note
 * Returns existing link if note is already shared
 */
export const createShareLink = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Get the note and verify ownership
    const note = await ctx.db.get(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    if (note.userId !== userId) {
      throw new Error("Unauthorized: You don't own this note");
    }

    if (note.isDeleted) {
      throw new Error("Note is deleted");
    }

    // Check if share already exists
    const existingShare = await ctx.db
      .query("sharedNotes")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .first();

    // If share exists and is active, return it (client will build full URL)
    if (existingShare && existingShare.isActive) {
      return {
        shareId: existingShare.shareId,
        isNew: false,
      };
    }

    // If share exists but is inactive, reactivate it
    if (existingShare && !existingShare.isActive) {
      await ctx.db.patch(existingShare._id, {
        isActive: true,
        updatedAt: Date.now(),
      });

      return {
        shareId: existingShare.shareId,
        isNew: false,
      };
    }

    // Create new share
    const shareId = generateShareId();
    const now = Date.now();

    await ctx.db.insert("sharedNotes", {
      shareId,
      noteId,
      userId,
      isActive: true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return {
      shareId,
      isNew: true,
    };
  },
});

/**
 * Revoke/deactivate a share link
 * Sets isActive to false while preserving analytics
 */
export const revokeShareLink = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership
    await verifyNoteOwnership(ctx, noteId, userId);

    // Find the share
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .first();

    if (!share) {
      throw new Error("No share link found for this note");
    }

    if (!share.isActive) {
      throw new Error("Share link is already revoked");
    }

    // Deactivate the share (preserve analytics)
    await ctx.db.patch(share._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get all shared notes for the authenticated user
 * Returns shares with note titles, sorted by creation date
 */
export const getMySharedNotes = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Query all shares for this user
    const shares = await ctx.db
      .query("sharedNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch note details for each share (client will build shareUrl)
    const sharesWithNotes = await Promise.all(
      shares.map(async (share) => {
        const note = await ctx.db.get(share.noteId);
        return {
          ...share,
          noteTitle: note?.title || "Untitled",
          noteIsDeleted: note?.isDeleted || false,
        };
      })
    );

    // Sort by creation date (newest first) and return
    return sharesWithNotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get shared notes with pagination
 * Returns paginated shares with note details
 *
 * Performance: Loads only requested page size instead of all shares
 */
export const getMySharedNotesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Query shares with pagination
    const result = await ctx.db
      .query("sharedNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc") // Newest first
      .paginate(paginationOpts);

    // Fetch note details for each share on this page (client will build shareUrl)
    const sharesWithNotes = await Promise.all(
      result.page.map(async (share) => {
        const note = await ctx.db.get(share.noteId);
        return {
          ...share,
          noteTitle: note?.title || "Untitled",
          noteIsDeleted: note?.isDeleted || false,
        };
      })
    );

    // Sort by creation date (newest first)
    const sortedShares = sharesWithNotes.sort((a, b) => b.createdAt - a.createdAt);

    return {
      page: sortedShares,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});
