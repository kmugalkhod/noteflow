"use client";

import { DrawingCanvas } from "@/components/drawing";

export default function DrawingPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <DrawingCanvas />
    </div>
  );
}
