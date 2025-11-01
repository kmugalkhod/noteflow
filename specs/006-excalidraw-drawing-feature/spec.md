# Feature Specification: Excalidraw Drawing Integration

**Feature ID**: 006-excalidraw-drawing-feature
**Status**: In Progress (Custom Canvas Implementation)
**Created**: 2025-10-29
**Last Updated**: 2025-10-31
**Architecture**: Custom HTML5 Canvas with Excalidraw-inspired UI

## Overview

Add an Excalidraw-like whiteboard feature inside the existing Next.js + Convex note-taking app, allowing users to create, edit, and save sketches or diagrams tied to each note.

## Goals

1. Enable users to create visual content (drawings, diagrams, sketches) within notes
2. Provide a familiar drawing interface with essential tools (shapes, arrows, text, freehand)
3. Persist drawing data in Convex database for real-time sync across sessions
4. Support export capabilities (PNG, SVG, PDF) and clipboard operations
5. Maintain the app's minimal and clean design aesthetic

## Requirements

### Functional Requirements

#### FR1: Drawing Canvas Integration
- Users can embed a drawing canvas within each note
- Canvas is accessible through the note editor interface
- Each note can have zero or one associated drawing
- Drawing data is tied to the note's unique ID

#### FR2: Drawing Tools
- **Toolbar** with the following options:
  - Shapes (rectangle, circle, triangle, diamond)
  - Arrows (straight, curved)
  - Text tool
  - Freehand drawing/pen tool
  - Eraser
  - Selection tool

#### FR3: Canvas Interactions
- **Undo/Redo**: Full undo/redo support for all drawing actions ✅ Implemented
- **Zoom**: Zoom in/out capabilities with reset - **MVP: Basic zoom controls** (v2: Full transform)
- **Grid Toggle**: Optional grid overlay for precision - **Deferred to v2**
- **Pan**: Navigate large canvases - **Deferred to v2** (Hand tool placeholder)
- **Multi-select**: Select and manipulate multiple elements - **Deferred to v2** (Select tool placeholder)

#### FR4: Data Persistence
- Auto-save drawing data to Convex database
- Restore drawings when reopening notes
- Real-time sync across sessions
- Handle concurrent editing scenarios

#### FR5: Export Capabilities
- Export to PNG (raster image, 2x scale for retina)
- Export to SVG (vector image) - **Deferred to v2** (Canvas API limitations)
- Export to PDF (document format) - **Deferred to v2** (requires jsPDF library)
- Copy canvas content to clipboard (PNG format)

### Non-Functional Requirements

#### NFR1: Performance
- Canvas should be responsive with <100ms interaction latency
- Auto-save should not block user interactions
- Support canvases with up to 1000 elements without performance degradation

#### NFR2: User Experience
- Seamless integration with existing note editor
- Minimal UI that blends with current design:
  - Use semantic color tokens (`bg-editor-bg`, `text-foreground`, `border-border`)
  - Match note editor's spacing patterns (`max-w-4xl mx-auto` content container)
  - Consistent save indicators (bottom-right toast with icon + text)
  - Maximum 11 toolbar items organized in 3 logical groups
  - Property sidebar ≤ 224px width (14rem)
- Keyboard shortcuts for common tools:
  - V: Select, H: Hand, R: Rectangle, D: Diamond, C: Circle
  - A: Arrow, L: Line, P: Pen, T: Text, I: Image, E: Eraser
  - Cmd/Ctrl+Z: Undo, Cmd/Ctrl+Shift+Z: Redo
- Mobile support: View-only mode (readonly canvas) for screen widths < 768px

#### NFR3: Data Integrity
- Prevent data loss during auto-save
- Handle offline scenarios gracefully
- Version conflict resolution for concurrent edits

#### NFR4: Compatibility
- Works in modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for tablet (≥768px) and desktop (≥1024px)
- Mobile (< 768px): View-only mode with readonly canvas
  - Display drawing with pan/zoom disabled
  - Show "Edit on desktop" message overlay
  - No toolbar or editing controls visible

