/**
 * Rate Limiting System for Convex
 *
 * Protects public endpoints from abuse by implementing:
 * - Time-window based rate limiting
 * - Identifier-based throttling (shareId, IP, userId)
 * - Automatic cleanup of expired records
 * - Violation logging for security monitoring
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";

/**
 * Rate limit configuration
 * Adjust these based on your needs and traffic patterns
 */
export const RATE_LIMITS = {
  // Public share view increment: 10 requests per minute per shareId
  shareView: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // Public share read: 30 requests per minute per shareId
  shareRead: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  // Default limit for other operations
  default: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Check if an action should be rate limited
 * Returns true if rate limit exceeded, false if allowed
 */
export const checkRateLimit = mutation({
  args: {
    identifier: v.string(), // e.g., shareId, IP address, userId
    action: v.string(), // e.g., "shareView", "shareRead"
  },
  handler: async (ctx, { identifier, action }) => {
    const now = Date.now();

    // Get rate limit config for this action
    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;

    // Find existing rate limit record
    const rateLimitRecord = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", identifier).eq("action", action)
      )
      .first();

    // If no record exists, create one and allow the request
    if (!rateLimitRecord) {
      await ctx.db.insert("rateLimits", {
        identifier,
        action,
        count: 1,
        windowStart: now,
        windowEnd: now + limit.windowMs,
        lastRequestAt: now,
      });
      return { allowed: true, remaining: limit.maxRequests - 1 };
    }

    // Check if current window has expired
    if (now > rateLimitRecord.windowEnd) {
      // Window expired, reset counter
      await ctx.db.patch(rateLimitRecord._id, {
        count: 1,
        windowStart: now,
        windowEnd: now + limit.windowMs,
        lastRequestAt: now,
      });
      return { allowed: true, remaining: limit.maxRequests - 1 };
    }

    // Check if limit exceeded
    if (rateLimitRecord.count >= limit.maxRequests) {
      // Rate limit exceeded
      await ctx.db.patch(rateLimitRecord._id, {
        lastRequestAt: now,
        violationCount: (rateLimitRecord.violationCount || 0) + 1,
      });

      // Log the violation
      await ctx.db.insert("rateLimitViolations", {
        identifier,
        action,
        timestamp: now,
        attemptedCount: rateLimitRecord.count + 1,
        limit: limit.maxRequests,
        windowMs: limit.windowMs,
      });

      return {
        allowed: false,
        remaining: 0,
        retryAfter: rateLimitRecord.windowEnd - now,
      };
    }

    // Increment counter and allow
    await ctx.db.patch(rateLimitRecord._id, {
      count: rateLimitRecord.count + 1,
      lastRequestAt: now,
    });

    return {
      allowed: true,
      remaining: limit.maxRequests - rateLimitRecord.count - 1,
    };
  },
});

/**
 * Simplified rate limit check that throws error if exceeded
 * Use this in mutations for automatic error handling
 */
export async function enforceRateLimit(
  ctx: MutationCtx,
  identifier: string,
  action: string
): Promise<void> {
  const now = Date.now();
  const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;

  const rateLimitRecord = await ctx.db
    .query("rateLimits")
    .withIndex("by_identifier_action", (q) =>
      q.eq("identifier", identifier).eq("action", action)
    )
    .first();

  if (!rateLimitRecord) {
    await ctx.db.insert("rateLimits", {
      identifier,
      action,
      count: 1,
      windowStart: now,
      windowEnd: now + limit.windowMs,
      lastRequestAt: now,
    });
    return;
  }

  if (now > rateLimitRecord.windowEnd) {
    await ctx.db.patch(rateLimitRecord._id, {
      count: 1,
      windowStart: now,
      windowEnd: now + limit.windowMs,
      lastRequestAt: now,
    });
    return;
  }

  if (rateLimitRecord.count >= limit.maxRequests) {
    await ctx.db.patch(rateLimitRecord._id, {
      lastRequestAt: now,
      violationCount: (rateLimitRecord.violationCount || 0) + 1,
    });

    await ctx.db.insert("rateLimitViolations", {
      identifier,
      action,
      timestamp: now,
      attemptedCount: rateLimitRecord.count + 1,
      limit: limit.maxRequests,
      windowMs: limit.windowMs,
    });

    const retryAfterSeconds = Math.ceil((rateLimitRecord.windowEnd - now) / 1000);
    throw new Error(
      `Rate limit exceeded. Too many requests. Please try again in ${retryAfterSeconds} seconds.`
    );
  }

  await ctx.db.patch(rateLimitRecord._id, {
    count: rateLimitRecord.count + 1,
    lastRequestAt: now,
  });
}

