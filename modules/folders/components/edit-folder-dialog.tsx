"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Folder } from "lucide-react";

interface EditFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: Id<"folders"> | null;
  currentName: string;
  currentColor?: string;
}

const FOLDER_COLORS = [
  { name: "Default", value: "#9333ea" }, // Purple
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
];

export function EditFolderDialog({
  open,
  onOpenChange,
  folderId,
  currentName,
  currentColor,
}: EditFolderDialogProps) {
  const [name, setName] = useState(currentName);
  const [selectedColor, setSelectedColor] = useState(
    currentColor || FOLDER_COLORS[0].value
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const updateFolder = useMutation(api.folders.updateFolder);

  // Update local state when props change
  useEffect(() => {
    setName(currentName);
    setSelectedColor(currentColor || FOLDER_COLORS[0].value);
  }, [currentName, currentColor, open]);

  const handleUpdate = async () => {
    if (!name.trim() || !folderId) return;

    setIsUpdating(true);
    try {
      await updateFolder({
        folderId,
        name: name.trim(),
        color: selectedColor,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update folder:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUpdating) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Update your folder name and color.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Folder Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Folder Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleUpdate();
                }
              }}
              disabled={isUpdating}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="grid gap-2">
            <Label>Folder Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  disabled={isUpdating}
                  className={`
                    flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 transition-all
                    ${
                      selectedColor === color.value
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={color.name}
                >
                  <Folder
                    className="w-5 h-5"
                    style={{ color: color.value }}
                    fill={selectedColor === color.value ? color.value : "none"}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!name.trim() || isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
