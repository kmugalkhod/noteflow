"use client";

import { DrawingCanvas } from "@/components/drawing";
import { AuthGuard } from "@/modules/auth/components/auth-guard";

export default function DrawingPage() {
  return (
    <AuthGuard>
      <div className="h-screen w-screen bg-background overflow-hidden">
        {/* Full-Screen Standalone Drawing Canvas */}
        <DrawingCanvas readonly={false} />
      </div>
    </AuthGuard>
  );
}
