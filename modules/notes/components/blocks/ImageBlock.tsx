"use client";

import { useEffect, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Maximize2 } from 'lucide-react';

interface ImageBlockProps {
  content: string;
  placeholder?: string;
  isFocused: boolean;
  properties?: {
    url?: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  onChange: (content: string, element?: HTMLElement) => void;
  onPropertyChange?: (properties: Record<string, any>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const ImageBlock = ({
  content,
  placeholder,
  isFocused,
  properties = {},
  onChange,
  onPropertyChange,
  onKeyDown,
  onFocus,
  onBlur
}: ImageBlockProps) => {
  const [isEditing, setIsEditing] = useState(!properties?.url);
  const [urlInput, setUrlInput] = useState(properties?.url || '');
  const [imageError, setImageError] = useState(false);
  const [showSizeControls, setShowSizeControls] = useState(false);
  const [customWidth, setCustomWidth] = useState(properties?.width?.toString() || '');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when in edit mode
  useEffect(() => {
    if (isEditing && isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, isFocused]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onPropertyChange?.({ url: urlInput.trim(), alt: content || 'Image' });
      setIsEditing(false);
      setImageError(false);
    }
  };

  const handleRemoveImage = () => {
    onPropertyChange?.({ url: '', alt: '', caption: '' });
    setUrlInput('');
    setIsEditing(true);
    setImageError(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSizePreset = (size: 'small' | 'medium' | 'large' | 'full') => {
    const sizes = {
      small: 300,
      medium: 500,
      large: 700,
      full: undefined
    };
    onPropertyChange?.({ ...properties, width: sizes[size], height: undefined });
    setShowSizeControls(false);
  };

  const handleCustomWidth = () => {
    const width = parseInt(customWidth);
    if (!isNaN(width) && width > 0) {
      onPropertyChange?.({ ...properties, width, height: undefined });
      setShowSizeControls(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Implement actual file upload to your storage service
      // For now, create a local preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onPropertyChange?.({ url: dataUrl, alt: file.name });
        setUrlInput(dataUrl);
        setIsEditing(false);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      // In a real implementation, you would upload to a service:
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const { url } = await response.json();
      // onPropertyChange?.({ url, alt: file.name });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a fake input change event
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  if (!properties?.url || isEditing) {
    return (
      <div
        className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-muted-foreground/50 transition-colors"
        onClick={onFocus}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-col items-center gap-2 w-full max-w-md">
            <p className="text-sm text-muted-foreground text-center">
              {isUploading ? 'Uploading...' : 'Add an image'}
            </p>

            {!isUploading && (
              <>
                <div className="flex gap-2 w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUrlSubmit();
                      } else if (onKeyDown) {
                        onKeyDown(e);
                      }
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Paste image URL..."
                    className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    type="button"
                  >
                    Add
                  </button>
                </div>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  <Upload className="w-4 h-4" />
                  Upload from computer
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Or drag and drop an image here (max 5MB)
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative" onClick={onFocus}>
      {imageError ? (
        <div className="p-6 border-2 border-dashed border-destructive/30 rounded-lg bg-destructive/5">
          <div className="flex flex-col items-center gap-2">
            <X className="w-8 h-8 text-destructive" />
            <p className="text-sm text-destructive">Failed to load image</p>
            <p className="text-xs text-muted-foreground break-all">{properties.url}</p>
            <button
              onClick={handleRemoveImage}
              className="mt-2 px-3 py-1 text-xs font-medium text-primary-foreground bg-primary rounded hover:bg-primary/90 transition-colors"
            >
              Change URL
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            src={properties.url}
            alt={properties.alt || content || 'Image'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="max-w-full h-auto rounded-lg"
            style={{
              width: properties.width ? `${properties.width}px` : 'auto',
              height: properties.height ? `${properties.height}px` : 'auto',
            }}
          />

          {/* Hover controls */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizeControls(!showSizeControls);
                }}
                className="p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded hover:bg-accent transition-colors"
                title="Resize image"
                type="button"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Size controls dropdown */}
              {showSizeControls && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-popover border border-border rounded-lg shadow-lg p-2 w-48">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-1">Image Size</div>
                  <div className="space-y-1 mb-2">
                    <button
                      onClick={() => handleSizePreset('small')}
                      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
                      type="button"
                    >
                      Small (300px)
                    </button>
                    <button
                      onClick={() => handleSizePreset('medium')}
                      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
                      type="button"
                    >
                      Medium (500px)
                    </button>
                    <button
                      onClick={() => handleSizePreset('large')}
                      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
                      type="button"
                    >
                      Large (700px)
                    </button>
                    <button
                      onClick={() => handleSizePreset('full')}
                      className="w-full text-left px-2 py-1.5 rounded text-sm hover:bg-accent transition-colors"
                      type="button"
                    >
                      Full Width
                    </button>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="text-xs text-muted-foreground mb-1 px-1">Custom Width (px)</div>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCustomWidth();
                          }
                        }}
                        placeholder="Width"
                        className="flex-1 px-2 py-1 text-xs border border-input rounded bg-background"
                        min="50"
                        max="2000"
                      />
                      <button
                        onClick={handleCustomWidth}
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        type="button"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Remove image"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Caption input */}
      <div className="mt-2">
        <input
          type="text"
          value={content}
          onChange={(e) => onChange(e.target.value, e.target)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Add a caption (optional)"
          className="w-full text-sm text-muted-foreground text-center border-none outline-none bg-transparent placeholder:text-muted-foreground/50 py-1"
        />
      </div>
    </div>
  );
};
