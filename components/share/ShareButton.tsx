"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareDialog } from "./ShareDialog";
import { Id } from "@/convex/_generated/dataModel";

interface ShareButtonProps {
  noteId: Id<"notes">;
  noteTitle?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  className?: string;
  disabled?: boolean;
}

export function ShareButton({
  noteId,
  noteTitle,
  variant = "ghost",
  size = "icon-sm",
  className,
  disabled,
}: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={className}
              disabled={disabled}
              onClick={() => setDialogOpen(true)}
              aria-label="Share note"
            >
              <Share2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share note</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ShareDialog
        noteId={noteId}
        noteTitle={noteTitle}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
