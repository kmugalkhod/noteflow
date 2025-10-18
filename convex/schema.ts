import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    clerkUserId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // User preferences
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    defaultView: v.optional(v.union(v.literal("grid"), v.literal("list"))),
    expandedFolders: v.optional(v.array(v.id("folders"))), // Track which folders are expanded in sidebar

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Notes table
  notes: defineTable({
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),

    title: v.string(),
    content: v.string(), // For backward compatibility - plain text or JSON string
    contentType: v.optional(v.union(v.literal("plain"), v.literal("rich"))), // Content format
    blocks: v.optional(v.string()), // JSON string for structured block content

    // Metadata
    isPinned: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()), // For favorites section
    color: v.optional(v.string()),
    position: v.optional(v.number()), // For custom ordering via drag-drop

    // Soft delete
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_folder", ["folderId"])
    .index("by_user_not_deleted", ["userId", "isDeleted"])
    .index("by_user_and_folder", ["userId", "folderId"])
    .index("by_user_favorite", ["userId", "isFavorite"]) // Index for favorites
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId", "isDeleted"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "isDeleted"],
    }),

  // Folders table
  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    position: v.optional(v.number()), // For custom ordering via drag-drop

    // For nested folders (optional)
    parentId: v.optional(v.id("folders")),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_user_and_parent", ["userId", "parentId"]), // Index for querying folders by user and parent

  // Tags table
  tags: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  // Note-Tags junction table (many-to-many)
  noteTags: defineTable({
    noteId: v.id("notes"),
    tagId: v.id("tags"),
  })
    .index("by_note", ["noteId"])
    .index("by_tag", ["tagId"])
    .index("by_note_and_tag", ["noteId", "tagId"]),
});
