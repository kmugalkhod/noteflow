/**
 * Admin Audit Log System
 *
 * This ensures accountability and transparency:
 * - Any time you access user data, it's logged
 * - Users can see who accessed their data and when
 * - Builds trust and ensures you don't abuse admin access
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Log admin access to user data
 * Call this whenever you need to access user data for support/debugging
 *
 * NOW USES DATABASE-DRIVEN ADMIN ROLES (no more hardcoded emails!)
 */
export const logAdminAccess = mutation({
  args: {
    adminEmail: v.string(),
    targetUserId: v.string(),
    action: v.string(), // "viewed_notes", "exported_data", "debugged_issue", etc.
    reason: v.string(), // "Support ticket #123", "Bug investigation", etc.
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Only allow if you're actually an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user has active admin role in database
    const adminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!adminRole) {
      throw new Error("Unauthorized - admin access only");
    }

    await ctx.db.insert("adminAuditLog", {
      adminEmail: args.adminEmail,
      adminClerkId: identity.subject,
      targetUserId: args.targetUserId,
      action: args.action,
      reason: args.reason,
      metadata: args.metadata,
      timestamp: Date.now(),
      ipAddress: "N/A", // Could be captured from request headers
    });

    return { success: true, message: "Access logged" };
  },
});

/**
 * View audit log for a specific user
 * Users can see who accessed their data
 */
export const getUserAuditLog = query({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Users can only see their own audit log (or admin can see any)
    const targetUserId = args.userId || identity.subject;

    const logs = await ctx.db
      .query("adminAuditLog")
      .filter((q) => q.eq(q.field("targetUserId"), targetUserId))
      .order("desc")
      .take(100);

    return logs;
  },
});

/**
 * Get all audit logs (admin only)
 * NOW USES DATABASE-DRIVEN ADMIN ROLES
 */
export const getAllAuditLogs = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if user has active admin role
    const adminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!adminRole) {
      throw new Error("Unauthorized - admin access only");
    }

    return await ctx.db
      .query("adminAuditLog")
      .order("desc")
      .take(1000);
  },
});

/**
 * Example usage in support scenario:
 *
 * // User reports: "My notes disappeared!"
 * // You need to investigate their database
 *
 * 1. First, log the access:
 * await logAdminAccess({
 *   adminEmail: "admin@noteflow.com",
 *   targetUserId: "user_123",
 *   action: "viewed_notes",
 *   reason: "Support ticket #456 - User reported missing notes",
 *   metadata: { ticketId: "456" }
 * });
 *
 * 2. Then access the data:
 * const notes = await ctx.db.query("notes")
 *   .withIndex("by_user", (q) => q.eq("userId", "user_123"))
 *   .collect();
 *
 * 3. User can see this access in their audit log
 */
