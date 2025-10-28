import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get the authenticated user's Convex ID from the authentication context
 * This ensures the user is authenticated via Clerk
 */
export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  // Get the user identity from Clerk via Convex auth
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthenticated");
  }

  // Get the Clerk user ID from the identity
  const clerkUserId = identity.subject;

  // Find the user in our database
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user) {
    throw new Error("User not found");
  }

  return user._id;
}

/**
 * Verify that the authenticated user owns the specified note
 * Throws an error if unauthorized
 */
export async function verifyNoteOwnership(
  ctx: QueryCtx | MutationCtx,
  noteId: Id<"notes">,
  userId: Id<"users">
): Promise<void> {
  const note = await ctx.db.get(noteId);

  if (!note) {
    throw new Error("Note not found");
  }

  if (note.userId !== userId) {
    throw new Error("Unauthorized: You don't have permission to access this note");
  }
}

/**
 * Verify that the authenticated user owns the specified folder
 * Throws an error if unauthorized
 */
export async function verifyFolderOwnership(
  ctx: QueryCtx | MutationCtx,
  folderId: Id<"folders">,
  userId: Id<"users">
): Promise<void> {
  const folder = await ctx.db.get(folderId);

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.userId !== userId) {
    throw new Error("Unauthorized: You don't have permission to access this folder");
  }
}

/**
 * Get authenticated user ID or return null if not authenticated
 * Use this for optional authentication scenarios
 */
export async function getAuthenticatedUserIdOrNull(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  try {
    return await getAuthenticatedUserId(ctx);
  } catch {
    return null;
  }
}
