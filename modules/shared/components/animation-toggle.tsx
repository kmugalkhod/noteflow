"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnimationState } from "../hooks/use-animation-state";
import { cn } from "@/lib/utils";

/**
 * Animation Toggle Component
 *
 * Allows users to toggle animations on/off manually.
 * Shows current animation state and system preference.
 */
export function AnimationToggle() {
  try {
    const { animationsEnabled, setUserPreference } = useAnimationState();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label="Animation settings"
            title="Toggle animations"
          >
            <Sparkles
              className={cn(
                "w-4 h-4 transition-all duration-200",
                animationsEnabled ? "text-primary" : "text-muted-foreground"
              )}
            />
            {!animationsEnabled && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute w-5 h-0.5 bg-muted-foreground rotate-45" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Animations
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setUserPreference(null)}
            className="flex items-center justify-between"
          >
            <span>System Default</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setUserPreference(false)}
            className="flex items-center justify-between"
          >
            <span>Always On</span>
            {animationsEnabled && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setUserPreference(true)}
            className="flex items-center justify-between"
          >
            <span>Always Off</span>
            {!animationsEnabled && (
              <span className="text-xs text-primary">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Status: {animationsEnabled ? "Enabled" : "Disabled"}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } catch (error) {
    console.error("AnimationToggle error:", error);
    return null;
  }
}
