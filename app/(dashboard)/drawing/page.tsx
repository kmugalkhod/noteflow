"use client";

import { DrawingCanvas } from "@/components/drawing";

export default function DrawingPage() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <DrawingCanvas />
    </div>
  );
}
