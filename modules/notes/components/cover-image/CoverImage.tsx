"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  coverImage?: string;
  onCoverChange: (url: string | undefined) => void;
  editable?: boolean;
}

export function CoverImage({ coverImage, onCoverChange, editable = true }: CoverImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    // Convert to data URL (in production, you'd upload to a storage service)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onCoverChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    onCoverChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!coverImage && !editable) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-200",
        coverImage ? "h-[260px]" : "h-[160px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {coverImage ? (
        <>
          {/* Cover Image */}
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage})` }}
          />

          {/* Hover Overlay with Actions */}
          {editable && isHovered && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-all duration-200">
              <Button
                onClick={handleUploadClick}
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Change cover
              </Button>
              <Button
                onClick={handleRemoveCover}
                variant="secondary"
                size="sm"
                className="gap-2 shadow-lg"
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
            onClick={handleUploadClick}
            className="w-full h-full bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm font-medium">Add a cover image</span>
              <span className="text-xs text-muted-foreground/70">
                Click to upload (max 5MB)
              </span>
            </div>
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
