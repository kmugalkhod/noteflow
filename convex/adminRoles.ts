/**
 * Admin Role Management System
 *
 * Database-driven admin access control to replace hardcoded ADMIN_EMAILS.
 * Provides:
 * - Dynamic admin role assignment
 * - Role revocation with audit trail
 * - Superadmin escalation
 * - Complete accountability
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUserId } from "./auth";

/**
 * Check if a user has admin access
 * Returns the admin role record if active, null otherwise
 */
export const isAdmin = query({
  args: {
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { email, userId }) => {
    // Can check by email OR userId
    if (!email && !userId) {
      throw new Error("Must provide either email or userId");
    }

    let adminRole;

    if (email) {
      // Check by email (most common for middleware)
      adminRole = await ctx.db
        .query("adminRoles")
        .withIndex("by_email_active", (q) =>
          q.eq("email", email).eq("revokedAt", undefined)
        )
        .first();
    } else if (userId) {
      // Check by userId
      adminRole = await ctx.db
        .query("adminRoles")
        .withIndex("by_user_active", (q) =>
          q.eq("userId", userId).eq("revokedAt", undefined)
        )
        .first();
    }

    return adminRole || null;
  },
});

/**
 * Check if current authenticated user is an admin
 * Convenience function for mutation/query auth checks
 */
export const checkCurrentUserIsAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();
  },
});

/**
 * Grant admin role to a user
 * Only superadmins can grant roles
 */
export const grantAdminRole = mutation({
  args: {
    targetUserId: v.id("users"),
    targetEmail: v.string(),
    role: v.union(v.literal("admin"), v.literal("superadmin")),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { targetUserId, targetEmail, role, reason }) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUserId = await getAuthenticatedUserId(ctx);

    // Check if current user is a superadmin
    const currentAdminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!currentAdminRole || currentAdminRole.role !== "superadmin") {
      throw new Error("Unauthorized: Only superadmins can grant roles");
    }

    // Check if target already has an active role
    const existingRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", targetUserId).eq("revokedAt", undefined)
      )
      .first();

    if (existingRole) {
      throw new Error(`User already has ${existingRole.role} role`);
    }

    // Grant the role
    const roleId = await ctx.db.insert("adminRoles", {
      userId: targetUserId,
      email: targetEmail,
      role,
      grantedBy: currentUserId,
      grantedByEmail: identity.email || "",
      grantedAt: Date.now(),
      reason: reason || `Admin role granted by ${identity.email}`,
    });

    // Log this action in admin audit log
    await ctx.db.insert("adminAuditLog", {
      adminEmail: identity.email || "",
      adminClerkId: identity.subject,
      targetUserId: targetUserId,
      action: "granted_admin_role",
      reason: `Granted ${role} role to ${targetEmail}`,
      metadata: { role, targetEmail, reason },
      timestamp: Date.now(),
      ipAddress: "N/A", // Can be passed from middleware if available
    });

    return { roleId, success: true };
  },
});

/**
 * Revoke admin role from a user
 * Only superadmins can revoke roles
 */
export const revokeAdminRole = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { targetUserId, reason }) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUserId = await getAuthenticatedUserId(ctx);

    // Check if current user is a superadmin
    const currentAdminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!currentAdminRole || currentAdminRole.role !== "superadmin") {
      throw new Error("Unauthorized: Only superadmins can revoke roles");
    }

    // Prevent self-revocation
    if (targetUserId === currentUserId) {
      throw new Error("Cannot revoke your own admin role");
    }

    // Find target's active role
    const targetRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", targetUserId).eq("revokedAt", undefined)
      )
      .first();

    if (!targetRole) {
      throw new Error("User does not have an active admin role");
    }

    // Revoke the role (soft delete)
    await ctx.db.patch(targetRole._id, {
      revokedAt: Date.now(),
      revokedBy: currentUserId,
      revokedByEmail: identity.email || "",
      reason: reason || `Admin role revoked by ${identity.email}`,
    });

    // Log this action
    await ctx.db.insert("adminAuditLog", {
      adminEmail: identity.email || "",
      adminClerkId: identity.subject,
      targetUserId: targetUserId,
      action: "revoked_admin_role",
      reason: `Revoked ${targetRole.role} role from ${targetRole.email}`,
      metadata: { targetEmail: targetRole.email, reason },
      timestamp: Date.now(),
      ipAddress: "N/A",
    });

    return { success: true };
  },
});

/**
 * List all admin roles (active and revoked)
 * Only admins can view this
 */
export const listAdminRoles = query({
  args: {
    includeRevoked: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeRevoked = false }) => {
    // Check if current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentAdminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!currentAdminRole) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get all roles
    let roles = await ctx.db
      .query("adminRoles")
      .withIndex("by_granted_at")
      .order("desc")
      .collect();

    // Filter to active only if requested
    if (!includeRevoked) {
      roles = roles.filter((role) => !role.revokedAt);
    }

    return roles;
  },
});

/**
 * Get admin role for a specific user
 */
export const getAdminRole = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    // Check if current user is admin or checking their own role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUserId = await getAuthenticatedUserId(ctx);
    const isCheckingSelf = userId === currentUserId;

    if (!isCheckingSelf) {
      // Must be admin to check others' roles
      const adminRole = await ctx.db
        .query("adminRoles")
        .withIndex("by_email_active", (q) =>
          q.eq("email", identity.email || "").eq("revokedAt", undefined)
        )
        .first();

      if (!adminRole) {
        throw new Error("Unauthorized: Admin access required");
      }
    }

    // Get the role
    return await ctx.db
      .query("adminRoles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("revokedAt", undefined)
      )
      .first();
  },
});

/**
 * Bootstrap: Create first superadmin
 * IMPORTANT: This should only be called ONCE during initial setup
 * After first superadmin is created, use grantAdminRole mutation
 *
 * Security: This function should be protected or removed in production
 */
export const bootstrapFirstSuperadmin = mutation({
  args: {
    email: v.string(),
    bootstrapSecret: v.string(), // Require a secret to prevent abuse
  },
  handler: async (ctx, { email, bootstrapSecret }) => {
    // Check bootstrap secret (set this in environment variables)
    const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET || "change-me-in-production";

    if (bootstrapSecret !== BOOTSTRAP_SECRET) {
      throw new Error("Invalid bootstrap secret");
    }

    // Check if any superadmins already exist
    const existingSuperadmin = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active")
      .filter((q) =>
        q.and(
          q.eq(q.field("role"), "superadmin"),
          q.eq(q.field("revokedAt"), undefined)
        )
      )
      .first();

    if (existingSuperadmin) {
      throw new Error("Superadmin already exists. Use grantAdminRole mutation instead.");
    }

    // Find the user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Create first superadmin
    await ctx.db.insert("adminRoles", {
      userId: user._id,
      email: user.email,
      role: "superadmin",
      grantedBy: user._id, // Self-granted
      grantedByEmail: email,
      grantedAt: Date.now(),
      reason: "Bootstrap: First superadmin created",
    });

    return { success: true, message: `${email} is now a superadmin` };
  },
});
