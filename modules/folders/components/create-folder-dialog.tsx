"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";
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

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CreateFolderDialog({
  open,
  onOpenChange,
}: CreateFolderDialogProps) {
  const convexUser = useConvexUser();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);
  const [isCreating, setIsCreating] = useState(false);
  const createFolder = useMutation(api.folders.createFolder);

  const handleCreate = async () => {
    if (!name.trim() || !convexUser) return;

    setIsCreating(true);
    try {
      await createFolder({
        userId: convexUser._id,
        name: name.trim(),
        color: selectedColor,
      });

      // Reset form
      setName("");
      setSelectedColor(FOLDER_COLORS[0].value);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isCreating) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setName("");
        setSelectedColor(FOLDER_COLORS[0].value);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a folder to organize your notes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Folder Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleCreate();
                }
              }}
              disabled={isCreating}
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
                  disabled={isCreating}
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
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
