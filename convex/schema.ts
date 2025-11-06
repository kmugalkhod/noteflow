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

    // Cover image
    coverImage: v.optional(v.string()), // URL to cover image

    // Drawing
    hasDrawing: v.optional(v.boolean()), // Quick check if note has associated drawing

    // Metadata
    isPinned: v.optional(v.boolean()),
    isFavorite: v.optional(v.boolean()), // For favorites section
    color: v.optional(v.string()),
    position: v.optional(v.number()), // For custom ordering via drag-drop

    // Soft delete
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),

    // Original Location Tracking (for smart restore)
    deletedFromFolderId: v.optional(v.id("folders")), // Track original folder before deletion
    deletedFromPath: v.optional(v.string()), // Full path (e.g., "Work > Projects")

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_folder", ["folderId"])
    .index("by_user_not_deleted", ["userId", "isDeleted"])
    .index("by_user_and_folder", ["userId", "folderId"])
    .index("by_user_favorite", ["userId", "isFavorite"]) // Index for favorites
    .index("by_deleted_date", ["isDeleted", "deletedAt"]) // For expiration queries
    .index("by_deleted_folder", ["deletedFromFolderId"]) // For location filtering
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

    // Soft delete support
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.number()),
    deletedFromParentId: v.optional(v.id("folders")), // Original parent for restore

    createdAt: v.number(),
    updatedAt: v.optional(v.number()), // Add updatedAt for consistency
  })
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_user_and_parent", ["userId", "parentId"]) // Index for querying folders by user and parent
    .index("by_user_not_deleted", ["userId", "isDeleted"]) // For filtering out deleted folders
    .index("by_deleted_date", ["isDeleted", "deletedAt"]), // For expiration queries

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

  // Trash Audit Log table (for tracking auto-deletions and restore operations)
  trashAuditLog: defineTable({
    userId: v.id("users"),
    action: v.string(), // "auto_delete", "restore", "permanent_delete", "bulk_restore", "bulk_delete", "empty_trash"
    itemType: v.string(), // "note" or "folder"
    itemId: v.string(), // ID of the deleted/restored item
    itemTitle: v.string(), // Title/name of the item
    timestamp: v.number(),
    metadata: v.optional(v.any()), // Additional context (deletedAt, expirationDate, etc.)
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_action", ["userId", "action"]), // For filtering by action type

  // Shared Notes table (for public sharing feature)
  sharedNotes: defineTable({
    shareId: v.string(), // Unique nanoid (16 chars)
    noteId: v.id("notes"),
    userId: v.id("users"),
    isActive: v.boolean(),
    viewCount: v.number(),
    lastAccessedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_share_id", ["shareId"]) // Primary lookup for public access
    .index("by_note", ["noteId"]) // Check if note already shared
    .index("by_user", ["userId"]) // List user's shares
    .index("by_user_active", ["userId", "isActive"]), // Filter active shares

  // Files table (for Convex FileStorage tracking)
  files: defineTable({
    storageId: v.string(), // Convex storage ID
    userId: v.id("users"),
    noteId: v.optional(v.id("notes")), // Optional: file may not be attached to note yet
    fileName: v.string(),
    fileSize: v.number(), // Size in bytes
    fileType: v.string(), // MIME type (e.g., "image/jpeg")
    uploadedAt: v.number(),
  })
    .index("by_storage_id", ["storageId"]) // Lookup by storage ID
    .index("by_user", ["userId"]) // List user's files
    .index("by_note", ["noteId"]) // List files for a note
    .index("by_uploaded_at", ["uploadedAt"]), // Sort by upload time

  // Drawings table (for tldraw whiteboard feature)
  drawings: defineTable({
    noteId: v.optional(v.id("notes")), // Optional: can be standalone drawing
    userId: v.id("users"),
    title: v.optional(v.string()), // Title for standalone drawings
    data: v.string(), // Compressed tldraw data
    version: v.number(), // Schema version for migrations
    sizeBytes: v.number(), // Size of compressed data
    elementCount: v.optional(v.number()), // Number of elements in drawing
    createdAt: v.number(),
    updatedAt: v.number(),
    isDeleted: v.optional(v.boolean()), // Soft delete flag
  })
    .index("by_note", ["noteId"]) // Query drawings by note
    .index("by_user", ["userId"]) // Query user's drawings
    .index("by_note_user", ["noteId", "userId"]), // Composite for auth checks

  // Admin Audit Log table (for tracking admin access to user data)
  adminAuditLog: defineTable({
    adminEmail: v.string(), // Email of admin who accessed data
    adminClerkId: v.string(), // Clerk ID of admin
    targetUserId: v.string(), // User whose data was accessed
    action: v.string(), // "viewed_notes", "exported_data", "debugged_issue", etc.
    reason: v.string(), // "Support ticket #123", "Bug investigation", etc.
    metadata: v.optional(v.any()), // Additional context
    timestamp: v.number(),
    ipAddress: v.optional(v.string()), // IP address of admin access
  })
    .index("by_target_user", ["targetUserId"]) // User can see who accessed their data
    .index("by_admin", ["adminClerkId"]) // See all actions by specific admin
    .index("by_timestamp", ["timestamp"]) // Sort by time
    .index("by_action", ["action"]), // Filter by action type
});
