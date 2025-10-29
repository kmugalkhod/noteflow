import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Get shared note by share ID (PUBLIC - no auth required)
 * Returns public-safe note data for SSR/metadata generation
 * Does NOT increment view count - use incrementShareView for that
 */
export const getSharedNote = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // NO AUTH CHECK - This is a public endpoint!

    // Find the share by shareId
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    // Return null if share doesn't exist or is not active
    if (!share || !share.isActive) {
      return null;
    }

    // Get the note
    const note = await ctx.db.get(share.noteId);

    // Return null if note doesn't exist or is deleted
    if (!note || note.isDeleted) {
      return null;
    }

    // Resolve cover image storage ID to URL if present
    let coverImageUrl: string | undefined = undefined;
    if (note.coverImage) {
      try {
        const url = await ctx.storage.getUrl(note.coverImage);
        coverImageUrl = url ?? undefined;
      } catch (error) {
        console.error("Failed to resolve cover image URL:", error);
        // Continue without cover image if resolution fails
      }
    }

    // Return ONLY public-safe fields (no userId, no user personal data)
    return {
      title: note.title,
      content: note.content,
      blocks: note.blocks,
      contentType: note.contentType,
      coverImage: coverImageUrl,
    };
  },
});

/**
 * Increment view count for a shared note (PUBLIC - no auth required)
 * Called from client component when viewing a shared note
 */
export const incrementShareView = mutation({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // NO AUTH CHECK - This is a public endpoint!

    // Find the share by shareId
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    // Only increment if share exists and is active
    if (share && share.isActive) {
      await ctx.db.patch(share._id, {
        viewCount: share.viewCount + 1,
        lastAccessedAt: Date.now(),
      });
    }
  },
});
