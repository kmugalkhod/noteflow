import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Get all tags for a user
export const getTags = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
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

// Create a new tag
export const createTag = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, color }) => {
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
    userId: v.id("users"),
    noteId: v.id("notes"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, { userId, noteId, name, color }) => {
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
