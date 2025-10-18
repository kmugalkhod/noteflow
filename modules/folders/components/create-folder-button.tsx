"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateFolderButtonProps {
  onClick: () => void;
}

export function CreateFolderButton({ onClick }: CreateFolderButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-folder-hover-bg"
    >
      <Plus className="w-4 h-4" />
      New Folder
    </Button>
  );
}
