import type { Id } from "@/convex/_generated/dataModel";

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
  }) => Promise<void>,
  options: UploadImageOptions
): Promise<UploadImageResult> {
  const { file, noteId, onProgress } = options;

  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { storageId: "", error: "Please select an image file" };
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return { storageId: "", error: "Image size must be less than 5MB" };
    }

    // Step 1: Generate upload URL
    onProgress?.(10);
    const uploadUrl = await generateUploadUrl();

    // Step 2: Upload file to Convex storage
    onProgress?.(30);
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const { storageId } = await response.json();
    onProgress?.(70);

    // Step 3: Save file metadata
    await saveFileMetadata({
      storageId,
      noteId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
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
