# Quickstart Guide: Drawing Feature Implementation

**Feature**: 006-excalidraw-drawing-feature
**Date**: 2025-10-29
**Estimated Time**: 10-15 days

## Overview

This guide provides step-by-step instructions for implementing the drawing feature using tldraw in the NoteFlow application.

---

## Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] Access to Convex dashboard
- [x] Familiarity with React 19 and Next.js 15
- [x] Understanding of Convex queries/mutations
- [ ] tldraw documentation reviewed

---

## Phase 1: Foundation Setup (Days 1-3)

### Day 1: Install Dependencies

#### 1.1 Install tldraw

```bash
npm install tldraw lz-string
```

#### 1.2 Install Testing Framework

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

#### 1.3 Create Vitest Configuration

Create `/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

Create `/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

#### 1.4 Update package.json

Add test script:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 1.5 Verify Installation

```bash
npm test
```

---

### Day 2: Database Schema

#### 2.1 Update Convex Schema

Edit `/convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...

  drawings: defineTable({
    noteId: v.id("notes"),
    userId: v.id("users"),
    data: v.string(),
    version: v.number(),
    sizeBytes: v.number(),
    elementCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    isDeleted: v.optional(v.boolean()),
  })
    .index("by_note", ["noteId"])
    .index("by_user", ["userId"])
    .index("by_note_user", ["noteId", "userId"]),

  // Update notes table
  notes: defineTable({
    // ... existing fields ...
    hasDrawing: v.optional(v.boolean()),
  })
    // ... existing indexes ...
});
```

#### 2.2 Deploy Schema

```bash
npx convex dev
```

Wait for schema to deploy. Verify in Convex dashboard that `drawings` table exists.

---

### Day 3: Create Convex Functions

#### 3.1 Create `/convex/drawings.ts`

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

// Helper: Get authenticated user ID
async function getUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Must be logged in",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "User not found",
    });
  }

  return user._id;
}

// Helper: Validate drawing size
function validateDrawingSize(data: string): number {
  const sizeBytes = new Blob([data]).size;

  if (sizeBytes > 500_000) {
    throw new ConvexError({
      code: "DRAWING_TOO_LARGE",
      message: `Drawing size (${sizeBytes} bytes) exceeds 500 KB limit`,
    });
  }

  return sizeBytes;
}

// QUERY: Get drawing by note ID
export const getDrawingByNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db
      .query("drawings")
      .withIndex("by_note_user", (q) =>
        q.eq("noteId", noteId).eq("userId", userId)
      )
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .first();

    return drawing;
  },
});

// MUTATION: Create drawing
export const createDrawing = mutation({
  args: {
    noteId: v.id("notes"),
    data: v.string(),
  },
  handler: async (ctx, { noteId, data }) => {
    const userId = await getUserId(ctx);

    // Verify note ownership
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Note not found or access denied",
      });
    }

    // Check if drawing already exists
    const existing = await ctx.db
      .query("drawings")
      .withIndex("by_note", (q) => q.eq("noteId", noteId))
      .first();

    if (existing && !existing.isDeleted) {
      throw new ConvexError({
        code: "DRAWING_EXISTS",
        message: "Note already has a drawing",
      });
    }

    // Validate size
    const sizeBytes = validateDrawingSize(data);

    // Create drawing
    const drawingId = await ctx.db.insert("drawings", {
      noteId,
      userId,
      data,
      version: 1,
      sizeBytes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update note
    await ctx.db.patch(noteId, { hasDrawing: true });

    return { drawingId };
  },
});

// MUTATION: Update drawing
export const updateDrawing = mutation({
  args: {
    drawingId: v.id("drawings"),
    data: v.string(),
  },
  handler: async (ctx, { drawingId, data }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db.get(drawingId);
    if (!drawing || drawing.userId !== userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Drawing not found or access denied",
      });
    }

    if (drawing.isDeleted) {
      throw new ConvexError({
        code: "DRAWING_DELETED",
        message: "Cannot update deleted drawing",
      });
    }

    const sizeBytes = validateDrawingSize(data);

    await ctx.db.patch(drawingId, {
      data,
      sizeBytes,
      updatedAt: Date.now(),
    });
  },
});

