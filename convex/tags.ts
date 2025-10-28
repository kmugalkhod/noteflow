import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthenticatedUserId, verifyNoteOwnership } from "./auth";

// Helper to verify tag ownership
async function verifyTagOwnership(
  ctx: any,
  tagId: Id<"tags">,
  userId: Id<"users">
): Promise<void> {
  const tag = await ctx.db.get(tagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  if (tag.userId !== userId) {
    throw new Error("Unauthorized: You don't have permission to access this tag");
  }
}

// Get all tags for a user
export const getTags = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tags.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get tags for a specific note
export const getTagsForNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of the note
    await verifyNoteOwnership(ctx, noteId, userId);

    const noteTags = await ctx.db
      .query("noteTags")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .collect();

    const tags = await Promise.all(
      noteTags.map(async (noteTag) => {
        const tag = await ctx.db.get(noteTag.tagId);
        return tag;
      })
    );

    return tags.filter((tag) => tag !== null);
  },
});

// Get notes for a specific tag
export const getNotesForTag = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, { tagId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of the tag
    await verifyTagOwnership(ctx, tagId, userId);

    const noteTags = await ctx.db
      .query("noteTags")
      .withIndex("by_tag", (q) => q.eq("tagId", tagId))
      .collect();

    const notes = await Promise.all(
      noteTags.map(async (noteTag) => {
        const note = await ctx.db.get(noteTag.noteId);
        return note;
      })
    );

    // Filter out deleted notes
    return notes
      .filter((note) => note !== null && !note.isDeleted)
      .sort((a, b) => b!.updatedAt - a!.updatedAt);
  },
});

// Get notes for a specific tag by name
export const getNotesForTagByName = query({
  args: {
    tagName: v.string()
  },
  handler: async (ctx, { tagName }) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);

    // Find the tag by name
    const tag = await ctx.db
      .query("tags")
      .withIndex("by_user_and_name", (q) =>
        q.eq("userId", userId).eq("name", tagName)
      )
      .first();

    if (!tag) {
      return [];
    }

    // Get note-tag relationships
    const noteTags = await ctx.db
      .query("noteTags")
      .withIndex("by_tag", (q) => q.eq("tagId", tag._id))
      .collect();

    // Fetch all notes
    const notes = await Promise.all(
      noteTags.map(async (noteTag) => {
        const note = await ctx.db.get(noteTag.noteId);
        return note;
      })
    );

    // Filter out deleted notes and null values
    return notes
      .filter((note) => note !== null && !note.isDeleted)
      .sort((a, b) => b!.updatedAt - a!.updatedAt);
  },
});

// Create a new tag
export const createTag = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { name, color }) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);

    // Check if tag with same name already exists
    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_user_and_name", (q) =>
        q.eq("userId", userId).eq("name", name)
      )
      .first();

    if (existingTag) {
      return existingTag._id;
    }

    const tagId = await ctx.db.insert("tags", {
      userId,
      name,
      color,
      createdAt: Date.now(),
    });

    return tagId;
  },
});

// Update a tag
export const updateTag = mutation({
  args: {
    tagId: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { tagId, name, color }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing update
    await verifyTagOwnership(ctx, tagId, userId);

    await ctx.db.patch(tagId, {
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
    });
  },
});

// Delete a tag (and all associations)
export const deleteTag = mutation({
  args: { tagId: v.id("tags") },
  handler: async (ctx, { tagId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership before allowing deletion
    await verifyTagOwnership(ctx, tagId, userId);

    // Delete all note-tag associations
    const noteTags = await ctx.db
      .query("noteTags")
      .withIndex("by_tag", (q) => q.eq("tagId", tagId))
      .collect();

    for (const noteTag of noteTags) {
      await ctx.db.delete(noteTag._id);
    }

    // Delete the tag
    await ctx.db.delete(tagId);
  },
});

// Add a tag to a note
export const addTagToNote = mutation({
  args: {
    noteId: v.id("notes"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, { noteId, tagId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of both note and tag
    await verifyNoteOwnership(ctx, noteId, userId);
    await verifyTagOwnership(ctx, tagId, userId);

    // Check if association already exists
    const existing = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", noteId).eq("tagId", tagId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const noteTagId = await ctx.db.insert("noteTags", {
      noteId,
      tagId,
    });

    return noteTagId;
  },
});

// Remove a tag from a note
export const removeTagFromNote = mutation({
  args: {
    noteId: v.id("notes"),
    tagId: v.id("tags"),
  },
  handler: async (ctx, { noteId, tagId }) => {
    // Get authenticated user ID
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of both note and tag
    await verifyNoteOwnership(ctx, noteId, userId);
    await verifyTagOwnership(ctx, tagId, userId);

    const noteTag = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", noteId).eq("tagId", tagId)
      )
      .first();

    if (noteTag) {
      await ctx.db.delete(noteTag._id);
    }
  },
});

// Create tag and add to note in one operation
export const createAndAddTag = mutation({
  args: {
    noteId: v.id("notes"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { noteId, name, color }) => {
    // Get authenticated user ID from server-side auth context
    const userId = await getAuthenticatedUserId(ctx);

    // Verify ownership of the note
    await verifyNoteOwnership(ctx, noteId, userId);

    // Create or get existing tag
    const existingTag = await ctx.db
      .query("tags")
      .withIndex("by_user_and_name", (q) =>
        q.eq("userId", userId).eq("name", name)
      )
      .first();

    let tagId: Id<"tags">;
    if (existingTag) {
      tagId = existingTag._id;
    } else {
      tagId = await ctx.db.insert("tags", {
        userId,
        name,
        color,
        createdAt: Date.now(),
      });
    }

    // Add tag to note
    const existing = await ctx.db
      .query("noteTags")
      .withIndex("by_note_and_tag", (q) =>
        q.eq("noteId", noteId).eq("tagId", tagId)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("noteTags", {
        noteId,
        tagId,
      });
    }

    return tagId;
  },
});
