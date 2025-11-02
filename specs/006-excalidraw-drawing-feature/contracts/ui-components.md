# UI Components Contract: Drawing Feature

**Feature**: 006-excalidraw-drawing-feature
**Date**: 2025-10-29
**Framework**: React 19.1.0 + Next.js 15.5.5

## Overview

This document defines the React components for the drawing feature, including props, behavior, and integration points.

---

## Component Hierarchy

```
NoteEditor (MODIFIED)
└── DrawingSection
    ├── DrawingToggle (collapsed state)
    └── DrawingCanvas (expanded state)
        ├── Tldraw (third-party)
        ├── DrawingToolbar (optional override)
        └── DrawingExportMenu
```

---

## Components

### 1. DrawingSection

Container component that manages drawing UI state within the note editor.

#### File

`/modules/notes/components/note-editor/DrawingSection.tsx`

#### Props

```typescript
interface DrawingSectionProps {
  noteId: Id<"notes">;
  initialExpanded?: boolean;
}
```

#### State

```typescript
interface DrawingSectionState {
  isExpanded: boolean;        // Canvas visible or collapsed
  isLoading: boolean;         // Loading drawing data
  hasUnsavedChanges: boolean; // Dirty flag for confirmation
}
```

#### Behavior

1. **Initial Load**:
   - Query for existing drawing using `getDrawingByNote`
   - Show loading skeleton while fetching
   - If no drawing exists, show "Add Drawing" button

2. **Toggle Expansion**:
   - Click "Add Drawing" → Expand and create empty canvas
   - Click "Collapse" → Minimize to thumbnail/preview
   - If unsaved changes, show confirmation dialog

3. **Responsive**:
   - Desktop: Full-width canvas below content
   - Tablet: Full-width, scrollable
   - Mobile: View-only mode with message

#### Example

```typescript
export function DrawingSection({ noteId, initialExpanded = false }: DrawingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const drawing = useQuery(api.drawings.getDrawingByNote, { noteId });

  if (!drawing && !isExpanded) {
    return (
      <Button onClick={() => setIsExpanded(true)}>
        <PlusIcon /> Add Drawing
      </Button>
    );
  }

  return (
    <div className="drawing-section">
      {isExpanded ? (
        <DrawingCanvas noteId={noteId} drawingId={drawing?._id} />
      ) : (
        <DrawingToggle onClick={() => setIsExpanded(true)} />
      )}
    </div>
  );
}
```

---

### 2. DrawingCanvas

Main canvas component wrapping tldraw library.

#### File

`/components/drawing/DrawingCanvas.tsx`

#### Props

```typescript
interface DrawingCanvasProps {
  noteId: Id<"notes">;
  drawingId?: Id<"drawings">; // Undefined for new drawings
  className?: string;
  readonly?: boolean;          // View-only mode
  onSave?: (snapshot: TLStoreSnapshot) => void;
  onError?: (error: Error) => void;
}
```

#### State

```typescript
interface DrawingCanvasState {
  snapshot: TLStoreSnapshot | null;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}
```

#### Behavior

1. **Load Drawing**:
   - If `drawingId` provided, fetch and decompress data
   - Initialize tldraw with loaded snapshot
   - Show loading state during fetch

2. **Auto-Save**:
   - Debounce changes (1.5s delay)
   - Compress snapshot before saving
   - Show "Saving..." / "Saved" indicator
   - Handle errors gracefully (toast notification)

3. **New Drawing**:
   - If no `drawingId`, start with empty canvas
   - On first change, call `createDrawing` mutation
   - Subsequent changes use `updateDrawing`

4. **Readonly Mode**:
   - Disable all editing tools
   - Show "View Only" badge
   - Allow zoom/pan only

#### Example

```typescript
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/useDebounce";

// Dynamic import (no SSR)
const Tldraw = dynamic(
  () => import("tldraw").then((mod) => mod.Tldraw),
  { ssr: false, loading: () => <Skeleton /> }
);

export function DrawingCanvas({ noteId, drawingId, readonly = false }: DrawingCanvasProps) {
  const [snapshot, setSnapshot] = useState<TLStoreSnapshot | null>(null);
  const debouncedSnapshot = useDebounce(snapshot, 1500);

  const drawing = useQuery(api.drawings.getDrawing, drawingId ? { drawingId } : "skip");
  const createDrawing = useMutation(api.drawings.createDrawing);
  const updateDrawing = useMutation(api.drawings.updateDrawing);

  // Load initial data
  useEffect(() => {
    if (drawing?.data) {
      const decompressed = decompressDrawing(drawing.data);
      setSnapshot(decompressed);
    }
  }, [drawing]);

  // Auto-save logic
  useEffect(() => {
    if (!debouncedSnapshot || readonly) return;

    const compressed = compressDrawing(debouncedSnapshot);

    if (!drawingId) {
      // Create new drawing
      createDrawing({ noteId, data: compressed })
        .then(({ drawingId: newId }) => {
          console.log("Drawing created:", newId);
        })
        .catch(handleError);
    } else {
      // Update existing
      updateDrawing({ drawingId, data: compressed })
        .catch(handleError);
    }
  }, [debouncedSnapshot]);

  return (
    <div className="drawing-canvas-container">
      <Tldraw
        snapshot={snapshot}
        onMount={(editor) => {
          editor.store.listen((change) => {
            const newSnapshot = editor.store.getSnapshot();
            setSnapshot(newSnapshot);
          });
        }}
        // ... other tldraw props
      />
      <DrawingExportMenu drawingId={drawingId} />
    </div>
  );
}
```