// MUTATION: Delete drawing (soft delete)
export const deleteDrawing = mutation({
  args: { drawingId: v.id("drawings") },
  handler: async (ctx, { drawingId }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db.get(drawingId);
    if (!drawing || drawing.userId !== userId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Drawing not found or access denied",
      });
    }

    await ctx.db.patch(drawingId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    // Update note
    await ctx.db.patch(drawing.noteId, { hasDrawing: false });
  },
});
```

#### 3.2 Test Convex Functions

```bash
npx convex dev
```

Open Convex dashboard, go to Functions tab, and manually test:
1. Create a drawing
2. Query the drawing
3. Update the drawing
4. Delete the drawing

---

## Phase 2: Core Components (Days 4-6)

### Day 4: Create Utility Functions

#### 4.1 Create `/lib/drawingUtils.ts`

```typescript
import LZString from 'lz-string';
import type { TLStoreSnapshot } from 'tldraw';

export function compressDrawing(snapshot: TLStoreSnapshot): string {
  const json = JSON.stringify(snapshot);
  return LZString.compressToUTF16(json);
}

export function decompressDrawing(data: string): TLStoreSnapshot {
  const json = LZString.decompressFromUTF16(data);
  if (!json) {
    throw new Error('Failed to decompress drawing data');
  }
  return JSON.parse(json);
}

export function getDrawingSize(data: string): number {
  return new Blob([data]).size;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

---

### Day 5: Create DrawingCanvas Component

#### 5.1 Create `/components/drawing/DrawingCanvas.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebounce } from "@/modules/shared/hooks/use-debounce";
import { compressDrawing, decompressDrawing } from "@/lib/drawingUtils";
import { toast } from "@/modules/shared/lib/toast";
import type { Editor, TLStoreSnapshot } from "tldraw";
import "tldraw/tldraw.css";

// Dynamic import (no SSR)
const Tldraw = dynamic(
  async () => (await import("tldraw")).Tldraw,
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

interface DrawingCanvasProps {
  noteId: Id<"notes">;
  drawingId?: Id<"drawings">;
  readonly?: boolean;
}

export function DrawingCanvas({ noteId, drawingId, readonly = false }: DrawingCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [snapshot, setSnapshot] = useState<TLStoreSnapshot | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDrawingId, setCurrentDrawingId] = useState(drawingId);

  const debouncedSnapshot = useDebounce(snapshot, 1500);

  const drawing = useQuery(
    api.drawings.getDrawingByNote,
    currentDrawingId ? "skip" : { noteId }
  );

  const createDrawing = useMutation(api.drawings.createDrawing);
  const updateDrawing = useMutation(api.drawings.updateDrawing);

  // Load existing drawing
  useEffect(() => {
    if (drawing?.data && !snapshot) {
      try {
        const decompressed = decompressDrawing(drawing.data);
        setSnapshot(decompressed);
        setCurrentDrawingId(drawing._id);
      } catch (error) {
        console.error("Failed to load drawing:", error);
        toast.error("Failed to load drawing");
      }
    }
  }, [drawing]);

  // Auto-save
  useEffect(() => {
    if (!debouncedSnapshot || readonly || !editor) return;

    const saveDrawing = async () => {
      setIsSaving(true);

      try {
        const compressed = compressDrawing(debouncedSnapshot);

        if (!currentDrawingId) {
          // Create new
          const { drawingId: newId } = await createDrawing({
            noteId,
            data: compressed,
          });
          setCurrentDrawingId(newId);
          toast.success("Drawing created");
        } else {
          // Update existing
          await updateDrawing({
            drawingId: currentDrawingId,
            data: compressed,
          });
        }
      } catch (error: any) {
        console.error("Save failed:", error);
        toast.error(error.data?.message || "Failed to save drawing");
      } finally {
        setIsSaving(false);
      }
    };

    saveDrawing();
  }, [debouncedSnapshot]);

  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
      <Tldraw
        snapshot={snapshot}
        onMount={(editor) => {
          setEditor(editor);

          // Listen to changes
          editor.store.listen(() => {
            const newSnapshot = editor.store.getSnapshot();
            setSnapshot(newSnapshot);
          });
        }}
      />

      {/* Save indicator */}
      {isSaving && (
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border text-sm">
          Saving...
        </div>
      )}
    </div>
  );
}
```

---

### Day 6: Integrate into Note Editor

#### 6.1 Modify `/modules/notes/components/note-editor/note-editor.tsx`

Add the drawing section after the rich editor:

```typescript
import { DrawingCanvas } from "@/components/drawing/DrawingCanvas";