/**
 * Get rate limit status for an identifier
 * Useful for displaying "X requests remaining" to users
 */
export const getRateLimitStatus = query({
  args: {
    identifier: v.string(),
    action: v.string(),
  },
  handler: async (ctx, { identifier, action }) => {
    const now = Date.now();
    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;

    const record = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", identifier).eq("action", action)
      )
      .first();

    if (!record || now > record.windowEnd) {
      return {
        allowed: true,
        remaining: limit.maxRequests,
        resetAt: now + limit.windowMs,
      };
    }

    return {
      allowed: record.count < limit.maxRequests,
      remaining: Math.max(0, limit.maxRequests - record.count),
      resetAt: record.windowEnd,
      currentCount: record.count,
    };
  },
});

/**
 * Get rate limit violations for monitoring
 * Admin only - shows abuse patterns
 */
export const getViolations = query({
  args: {
    identifier: v.optional(v.string()),
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { identifier, action, limit = 100 }) => {
    // Check admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const adminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!adminRole) {
      throw new Error("Unauthorized - admin access only");
    }

    // Get violations
    let query = ctx.db.query("rateLimitViolations");

    // Apply filters if provided
    const violations = await query.order("desc").take(limit);

    // Filter in memory if needed
    let filtered = violations;
    if (identifier) {
      filtered = filtered.filter((v) => v.identifier === identifier);
    }
    if (action) {
      filtered = filtered.filter((v) => v.action === action);
    }

    return filtered;
  },
});

/**
 * Cleanup expired rate limit records
 * Should be called periodically via cron job
 */
export const cleanupExpiredRecords = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const ONE_HOUR_AGO = now - 60 * 60 * 1000;

    // Delete rate limit records older than 1 hour
    const expiredRecords = await ctx.db
      .query("rateLimits")
      .filter((q) => q.lt(q.field("windowEnd"), ONE_HOUR_AGO))
      .collect();

    for (const record of expiredRecords) {
      await ctx.db.delete(record._id);
    }

    // Delete violation records older than 7 days (keep for security review)
    const SEVEN_DAYS_AGO = now - 7 * 24 * 60 * 60 * 1000;
    const oldViolations = await ctx.db
      .query("rateLimitViolations")
      .filter((q) => q.lt(q.field("timestamp"), SEVEN_DAYS_AGO))
      .collect();

    for (const violation of oldViolations) {
      await ctx.db.delete(violation._id);
    }

    return {
      deletedRecords: expiredRecords.length,
      deletedViolations: oldViolations.length,
    };
  },
});

/**
 * Reset rate limit for a specific identifier
 * Admin only - use for debugging or whitelisting
 */
export const resetRateLimit = mutation({
  args: {
    identifier: v.string(),
    action: v.string(),
  },
  handler: async (ctx, { identifier, action }) => {
    // Check admin access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const adminRole = await ctx.db
      .query("adminRoles")
      .withIndex("by_email_active", (q) =>
        q.eq("email", identity.email || "").eq("revokedAt", undefined)
      )
      .first();

    if (!adminRole) {
      throw new Error("Unauthorized - admin access only");
    }

    // Find and delete the rate limit record
    const record = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier_action", (q) =>
        q.eq("identifier", identifier).eq("action", action)
      )
      .first();

    if (record) {
      await ctx.db.delete(record._id);
      return { success: true, message: "Rate limit reset" };
    }

    return { success: false, message: "No rate limit record found" };
  },
});
