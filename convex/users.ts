import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get current user by Clerk ID
export const getCurrentUser = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    return user;
  },
});

// Create or update user (called after Clerk authentication)
export const createOrUpdateUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        theme: "system",
        defaultView: "grid",
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    defaultView: v.optional(v.union(v.literal("grid"), v.literal("list"))),
  },
  handler: async (ctx, { userId, theme, defaultView }) => {
    await ctx.db.patch(userId, {
      ...(theme && { theme }),
      ...(defaultView && { defaultView }),
      updatedAt: Date.now(),
    });
  },
});

// Update user (including expanded folders)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    defaultView: v.optional(v.union(v.literal("grid"), v.literal("list"))),
    expandedFolders: v.optional(v.array(v.id("folders"))),
  },
  handler: async (ctx, { userId, theme, defaultView, expandedFolders }) => {
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (theme !== undefined) updateData.theme = theme;
    if (defaultView !== undefined) updateData.defaultView = defaultView;
    if (expandedFolders !== undefined) updateData.expandedFolders = expandedFolders;

    await ctx.db.patch(userId, updateData);
  },
});