export function NoteEditor({ noteId }: NoteEditorProps) {
  // ... existing code ...

  return (
    <div className="h-full flex flex-col bg-editor-bg animate-fade-in">
      {/* Existing: Action Buttons */}
      {/* Existing: Cover Image */}
      {/* Existing: Title and Content */}

      {/* NEW: Drawing Section */}
      <div className="flex-1 overflow-auto px-8 py-12 w-full max-w-4xl mx-auto">
        {/* ... existing editor content ... */}

        {/* Add Drawing */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">Drawing</h3>
          <DrawingCanvas noteId={noteId} />
        </div>
      </div>

      {/* Existing: Auto-save indicator */}
    </div>
  );
}
```

#### 6.2 Test Basic Functionality

1. Start dev server: `npm run dev`
2. Open a note
3. Verify drawing canvas appears
4. Draw something
5. Wait 1.5 seconds
6. Check Convex dashboard that drawing was saved
7. Refresh page - drawing should reload

---

## Phase 3: Features & UX (Days 7-10)

### Day 7: Export Functionality

#### 7.1 Create `/components/drawing/DrawingExportMenu.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, Copy, FileImage, FileCode } from "lucide-react";
import type { Editor } from "tldraw";
import { toast } from "@/modules/shared/lib/toast";

interface DrawingExportMenuProps {
  editor: Editor | null;
}

export function DrawingExportMenu({ editor }: DrawingExportMenuProps) {
  if (!editor) return null;

  const exportAsPNG = async () => {
    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      const blob = await editor.getSvgAsImage(Array.from(shapeIds), {
        type: "png",
        quality: 1,
        scale: 2,
      });

      if (!blob) throw new Error("Failed to generate image");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drawing-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Exported as PNG");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const exportAsSVG = async () => {
    try {
      const shapeIds = editor.getCurrentPageShapeIds();
      const svg = await editor.getSvgString(Array.from(shapeIds));

      if (!svg) throw new Error("Failed to generate SVG");

      const blob = new Blob([svg.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `drawing-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Exported as SVG");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const copyToClipboard = async () => {
    try {
      await editor.putContentOntoClipboard({
        point: editor.getViewportPageCenter(),
        formats: ["png"],
      });

      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Copy failed");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsPNG}>
          <FileImage className="w-4 h-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsSVG}>
          <FileCode className="w-4 h-4 mr-2" />
          Export as SVG
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="w-4 h-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 7.2 Add to DrawingCanvas

```typescript
import { DrawingExportMenu } from "./DrawingExportMenu";

// Inside DrawingCanvas component
return (
  <div className="relative">
    <Tldraw ... />

    {/* Export menu */}
    <div className="absolute top-4 right-4 z-10">
      <DrawingExportMenu editor={editor} />
    </div>
  </div>
);
```

---

### Days 8-10: Polish & Testing

- Add loading states
- Error boundaries
- Mobile responsive design
- Keyboard shortcuts
- Write component tests
- Write integration tests
- Performance monitoring

---

## Phase 4: Testing & Deployment (Days 11-13)

### Test Checklist

- [ ] Unit tests for utility functions
- [ ] Component tests for DrawingCanvas
- [ ] Integration tests for Convex functions
- [ ] Manual testing: create, edit, save, export
- [ ] Test error scenarios (size limits, network errors)
- [ ] Test mobile responsiveness
- [ ] Performance testing (large canvases)

### Deployment

```bash
# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build

# Deploy to Convex
npx convex deploy

# Deploy to Vercel/hosting
vercel deploy --prod
```

---

## Troubleshooting

### Common Issues

**Issue**: tldraw not rendering
- **Solution**: Ensure dynamic import with `ssr: false`
- Check that `tldraw/tldraw.css` is imported

**Issue**: Auto-save not working
- **Solution**: Verify debounce hook is working
- Check Convex function logs in dashboard
- Ensure user is authenticated

**Issue**: Drawing data too large error
- **Solution**: Check compression is applied
- Verify size validation in mutation
- Ask user to simplify drawing

---

## Next Steps

After completing basic implementation:

1. Add drawing templates (optional)
2. Implement drawing versioning (optional)
3. Add collaborative editing (future)
4. Analytics and usage tracking
5. Performance optimizations

---

## Resources

- [tldraw Documentation](https://tldraw.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vitest Documentation](https://vitest.dev/)
- Project specs: `specs/006-excalidraw-drawing-feature/`

---

## Support

For issues or questions:
1. Check this guide
2. Review contracts in `/contracts/`
3. Check tldraw docs
4. Review Convex docs
5. Open team discussion

---

**Happy coding! 🎨**
