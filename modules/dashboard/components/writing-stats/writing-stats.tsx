"use client";

import { BarChart2 } from "lucide-react";

export function WritingStats() {
  // This will be dynamic based on user's writing progress
  // For now, hardcoded to match the design
  const wordCount = 0;
  const goal = 300;
  const percentage = (wordCount / goal) * 100;

  return (
    <div className="px-2 py-3 rounded-md bg-sidebar-accent/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-sidebar-foreground">
            Writing stats
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {wordCount} / {goal}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-sidebar-accent rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Green indicator dot (active writing session) */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-muted-foreground">Active</span>
      </div>
    </div>
  );
}
