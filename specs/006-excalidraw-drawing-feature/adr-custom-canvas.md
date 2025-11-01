# Architectural Decision Record: Custom HTML5 Canvas Implementation

**Status**: Accepted
**Date**: 2025-10-31
**Decision Makers**: Engineering Team
**Feature**: 006-excalidraw-drawing-feature

---

## Context

The Noteflow drawing feature requires a whiteboard/canvas solution to allow users to create sketches, diagrams, and visual content within notes. Initial specification (spec.md v1) proposed using either **Excalidraw** or **tldraw** React libraries as the foundation.

### Requirements
- Drawing tools: pen, shapes (rectangle, circle, diamond, arrow), text, eraser
- Canvas interactions: undo/redo, zoom, pan (optional for MVP)
- Data persistence: auto-save to Convex database with real-time sync
- Export capabilities: PNG, SVG (optional), clipboard copy
- UI/UX: Minimal design matching Noteflow's aesthetic
- Performance: <100ms interaction latency, support up to 1000 elements
- Mobile: View-only mode for smaller screens

### Options Considered

#### Option 1: tldraw Library
**Pros:**
- Mature React library with full feature set
- Built-in undo/redo, zoom, pan, multi-select
- Native SVG export support
- Active community and documentation
- TypeScript-first design

**Cons:**
- **Licensing costs**: Commercial use requires paid license
- Large bundle size (~400-600 KB)
- Opinionated UI that may not match Noteflow aesthetic
- Complex data model (JSON scene graph with shapes, bindings, assets)
- Overhead of wrapping/customizing existing UI

#### Option 2: Excalidraw Library
**Pros:**
- Open-source (MIT license)
- Hand-drawn aesthetic popular with users
- Comprehensive drawing features
- Established export capabilities

**Cons:**
- **Bundle size**: Even larger than tldraw (~800 KB+)
- Less control over UI customization
- Complex scene data structure
- May feel like "embedded Excalidraw" rather than native Noteflow feature

#### Option 3: Custom HTML5 Canvas Implementation ✅ **SELECTED**
**Pros:**
- **Zero licensing costs** (native browser API)
- **Full control** over UI, features, and user experience
- **Smaller bundle size**: No external library overhead
- **Design consistency**: Can exactly match Noteflow's minimal aesthetic
- **Simpler data model**: Store PNG data URLs directly (base64)
- **Faster time-to-MVP**: Implement only needed features, defer advanced ones

**Cons:**
- **More development effort**: Must implement drawing logic from scratch
- **Limited feature set initially**: Advanced features (pan, grid, multi-select) deferred to v2
- **No SVG export**: Canvas API limitations (would need svg-export library)
- **Maintenance burden**: Ongoing bug fixes and improvements in-house

---

## Decision

We will implement the drawing feature using **Custom HTML5 Canvas** (Option 3).

### Rationale

1. **Cost Avoidance**: The primary driver is avoiding licensing fees associated with tldraw, which would add recurring costs to the project with no clear budget allocation.

2. **UI Consistency Priority**: Noteflow has a carefully crafted minimal design (note editor with semantic tokens, clean typography, consistent save indicators). A custom implementation allows us to:
   - Use exact design tokens from note editor
   - Match save indicator patterns (bottom-right toast)
   - Control every aspect of the toolbar/sidebar UI
   - Avoid the "embedded third-party app" feel

3. **Simpler Data Model**: PNG data URLs are easier to work with than complex JSON scene graphs:
   - No need for shape serialization/deserialization
   - Direct storage in Convex database (single `data` field)
   - Simpler backup/restore logic
   - Trade-off: Lose editability of individual shapes (acceptable for MVP)

4. **Feature Flexibility**: We can prioritize features based on actual user needs:
   - **MVP**: Pen, basic shapes, undo/redo, PNG export
   - **v2**: Zoom transform, grid, pan, multi-select
   - **Future**: Advanced features only if user demand justifies effort

5. **Bundle Size**: Native Canvas API adds zero bundle size. Even with custom UI components (~50-80 KB), we stay well under tldraw's 400 KB+ footprint.

### Implementation Strategy

**Phase 1: Core Canvas** (Current)
- HTML5 Canvas with 2D rendering context
- Basic drawing tools: pen, eraser, line, rectangle, circle
- Undo/redo via history stack (ImageData snapshots)
- PNG data URL serialization

