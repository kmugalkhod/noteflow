/**
 * Restore Helpers
 *
 * Utilities for handling smart restore logic and folder path building
 */

import type { Id } from "@/convex/_generated/dataModel";

/**
 * Build full folder path from folder ID
 * This is a placeholder - actual implementation would need to recursively
 * fetch parent folders from the database
 *
 * @param folderId The folder ID
 * @param folderName The folder name
 * @returns Full path string (e.g., "Work > Projects > Q1")
 */
export function buildFolderPath(folderId: Id<"folders">, folderName: string): string {
  // TODO: Implement recursive path building when we have folder hierarchy data
  // For now, just return the folder name
  return folderName;
}

/**
 * Parse folder path from string
 * @param path Path string (e.g., "Work > Projects > Q1")
 * @returns Array of folder names
 */
export function parseFolderPath(path: string): string[] {
  if (!path) return [];
  return path.split(" > ").map((part) => part.trim());
}

/**
 * Get parent folder ID from path
 * This is a helper for restore operations
 *
 * @param fullPath Full folder path
 * @returns Parent folder ID or undefined for root
 */
export function getParentFolderFromPath(fullPath: string | null): string | null {
  if (!fullPath) return null;

  const parts = parseFolderPath(fullPath);
  if (parts.length <= 1) return null;

  // Return the parent (second to last) folder
  return parts[parts.length - 2];
}

/**
 * Determine if a folder exists and is accessible
 * This would typically involve a database query
 *
 * @param folderId The folder ID to check
 * @returns true if folder exists and is not deleted
 */
export function isFolderAccessible(
  folderId: Id<"folders"> | undefined,
  folder: { isDeleted?: boolean } | null
): boolean {
  if (!folderId || !folder) return false;
  return !folder.isDeleted;
}

/**
 * Get restore target folder ID with fallback logic
 * @param deletedFromFolderId Original folder ID
 * @param folderExists Whether the original folder still exists
 * @param restoreToFolderId Optional override folder ID
 * @returns Target folder ID or undefined for root
 */
export function getRestoreTargetFolder(
  deletedFromFolderId: Id<"folders"> | undefined,
  folderExists: boolean,
  restoreToFolderId?: Id<"folders">
): Id<"folders"> | undefined {
  // If user specified a target folder, use it
  if (restoreToFolderId) {
    return restoreToFolderId;
  }

  // If original folder exists, restore there
  if (deletedFromFolderId && folderExists) {
    return deletedFromFolderId;
  }

  // Fallback to root (undefined)
  return undefined;
}

/**
 * Format folder location for display
 * @param folderName Folder name
 * @param folderPath Full folder path
 * @returns Formatted location string
 */
export function formatFolderLocation(
  folderName: string | null | undefined,
  folderPath?: string | null
): string {
  if (!folderName) return "Root";
  return folderPath || folderName;
}

/**
 * Check if restore will be to original location
 * @param targetFolderId Folder where item will be restored
 * @param originalFolderId Original folder before deletion
 * @returns true if restoring to original location
 */
export function isRestoringToOriginal(
  targetFolderId: Id<"folders"> | undefined,
  originalFolderId: Id<"folders"> | undefined
): boolean {
  // Both undefined means both are root
  if (!targetFolderId && !originalFolderId) return true;

  // One is undefined, the other isn't
  if (!targetFolderId || !originalFolderId) return false;

  // Compare IDs
  return targetFolderId === originalFolderId;
}