---

### 3. DrawingExportMenu

Dropdown menu for exporting drawings.

#### File

`/components/drawing/DrawingExportMenu.tsx`

#### Props

```typescript
interface DrawingExportMenuProps {
  drawingId?: Id<"drawings">;
  editor: Editor;           // tldraw editor instance
  className?: string;
}
```

#### Features

- Export as PNG (high resolution)
- Export as SVG (vector)
- Copy to clipboard (PNG)
- Download file with timestamp

#### Example

```typescript
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Download, Copy, FileImage, FileCode } from "lucide-react";

export function DrawingExportMenu({ editor }: DrawingExportMenuProps) {
  const exportAsPNG = async () => {
    const shapeIds = editor.getCurrentPageShapeIds();
    const blob = await editor.exportToBlob({
      ids: Array.from(shapeIds),
      format: "png",
      opts: { scale: 2, background: true },
    });

    downloadBlob(blob, `drawing-${Date.now()}.png`);
  };

  const exportAsSVG = async () => {
    const svg = await editor.exportToSvgString(/* ... */);
    downloadString(svg, `drawing-${Date.now()}.svg`);
  };

  const copyToClipboard = async () => {
    await editor.copyAsImage(/* ... */);
    toast.success("Copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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

---

### 4. DrawingToggle (Collapsed View)

Thumbnail/preview when drawing is minimized.

#### File

`/components/drawing/DrawingToggle.tsx`

#### Props

```typescript
interface DrawingToggleProps {
  drawingId: Id<"drawings">;
  onClick: () => void;
  className?: string;
}
```

#### Features

- Show small preview thumbnail (generated from snapshot)
- Display last updated time
- Click to expand full canvas
- Hover to show quick actions (delete, export)

#### Example

```typescript
export function DrawingToggle({ drawingId, onClick }: DrawingToggleProps) {
  const drawing = useQuery(api.drawings.getDrawing, { drawingId });

  return (
    <div
      className="drawing-toggle cursor-pointer hover:shadow-lg"
      onClick={onClick}
    >
      <div className="preview-container">
        <DrawingPreview data={drawing?.data} />
      </div>
      <div className="drawing-info">
        <span className="text-sm text-muted-foreground">
          Drawing • Updated {formatDistanceToNow(drawing?.updatedAt)}
        </span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
```

---

### 5. DrawingPreview

Static preview/thumbnail of a drawing.

#### File

`/components/drawing/DrawingPreview.tsx`

#### Props

```typescript
interface DrawingPreviewProps {
  data?: string;             // Compressed drawing data
  width?: number;
  height?: number;
  className?: string;
}
```

#### Behavior

- Render static SVG preview from snapshot
- No interactivity (no zoom, pan, editing)
- Fallback to placeholder if data invalid

---

## Integration Points

### Note Editor Integration

Modify existing `note-editor.tsx`:

```typescript
// /modules/notes/components/note-editor/note-editor.tsx

export function NoteEditor({ noteId }: NoteEditorProps) {
  // ... existing state ...

  return (
    <div className="note-editor">
      {/* Existing cover image */}
      <CoverImage {...} />

      {/* Existing title and content */}
      <textarea value={title} ... />
      <RichEditor ... />

      {/* NEW: Drawing section */}
      <DrawingSection noteId={noteId} />

      {/* Existing auto-save indicator */}
      <AutoSaveIndicator ... />
    </div>
  );
}
```

---

## Styling

### Tailwind Classes

```css
/* Drawing section container */
.drawing-section {
  @apply mt-8 mb-4 border rounded-lg overflow-hidden;
}

/* Canvas container */
.drawing-canvas-container {
  @apply relative w-full h-[600px] bg-background;
}

/* Collapsed toggle */
.drawing-toggle {
  @apply flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors;
}

/* Export menu */
.drawing-export-menu {
  @apply absolute top-4 right-4 z-10;
}

/* Loading skeleton */
.drawing-skeleton {
  @apply w-full h-[600px] bg-muted animate-pulse rounded-lg;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + D` | Toggle drawing section | Note editor |
| `Cmd/Ctrl + E` | Export drawing | Canvas focused |
| `Cmd/Ctrl + Z` | Undo | Canvas focused |
| `Cmd/Ctrl + Shift + Z` | Redo | Canvas focused |
| `Space + Drag` | Pan canvas | Canvas focused |
| `Cmd/Ctrl + Scroll` | Zoom | Canvas focused |
| `/` | Open tool menu | Canvas focused |

*Note*: tldraw provides most shortcuts out-of-the-box

---

## Accessibility

### ARIA Labels

```typescript
<div
  role="application"
  aria-label="Drawing canvas"
  aria-describedby="drawing-instructions"
>
  <Tldraw ... />
</div>

<div id="drawing-instructions" className="sr-only">
  Use arrow keys to navigate, space to pan, and tools to draw shapes.
</div>
```

### Keyboard Navigation

- All toolbar buttons accessible via Tab
- Escape key to cancel current operation
- Enter to confirm dialogs
- Focus trap within canvas when active

### Screen Reader Support

- Announce save status ("Saving...", "Saved")
- Announce errors clearly
- Describe drawing content (limited by canvas nature)

---

## Performance Optimizations

1. **Lazy Loading**:
   ```typescript
   const DrawingCanvas = dynamic(
     () => import("./DrawingCanvas"),
     { ssr: false, loading: () => <Skeleton /> }
   );
   ```

2. **Virtualization**: tldraw handles this internally

3. **Debouncing**: 1.5s delay on auto-save

4. **Memoization**:
   ```typescript
   const DrawingSection = memo(({ noteId }: Props) => {
     // ... component code
   }, (prev, next) => prev.noteId === next.noteId);
   ```

---

## Error States

### Component-Level Errors

```typescript
// Error boundary for drawing components
<ErrorBoundary
  fallback={
    <div className="drawing-error">
      <AlertCircle className="w-8 h-8 text-destructive" />
      <p>Failed to load drawing</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  }
>
  <DrawingCanvas ... />
</ErrorBoundary>
```

### Loading States

```typescript
if (isLoading) {
  return <Skeleton className="w-full h-[600px]" />;
}
```

### Empty States

```typescript
if (!drawing) {
  return (
    <div className="drawing-empty-state">
      <PenTool className="w-12 h-12 text-muted-foreground" />
      <h3>No drawing yet</h3>
      <p>Add a drawing to visualize your ideas</p>
      <Button onClick={createDrawing}>
        <Plus className="w-4 h-4 mr-2" />
        Add Drawing
      </Button>
    </div>
  );
}
```

---

## Mobile Considerations

### Responsive Breakpoints

```typescript
const isMobile = useMediaQuery("(max-width: 768px)");
const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
```

### Mobile UI Adaptations

```typescript
<DrawingCanvas
  readonly={isMobile}           // View-only on mobile
  height={isMobile ? 400 : 600} // Smaller height on mobile
  toolbar={isMobile ? null : <DefaultToolbar />} // Hide toolbar on mobile
/>

{isMobile && (
  <div className="mobile-notice">
    <Info className="w-4 h-4" />
    <span>For full editing, please use a desktop or tablet</span>
  </div>
)}
```

---

## Testing

### Component Tests (Vitest + React Testing Library)

```typescript
describe("DrawingCanvas", () => {
  it("renders empty canvas for new drawing", () => {
    render(<DrawingCanvas noteId={testNoteId} />);
    expect(screen.getByRole("application")).toBeInTheDocument();
  });

  it("loads existing drawing data", async () => {
    const mockDrawing = { data: compressedSnapshot };
    mockQuery.mockReturnValue(mockDrawing);

    render(<DrawingCanvas noteId={testNoteId} drawingId={testDrawingId} />);

    await waitFor(() => {
      expect(decompressDrawing).toHaveBeenCalledWith(mockDrawing.data);
    });
  });

  it("auto-saves after debounce delay", async () => {
    jest.useFakeTimers();

    render(<DrawingCanvas noteId={testNoteId} drawingId={testDrawingId} />);

    // Simulate change
    act(() => {
      // trigger tldraw change
    });

    // Fast-forward past debounce
    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalled();
    });
  });
});
```

---

## References

- [tldraw React Component](https://tldraw.dev/docs/editor)
- [tldraw Customization](https://tldraw.dev/docs/user-interface)
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