## Technical Approach

### Architecture Decision: Custom HTML5 Canvas

**Decision**: Implement a custom HTML5 Canvas solution with Excalidraw-inspired UI instead of using a third-party library.

**Rationale**:
- **Cost**: Avoid licensing costs associated with commercial drawing libraries
- **Control**: Full control over feature set, performance, and bundle size
- **Customization**: Easier to align UI/UX with Noteflow's minimal design aesthetic
- **Simplicity**: Simpler data model (PNG data URLs vs complex JSON scene graphs)

**Trade-offs**:
- More initial development effort required
- Need to implement core features (zoom, grid, shapes) from scratch
- Limited advanced features compared to mature libraries
- Accepted for MVP scope

**Implementation Details**:
- Native HTML5 Canvas API with 2D rendering context
- React component wrapper for state management
- Custom drawing tools (pen, shapes, eraser) with hand-drawn aesthetic
- PNG data URL format for storage (base64 encoded)

### Architecture

#### Frontend Components
```
components/drawing/
├── DrawingCanvas.tsx           # Main canvas component with HTML5 Canvas
├── DrawingSection.tsx          # Wrapper with expand/collapse functionality
└── index.ts                    # Exports

components/ (shared UI elements)
├── toolbar.tsx                 # Drawing toolbar with tool selection
├── property-sidebar.tsx        # Left sidebar for tool properties
├── hamburger-menu.tsx          # Canvas settings menu
├── action-buttons.tsx          # Top-right action buttons
├── zoom-controls.tsx           # Bottom-left zoom/undo/redo controls
├── color-picker.tsx            # Color selection component
├── stroke-color-picker.tsx     # Stroke color variant
├── brush-controls.tsx          # Brush size slider
├── opacity-slider.tsx          # Opacity control
├── font-controls.tsx           # Text tool font settings
└── layers-control.tsx          # Layer management (future)
```

#### Convex Backend
```
convex/
├── drawings.ts            # Mutations and queries for drawing data
└── schema.ts              # Drawing data model (update)
```

#### Integration Points
- Note editor: Add drawing canvas toggle/embed
- Note data model: Add drawing reference field
- File storage: Store exported images if needed

### Data Model

```typescript
// Convex schema addition
drawings: defineTable({
  noteId: v.id("notes"),
  userId: v.id("users"),
  data: v.string(),           // PNG data URL (base64 encoded)
  version: v.number(),
  sizeBytes: v.optional(v.number()),
  elementCount: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  isDeleted: v.optional(v.boolean()),
})
.index("by_note", ["noteId"])
.index("by_user", ["userId"])
.index("by_note_user", ["noteId", "userId"])
```

### API Operations

#### Queries
- `getDrawingByNoteId(noteId)`: Fetch drawing for a note
- `getMyDrawings()`: List all user's drawings

#### Mutations
- `createDrawing(noteId, drawingData)`: Create new drawing
- `updateDrawing(drawingId, drawingData)`: Update existing drawing
- `deleteDrawing(drawingId)`: Delete drawing

## User Flows

### Flow 1: Create a Drawing
1. User opens a note in the editor
2. User clicks "Add Drawing" button in the note editor
3. Drawing canvas appears (embedded or full-screen)
4. User draws using available tools
5. Drawing auto-saves to Convex
6. User can close/minimize canvas to continue editing text

### Flow 2: Edit Existing Drawing
1. User opens note with existing drawing
2. Drawing preview/thumbnail is visible
3. User clicks on drawing to open editor
4. User makes changes
5. Changes auto-save
6. User closes editor

### Flow 3: Export Drawing
1. User opens drawing editor
2. User clicks export button
3. User selects format (PNG/SVG/PDF)
4. File downloads to user's device
5. Alternatively, user can copy to clipboard

## Success Metrics