**Phase 2: UI Chrome** (Current)
- Toolbar component with 11 tools (select, hand, shapes, pen, text, image, eraser)
- Property sidebar (stroke color, fill, opacity, brush size)
- Hamburger menu (canvas settings)
- Zoom controls (undo/redo buttons)

**Phase 3: Integration** (In Progress - Task T028)
- Note editor integration (DrawingSection wrapper)
- Auto-save with 1.5s debounce
- Convex mutations/queries

**Phase 4: UI Consistency** (Planned - Phase 7 tasks)
- Migrate to semantic color tokens
- Align save indicators with note editor
- Responsive mobile design (readonly mode)

**Phase 5: Polish** (Planned - Phase 6-8 tasks)
- Keyboard shortcuts
- Export menu (PNG + clipboard)
- Performance optimization

---

## Consequences

### Positive

✅ **Zero ongoing costs** - No library licenses to maintain
✅ **Perfect UI match** - Can replicate note editor design exactly
✅ **Lean bundle** - No external drawing library overhead
✅ **Agile development** - Add features incrementally based on user feedback
✅ **Learning opportunity** - Team gains expertise in Canvas API

### Negative

❌ **Increased development time** - ~41 additional tasks (106 total vs. 65 estimated for tldraw)
❌ **Feature gaps initially** - Grid, pan, multi-select deferred to v2
❌ **No SVG export** - PNG only for MVP (acceptable trade-off)
❌ **Maintenance responsibility** - All bugs and improvements handled in-house
❌ **Potential performance issues** - Need to optimize Canvas rendering ourselves

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance degrades with many elements | Implement performance monitoring (Task T056), test with 1000+ elements (Task T102) |
| Custom Canvas feels clunky vs. tldraw | Follow ui-consistency-guidelines.md strictly, conduct user testing early |
| Development takes longer than expected | Prioritize MVP scope (T001-T029), defer v2 features, launch with basic functionality |
| Browser compatibility issues | Test across Chrome, Firefox, Safari, Edge (Task T104), use standard Canvas APIs only |
| Mobile experience poor | Implement readonly mode with "Edit on desktop" message (Tasks T087-T090) |

---

## Validation

This decision will be validated by:

1. **User Adoption**: Target 30% of active users creating at least one drawing within 2 weeks of launch
2. **Performance**: 95th percentile load time < 500ms, interaction latency < 100ms (Tasks T102-T103)
3. **User Feedback**: Collect qualitative feedback on UI consistency and feature completeness
4. **Development Velocity**: Track actual time-to-MVP vs. estimated 11-15 days

If validation fails (low adoption, poor performance, negative feedback), we will reassess and consider migrating to tldraw in a future iteration.

---

## Alternatives Revisited

If this decision proves problematic, we can:

1. **Migrate to tldraw** - If licensing becomes feasible or feature gaps too limiting
2. **Hybrid approach** - Use Canvas for basic drawing, tldraw for advanced features (user choice)
3. **Fork open-source library** - Consider forking Excalidraw and customizing heavily

---

## References

- Specification: `/specs/006-excalidraw-drawing-feature/spec.md`
- Implementation Plan: `/specs/006-excalidraw-drawing-feature/plan.md`
- UI Guidelines: `/specs/006-excalidraw-drawing-feature/ui-consistency-guidelines.md`
- Tasks Breakdown: `/specs/006-excalidraw-drawing-feature/tasks.md`
- HTML5 Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- tldraw Pricing: https://tldraw.dev/pricing (as of 2025-10-31)
- Excalidraw GitHub: https://github.com/excalidraw/excalidraw

---

## Decision Log

| Date | Action | Notes |
|------|--------|-------|
| 2025-10-29 | Initial spec created | Proposed tldraw/Excalidraw libraries |
| 2025-10-31 | Decision to use Custom Canvas | Cost avoidance + UI consistency priorities |
| 2025-10-31 | Spec/plan/tasks updated | Reflect custom Canvas architecture |
| 2025-10-31 | ADR documented | This file created |

**Next Review**: After MVP launch (estimated 2025-11-15) - Evaluate user adoption and performance metrics.
