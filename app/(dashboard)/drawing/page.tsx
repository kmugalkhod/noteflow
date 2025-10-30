"use client";

import { DrawingCanvas } from "@/components/drawing";

export default function DrawingPage() {
  return (
    <div className="h-full w-full bg-background">
      {/* Full-Screen Standalone Drawing Canvas */}
      <DrawingCanvas readonly={false} />
    </div>
  );
}