1. **Adoption**: 30% of active users create at least one drawing within 2 weeks
2. **Engagement**: Average 5+ drawings per engaged user
3. **Performance**: 95th percentile load time <500ms for drawings
4. **Reliability**: <0.1% data loss rate during auto-save

## Out of Scope

- Real-time collaborative drawing (multiple users editing simultaneously)
- Advanced drawing features (layers, filters, effects)
- Drawing templates library
- AI-powered drawing assistance
- Integration with third-party diagram tools
- Embedding external diagrams (Figma, Miro, etc.)

## Dependencies

- HTML5 Canvas API (native browser support)
- React 19.1.0 with hooks for state management
- Existing Convex backend infrastructure
- Existing note editor component (`/modules/notes/components/note-editor/note-editor.tsx`)
- lucide-react for toolbar icons
- Tailwind CSS for styling with semantic design tokens

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Custom Canvas requires more dev effort | High | Prioritize MVP features (undo/redo, basic shapes), defer advanced features to v2 |
| Drawing data becomes too large for database | Medium | PNG compression, 500 KB size limit, show warning at 400 KB |
| Concurrent edits cause conflicts | High | Implement last-write-wins strategy (simpler than OT) |
| Mobile performance issues | Medium | View-only mode for mobile (< 768px), no editing |
| Browser Canvas API compatibility | Low | Canvas API is well-supported, test across modern browsers |
| UI/UX consistency with note editor | High | Use semantic Tailwind tokens, match spacing/typography patterns |

## Timeline Estimate (Custom Canvas Implementation)

- **Phase 1**: Setup & Infrastructure (1 day) - Dependencies, directory structure, types
- **Phase 2**: Core Canvas & Data Model (2-3 days) - Convex schema, drawing mutations, basic canvas
- **Phase 3**: Drawing Tools & UI (3-4 days) - Toolbar, shapes, pen, eraser, property sidebar
- **Phase 4**: Auto-save & Integration (2 days) - Debounced save, note editor integration
- **Phase 5**: UI Consistency & Polish (2-3 days) - Semantic tokens, save indicator, responsive
- **Phase 6**: Export & Testing (1-2 days) - PNG export, clipboard, manual testing

**Total**: 11-15 days (MVP with deferred v2 features)

## References

- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw) - UI/UX inspiration
- [HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - Core drawing technology
- [Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial) - Implementation reference
- Existing note editor: `/modules/notes/components/note-editor/note-editor.tsx`
- Convex schema: `/convex/schema.ts`
- Note data model: `/convex/notes.ts`
- Drawing implementation: `/components/drawing/DrawingCanvas.tsx`

## UI Consistency Requirements

To maintain visual harmony with Noteflow's existing design:

### Color System
- **Background**: Use `bg-[#fafafa] dark:bg-[#1a1a1a]` (matches editor)
- **UI Elements**: `bg-white dark:bg-gray-900` for toolbars/sidebars
- **Borders**: `border-gray-200 dark:border-gray-700`
- **Text**: `text-foreground` (semantic token)
- **Active States**: `bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`

### Typography
- **Tool Labels**: `text-xs font-medium text-muted-foreground`
- **Buttons**: Match note editor button sizes (`h-9 w-9`)
- **Font Family**: Inherit from note editor (system font stack)

### Spacing & Layout
- **Content Container**: Match `max-w-4xl mx-auto` pattern from note editor
- **Padding**: `p-4` for toolbars, `px-8 py-12` for main content areas
- **Sidebar Width**: `w-56` (224px, 14rem) - matches property sidebar

### Animation
- **Transitions**: `transition-all duration-200` for interactive elements
- **Fade In**: Use `animate-fade-in` class for component mount
- **Slide Up**: Use `animate-slide-up` for save indicators

### Save Indicator Consistency
- **Location**: Bottom-right corner (`fixed bottom-4 right-4`)
- **Style**: Toast with backdrop blur (`bg-background/80 backdrop-blur-sm`)
- **Icon**: Loader2 (saving) or Check (saved) from lucide-react
- **Duration**: Show for 2 seconds after save completes
