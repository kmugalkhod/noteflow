"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadImageToConvex } from "@/lib/imageUpload";
import { toast } from "@/modules/shared/lib/toast";

interface CoverImageProps {
  coverImage?: string; // Now expects storage ID, but component will handle URL resolution
  coverImageUrl?: string; // Actual URL for display (resolved by parent)
  noteId?: Id<"notes">; // Need noteId for file metadata
  onCoverChange: (storageId: string | undefined) => void;
  editable?: boolean;
}

export function CoverImage({ coverImage, coverImageUrl, noteId, onCoverChange, editable = true }: CoverImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Local preview during upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex mutations
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);

  // Clear preview URL when server URL becomes available
  useEffect(() => {
    if (coverImageUrl && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [coverImageUrl, previewUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview URL immediately
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Start upload
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImageToConvex(
        generateUploadUrl,
        saveFileMetadata,
        {
          file,
          noteId,
          onProgress: (progress) => setUploadProgress(progress),
        }
      );

      if (result.error) {
        toast.error("Upload failed", result.error);
        setIsUploading(false);
        setPreviewUrl(null); // Clear preview on error
        URL.revokeObjectURL(localPreviewUrl); // Clean up
        return;
      }

      // Pass storage ID to parent
      onCoverChange(result.storageId);
      toast.success("Cover image uploaded successfully");

      // Keep preview until server URL is available (will be cleared when coverImageUrl updates)
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed", "Failed to upload cover image");
      setPreviewUrl(null); // Clear preview on error
      URL.revokeObjectURL(localPreviewUrl); // Clean up
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveCover = () => {
    onCoverChange(undefined);
    setPreviewUrl(null); // Clear any preview
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Use preview URL as fallback while waiting for server URL
  const displayUrl = coverImageUrl || previewUrl;

  if (!displayUrl && !editable) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-200",
        displayUrl ? "h-[260px]" : "h-[160px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayUrl ? (
        <>
          {/* Cover Image */}
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${displayUrl})` }}
          >
            {/* Show upload progress overlay if uploading */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="mb-2">Uploading...</div>
                  <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hover Overlay with Actions */}
          {editable && isHovered && !isUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-all duration-200">
              <Button
                onClick={handleUploadClick}
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
                disabled={isUploading}
              >
                <Upload className="w-4 h-4" />
                Change cover
              </Button>
              <Button
                onClick={handleRemoveCover}
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          )}
        </>
      ) : (
        // Empty state - Add Cover button
        editable && (
          <div
            onClick={isUploading ? undefined : handleUploadClick}
            className={cn(
              "w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center transition-all duration-200 group",
              isUploading ? "cursor-wait opacity-50" : "cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Uploading...</span>
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm font-medium">Add a cover image</span>
                <span className="text-xs text-muted-foreground/70">
                  Click to upload (max 5MB)
                </span>
              </div>
            )}
          </div>
        )
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
