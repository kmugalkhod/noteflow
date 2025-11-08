import type { Id } from "@/convex/_generated/dataModel";
import {
  validateImageFile,
  quickValidate,
  sanitizeFilename,
  getUserFriendlyError,
  type FileValidationResult,
} from "./fileValidation";

export interface UploadImageOptions {
  file: File;
  noteId?: Id<"notes">;
  onProgress?: (progress: number) => void;
}

export interface UploadImageResult {
  storageId: string;
  url?: string;
  error?: string;
}

/**
 * Upload an image file to Convex FileStorage
 * Returns the storage ID which should be stored in the database
 *
 * NOW WITH COMPREHENSIVE SECURITY VALIDATION:
 * - Magic byte verification
 * - SVG blocking (XSS prevention)
 * - MIME type validation
 * - File size limits
 * - Extension whitelisting
 *
 * @param generateUploadUrl - Convex mutation to generate upload URL
 * @param saveFileMetadata - Convex mutation to save file metadata
 * @param options - Upload options (file, noteId, progress callback)
 * @returns Upload result with storageId or error
 */
export async function uploadImageToConvex(
  generateUploadUrl: () => Promise<string>,
  saveFileMetadata: (params: {
    storageId: string;
    noteId?: Id<"notes">;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => Promise<unknown>,
  options: UploadImageOptions
): Promise<UploadImageResult> {
  const { file, noteId, onProgress } = options;

  try {
    // 1. Quick client-side validation (instant feedback)
    onProgress?.(5);
    const quickCheck = quickValidate(file);
    if (!quickCheck.valid) {
      return {
        storageId: "",
        error: getUserFriendlyError(quickCheck),
      };
    }

    // 2. Comprehensive validation (magic bytes, MIME type, etc.)
    onProgress?.(10);
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      return {
        storageId: "",
        error: getUserFriendlyError(validation),
      };
    }

    // 3. Generate upload URL
    onProgress?.(20);
    const uploadUrl = await generateUploadUrl();

    // 4. Sanitize filename for security
    const safeFileName = sanitizeFilename(file.name);
    onProgress?.(30);

    // 5. Upload file to Convex storage (use detected MIME type)
    const mimeType = validation.mimeType || validation.detectedType || file.type;
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": mimeType },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const { storageId } = await response.json();
    onProgress?.(70);

    // 6. Save file metadata (with sanitized filename and validated type)
    await saveFileMetadata({
      storageId,
      noteId,
      fileName: safeFileName,
      fileSize: file.size,
      fileType: mimeType,
    });

    onProgress?.(100);

    return { storageId };
  } catch (error) {
    console.error("Image upload failed:", error);
    return {
      storageId: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Validate if a string is a Convex storage ID
 * Storage IDs typically start with "kg_" or similar prefix
 */
export function isConvexStorageId(value: string): boolean {
  // Convex storage IDs are typically in format: kg_xxxxxxxxxxxxxxxxxxxxxxxxxx
  return typeof value === "string" && value.startsWith("kg_");
}

/**
 * Validate if a string is a data URL (base64 encoded image)
 */
export function isDataUrl(value: string): boolean {
  return typeof value === "string" && value.startsWith("data:image/");
}

/**
 * Extract file info from a data URL
 */
export function parseDataUrl(dataUrl: string): {
  mimeType: string;
  data: string;
} | null {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;

  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

/**
 * Convert a data URL to a Blob for uploading
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;

  try {
    const response = await fetch(dataUrl);
    return await response.blob();
  } catch (error) {
    console.error("Failed to convert data URL to blob:", error);
    return null;
  }
}
