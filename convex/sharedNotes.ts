import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId, verifyNoteOwnership } from "./auth";
import { generateShareId, buildShareUrl } from "../lib/shareUtils";

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

    // Return share with full URL
    return {
      ...share,
      shareUrl: buildShareUrl(share.shareId),
    };
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

    // If share exists and is active, return it
    if (existingShare && existingShare.isActive) {
      return {
        shareId: existingShare.shareId,
        shareUrl: buildShareUrl(existingShare.shareId),
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
        shareUrl: buildShareUrl(existingShare.shareId),
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
      shareUrl: buildShareUrl(shareId),
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

    // Fetch note details for each share
    const sharesWithNotes = await Promise.all(
      shares.map(async (share) => {
        const note = await ctx.db.get(share.noteId);
        return {
          ...share,
          shareUrl: buildShareUrl(share.shareId),
          noteTitle: note?.title || "Untitled",
          noteIsDeleted: note?.isDeleted || false,
        };
      })
    );

    // Sort by creation date (newest first) and return
    return sharesWithNotes.sort((a, b) => b.createdAt - a.createdAt);
  },
});
