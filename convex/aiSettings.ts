/**
 * AI Settings Convex API
 * Manages user AI provider configurations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId } from "./auth";

/**
 * Get active AI settings for the current user
 */
export const getAISettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .first();

    return settings;
  },
});

/**
 * Save or update AI settings
 */
export const saveAISettings = mutation({
  args: {
    provider: v.union(v.literal("openai"), v.literal("anthropic"), v.literal("google")),
    model: v.string(),
    encryptedApiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Deactivate all existing settings for this user
    const existingSettings = await ctx.db
      .query("aiSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const setting of existingSettings) {
      await ctx.db.patch(setting._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }

    // Check if we're updating an existing config or creating a new one
    const existingConfig = existingSettings.find(
      (s) => s.provider === args.provider && s.model === args.model
    );

    if (existingConfig) {
      // Update existing config
      await ctx.db.patch(existingConfig._id, {
        encryptedApiKey: args.encryptedApiKey,
        isActive: true,
        updatedAt: Date.now(),
      });
      return { settingsId: existingConfig._id };
    } else {
      // Create new config
      const settingsId = await ctx.db.insert("aiSettings", {
        userId,
        provider: args.provider,
        model: args.model,
        encryptedApiKey: args.encryptedApiKey,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { settingsId };
    }
  },
});

/**
 * Delete AI settings (deactivate)
 */
export const deleteAISettings = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Deactivate all settings for this user
    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const setting of settings) {
      await ctx.db.patch(setting._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Update last used timestamp
 */
export const updateLastUsed = mutation({
  args: {
    settingsId: v.id("aiSettings"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) return;

    const settings = await ctx.db.get(args.settingsId);
    if (!settings || settings.userId !== userId) return;

    await ctx.db.patch(args.settingsId, {
      lastUsedAt: Date.now(),
    });
  },
});

/**
 * Get all AI settings for user (for settings page)
 */
export const getAllAISettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) return [];

    const settings = await ctx.db
      .query("aiSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return settings;
  },
});
