"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Simple Animation Toggle - Just a visible button for now
 * This is a simplified version for debugging
 */
export function AnimationToggleSimple() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="relative"
      aria-label="Animation settings"
      title="Toggle animations"
      onClick={() => alert("Animation toggle clicked!")}
    >
      <Sparkles className="w-4 h-4 text-primary" />
    </Button>
  );
}
