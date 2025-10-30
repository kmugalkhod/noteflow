import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Helper: Get authenticated user ID or throw error
 */
async function getUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated - must be logged in");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) =>
      q.eq("clerkUserId", identity.subject)
    )
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user._id;
}

/**
 * Helper: Validate drawing data size (max 500 KB)
 */
function validateDrawingSize(data: string): number {
  const sizeBytes = new Blob([data]).size;

  if (sizeBytes > 500_000) {
    throw new Error(
      `Drawing size (${sizeBytes} bytes) exceeds 500 KB limit`
    );
  }

  return sizeBytes;
}

/**
 * QUERY: Get drawing by note ID
 * Returns drawing if user owns the note, null otherwise
 */
export const getDrawingByNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db
      .query("drawings")
      .withIndex("by_note_user", (q) =>
        q.eq("noteId", noteId).eq("userId", userId)
      )
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .first();

    return drawing;
  },
});

/**
 * MUTATION: Create new drawing
 * Creates drawing and updates note.hasDrawing flag
 */
export const createDrawing = mutation({
  args: {
    noteId: v.id("notes"),
    data: v.string(),
  },
  handler: async (ctx, { noteId, data }) => {
    const userId = await getUserId(ctx);

    // Verify note ownership
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found or access denied");
    }

    // Check if drawing already exists
    const existing = await ctx.db
      .query("drawings")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .first();

    if (existing) {
      throw new Error("Note already has a drawing");
    }

    // Validate size
    const sizeBytes = validateDrawingSize(data);

    // Create drawing
    const drawingId = await ctx.db.insert("drawings", {
      noteId,
      userId,
      data,
      version: 1,
      sizeBytes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update note
    await ctx.db.patch(noteId, { hasDrawing: true });

    return { drawingId };
  },
});

/**
 * MUTATION: Update existing drawing
 * Updates drawing data and metadata
 */
export const updateDrawing = mutation({
  args: {
    drawingId: v.id("drawings"),
    data: v.string(),
  },
  handler: async (ctx, { drawingId, data }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db.get(drawingId);
    if (!drawing || drawing.userId !== userId) {
      throw new Error("Drawing not found or access denied");
    }

    if (drawing.isDeleted) {
      throw new Error("Cannot update deleted drawing");
    }

    const sizeBytes = validateDrawingSize(data);

    await ctx.db.patch(drawingId, {
      data,
      sizeBytes,
      updatedAt: Date.now(),
    });
  },
});

/**
 * MUTATION: Delete drawing (soft delete)
 * Sets isDeleted flag and updates note.hasDrawing
 */
export const deleteDrawing = mutation({
  args: { drawingId: v.id("drawings") },
  handler: async (ctx, { drawingId }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db.get(drawingId);
    if (!drawing || drawing.userId !== userId) {
      throw new Error("Drawing not found or access denied");
    }

    await ctx.db.patch(drawingId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    // Update note if drawing was attached to one
    if (drawing.noteId) {
      await ctx.db.patch(drawing.noteId, { hasDrawing: false });
    }
  },
});

/**
 * QUERY: Get or create standalone drawing for current user
 * Returns the user's standalone drawing (no noteId)
 */
export const getStandaloneDrawing = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    // Look for existing standalone drawing
    const drawing = await ctx.db
      .query("drawings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("noteId"), undefined),
          q.neq(q.field("isDeleted"), true)
        )
      )
      .first();

    return drawing;
  },
});

/**
 * MUTATION: Create standalone drawing
 */
export const createStandaloneDrawing = mutation({
  args: { data: v.string() },
  handler: async (ctx, { data }) => {
    const userId = await getUserId(ctx);

    // Validate size
    const sizeBytes = validateDrawingSize(data);

    // Create standalone drawing (no noteId)
    const drawingId = await ctx.db.insert("drawings", {
      userId,
      title: "Untitled Drawing",
      data,
      version: 1,
      sizeBytes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { drawingId };
  },
});
