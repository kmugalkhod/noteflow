# Tasks: Excalidraw Drawing Integration

**Input**: Design documents from `/specs/006-excalidraw-drawing-feature/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested in this feature specification, so test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Project uses:
- Frontend: `/components/drawing/`, `/modules/notes/components/`
- Backend: `/convex/`
- Types: `/modules/types/`
- Utils: `/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install tldraw library: `npm install tldraw`
- [ ] T002 [P] Install lz-string compression library: `npm install lz-string`
- [ ] T003 [P] Install Vitest testing framework: `npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom`
- [ ] T004 [P] Create Vitest configuration file in vitest.config.ts
- [ ] T005 [P] Create test setup file in test/setup.ts
- [ ] T006 Update package.json to add test script: `"test": "vitest"`
- [ ] T007 Create drawing components directory structure: components/drawing/
- [ ] T008 [P] Create drawing types file: modules/types/drawing.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Update Convex schema to add drawings table in convex/schema.ts (noteId, userId, data, version, sizeBytes, elementCount, createdAt, updatedAt, isDeleted with indexes: by_note, by_user, by_note_user)
- [ ] T010 [P] Update Convex schema to add hasDrawing field to notes table in convex/schema.ts
- [ ] T011 Deploy Convex schema changes: `npx convex dev` and verify in Convex dashboard
- [ ] T012 [P] Create drawing utility functions in lib/drawingUtils.ts (compressDrawing, decompressDrawing, getDrawingSize, formatBytes)
- [ ] T013 Create Convex drawings functions file in convex/drawings.ts with getUserId helper function
- [ ] T014 Implement validateDrawingSize helper function in convex/drawings.ts
- [ ] T015 Implement getDrawingByNote query in convex/drawings.ts
- [ ] T016 [P] Implement createDrawing mutation in convex/drawings.ts
- [ ] T017 [P] Implement updateDrawing mutation in convex/drawings.ts
- [ ] T018 [P] Implement deleteDrawing mutation in convex/drawings.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Basic Drawings (Priority: P1) 🎯 MVP

**Goal**: Users can create a new drawing in a note, use basic drawing tools (shapes, text, freehand), and have it auto-save to the database

**Independent Test**:
1. Open a note
2. Drawing canvas should appear
3. Draw shapes, add text
4. Wait 1.5 seconds
5. Refresh page - drawing should persist
6. Verify in Convex dashboard that drawing record exists

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create DrawingCanvas component in components/drawing/DrawingCanvas.tsx with dynamic tldraw import (ssr: false)
- [ ] T020 [P] [US1] Import tldraw CSS in DrawingCanvas component: `import "tldraw/tldraw.css"`
- [ ] T021 [US1] Implement drawing state management in DrawingCanvas (snapshot state, editor state, saving state)
- [ ] T022 [US1] Implement drawing data loading logic in DrawingCanvas (useEffect to load existing drawing via getDrawingByNote query)
- [ ] T023 [US1] Implement auto-save logic in DrawingCanvas with useDebounce hook (1.5s delay)
- [ ] T024 [US1] Implement create drawing flow in DrawingCanvas (call createDrawing mutation if no drawingId exists)
- [ ] T025 [US1] Implement update drawing flow in DrawingCanvas (call updateDrawing mutation if drawingId exists)
- [ ] T026 [US1] Add error handling and toast notifications in DrawingCanvas (handle save failures, size limit errors)
- [ ] T027 [US1] Add save indicator UI in DrawingCanvas (show "Saving..." when isSaving is true)
- [X] T028 [US1] Integrate DrawingCanvas into note editor in modules/notes/components/note-editor/note-editor.tsx (add drawing section after content editor)
- [ ] T029 [US1] Create drawing components barrel export file in components/drawing/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create drawings, edit them, and see them persist

---

## Phase 4: User Story 2 - Collapsed/Expanded Drawing View (Priority: P2)

**Goal**: Users can toggle between collapsed (thumbnail) and expanded (full canvas) views of their drawing

**Independent Test**:
1. Open a note with an existing drawing
2. Drawing should show in collapsed state with thumbnail
3. Click to expand - full canvas appears
4. Click to collapse - returns to thumbnail view
5. Changes made in expanded view persist when collapsed

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create DrawingSection wrapper component in modules/notes/components/note-editor/DrawingSection.tsx
- [ ] T031 [US2] Implement toggle state management in DrawingSection (isExpanded, isLoading, hasUnsavedChanges)
- [ ] T032 [P] [US2] Create DrawingToggle component for collapsed view in components/drawing/DrawingToggle.tsx
- [ ] T033 [US2] Implement drawing preview/thumbnail in DrawingToggle (show last updated time, click handler)
- [ ] T034 [P] [US2] Create DrawingPreview component for static preview in components/drawing/DrawingPreview.tsx
- [ ] T035 [US2] Implement SVG preview rendering in DrawingPreview (decompress data, render static SVG)
- [ ] T036 [US2] Add "Add Drawing" button in DrawingSection (shown when no drawing exists and not expanded)
- [ ] T037 [US2] Implement expand/collapse logic in DrawingSection (show DrawingCanvas when expanded, DrawingToggle when collapsed)
- [ ] T038 [US2] Add unsaved changes confirmation dialog in DrawingSection (if hasUnsavedChanges and user attempts to collapse)
- [ ] T039 [US2] Update note editor to use DrawingSection instead of direct DrawingCanvas in modules/notes/components/note-editor/note-editor.tsx
- [ ] T040 [US2] Update drawing components barrel export in components/drawing/index.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can toggle drawing visibility

---

## Phase 5: User Story 3 - Export Drawings (Priority: P3)

**Goal**: Users can export their drawings to PNG, SVG formats and copy to clipboard

**Independent Test**:
1. Open a note with a drawing
2. Expand the drawing canvas
3. Click export button
4. Select PNG format - file should download
5. Select SVG format - file should download
6. Click copy to clipboard - drawing should copy
7. Paste into another app - image appears

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create DrawingExportMenu component in components/drawing/DrawingExportMenu.tsx
- [ ] T042 [US3] Implement PNG export function in DrawingExportMenu (use editor.getSvgAsImage with type: 'png', scale: 2)
- [ ] T043 [P] [US3] Implement SVG export function in DrawingExportMenu (use editor.getSvgString)
- [ ] T044 [P] [US3] Implement copy to clipboard function in DrawingExportMenu (use editor.putContentOntoClipboard with formats: ['png'])
- [ ] T045 [US3] Create download blob helper in DrawingExportMenu (URL.createObjectURL, create anchor element, trigger download)
- [ ] T046 [US3] Add error handling and toast notifications in DrawingExportMenu (handle export failures)
- [ ] T047 [US3] Create dropdown menu UI in DrawingExportMenu using Radix UI DropdownMenu (Export button with PNG/SVG/Copy options)
- [ ] T048 [US3] Add export menu to DrawingCanvas in components/drawing/DrawingCanvas.tsx (position absolute top-right, z-10)
- [ ] T049 [US3] Update drawing components barrel export in components/drawing/index.ts

**Checkpoint**: All three user stories should now be independently functional - full drawing feature complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final refinements

- [ ] T050 [P] Add loading skeleton for DrawingCanvas in components/drawing/DrawingCanvas.tsx (show during tldraw dynamic import)
- [ ] T051 [P] Add error boundary for drawing components (catch and display drawing load/save errors gracefully)
- [ ] T052 [P] Implement responsive design for mobile in DrawingCanvas (detect isMobile with useMediaQuery, set readonly mode)
- [ ] T053 [P] Add mobile notice/message in DrawingCanvas (inform users full editing requires desktop/tablet)
- [ ] T054 Add keyboard shortcut for toggling drawing section (Cmd/Ctrl + D in note editor)
- [ ] T055 [P] Optimize bundle size with code splitting (verify tldraw loads only when needed via dynamic import)
- [ ] T056 [P] Add performance monitoring in DrawingCanvas (performance.mark for drawing load time)
- [ ] T057 Implement drawing size warning in DrawingCanvas (toast warning when drawing approaches 400 KB limit)
- [ ] T058 [P] Add accessibility improvements (ARIA labels for canvas, keyboard navigation support)
- [ ] T059 [P] Update CLAUDE.md context file with drawing feature documentation
- [ ] T060 Run manual testing checklist from quickstart.md (test all user flows end-to-end)
- [ ] T061 Verify drawing data compression works correctly (test with large drawings, verify size reduction)
- [ ] T062 Test concurrent editing scenario (open same note in two tabs, verify last-write-wins behavior)
- [ ] T063 Test error scenarios (network failures, size limit exceeded, invalid data)
- [ ] T064 [P] Code cleanup and refactoring (remove console.logs, unused imports, improve naming)
- [ ] T065 Final integration testing (test all user stories together, verify no regressions)

---

## Phase 7: UI Consistency & Custom Canvas Refinements

**Purpose**: Align drawing UI with note editor design system and address gaps from custom Canvas implementation

**Prerequisites**: Phases 3-5 complete (core functionality working)

### UI Consistency Tasks

- [ ] T066 [P] [UI] Migrate save indicator to bottom-right corner in DrawingCanvas.tsx (match note editor: `fixed bottom-4 right-4`)
- [ ] T067 [P] [UI] Update save indicator styling in DrawingCanvas.tsx (use `bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border-border shadow-sm`)
- [ ] T068 [P] [UI] Replace hardcoded colors with semantic tokens in toolbar.tsx (use `bg-white dark:bg-gray-900`, `border-border`, `text-foreground`)
- [ ] T069 [P] [UI] Replace hardcoded colors with semantic tokens in property-sidebar.tsx
- [ ] T070 [P] [UI] Replace hardcoded colors with semantic tokens in hamburger-menu.tsx
- [ ] T071 [P] [UI] Replace hardcoded colors with semantic tokens in action-buttons.tsx
- [ ] T072 [P] [UI] Replace hardcoded colors with semantic tokens in zoom-controls.tsx
- [ ] T073 [P] [UI] Add animate-slide-up class to save indicator in DrawingCanvas.tsx
- [ ] T074 [P] [UI] Consolidate color-picker.tsx and stroke-color-picker.tsx into single component with variants
- [ ] T075 [UI] Verify all button sizes match `h-9 w-9` standard across toolbar and controls
- [ ] T076 [UI] Verify all icons use `h-4 w-4` sizing from lucide-react
- [ ] T077 [UI] Test dark mode consistency across all drawing UI components

### Missing Canvas Interactions (FR3)

- [ ] T078 [Canvas] Implement basic zoom transform in DrawingCanvas.tsx (add zoom state, apply canvas scale transform)
- [ ] T079 [Canvas] Connect zoom controls to zoom transform logic (zoom in/out/reset buttons functional)
- [ ] T080 [Canvas] Add grid overlay toggle in hamburger-menu.tsx (optional grid pattern for precision) - **v2 Feature**
- [ ] T081 [Canvas] Implement pan/hand tool logic in DrawingCanvas.tsx (drag to move viewport) - **v2 Feature**
- [ ] T082 [Canvas] Implement select tool with element selection in DrawingCanvas.tsx - **v2 Feature**
- [ ] T083 [Canvas] Implement multi-select logic (shift+click to select multiple elements) - **v2 Feature**

### Keyboard Shortcuts

- [ ] T084 [P] [UX] Add keyboard event handlers to DrawingCanvas for tool shortcuts (V, H, R, D, C, A, L, P, T, I, E)
- [ ] T085 [P] [UX] Add Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z for redo
- [ ] T086 [UX] Add Cmd/Ctrl+D shortcut in note editor to toggle drawing section visibility

### Mobile Responsive

- [ ] T087 [P] [Mobile] Add useMediaQuery hook to detect screen width < 768px in DrawingCanvas.tsx
- [ ] T088 [Mobile] Set readonly mode when isMobile is true in DrawingCanvas.tsx
- [ ] T089 [P] [Mobile] Hide toolbar and sidebars on mobile (< 768px)
- [ ] T090 [Mobile] Add "Edit on desktop" overlay message for mobile users

### Documentation

- [ ] T091 [P] [Docs] Add drawing feature section to CLAUDE.md with custom Canvas architecture details
- [ ] T092 [P] [Docs] Create ADR (Architectural Decision Record) for custom Canvas choice in specs/006-excalidraw-drawing-feature/adr-custom-canvas.md

**Checkpoint**: UI now matches note editor design system, keyboard shortcuts functional, mobile responsive

---

## Phase 8: Final Validation & Launch Prep

**Purpose**: End-to-end testing, performance verification, launch readiness

- [ ] T093 Run UI consistency checklist from ui-consistency-guidelines.md against all drawing components
- [ ] T094 Test save indicator appears in same location as note editor (bottom-right)
- [ ] T095 Test all colors respond correctly to dark mode toggle
- [ ] T096 Verify keyboard shortcuts work (test all 11 tool shortcuts + undo/redo)
- [ ] T097 Test mobile view-only mode on device < 768px width
- [ ] T098 Test drawing persistence after page refresh (auto-save + restore flow)
- [ ] T099 Test drawing size warning appears at 400 KB threshold
- [ ] T100 Test export PNG functionality end-to-end
- [ ] T101 Test clipboard copy functionality end-to-end
- [ ] T102 Performance test: Verify <100ms interaction latency with 500+ elements
- [ ] T103 Performance test: Verify <500ms p95 load time for existing drawings
- [ ] T104 Browser compatibility test: Chrome, Firefox, Safari, Edge
- [ ] T105 Final code review: Remove console.logs, unused imports, add comments
- [ ] T106 Update feature status in spec.md to "Complete" with launch date

**Checkpoint**: Feature ready for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T008) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase (T009-T018) completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories (T019-T049) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (T019-T029) - Wraps DrawingCanvas in toggle UI
- **User Story 3 (P3)**: Depends on US1 completion (T019-T029) - Adds export to existing canvas

### Within Each User Story

**User Story 1 (Create and Edit):**
- T019-T020 can run in parallel (both creating/importing)
- T021-T027 must run sequentially (state management → loading → saving → error handling)
- T028-T029 must run after T021-T027 (integration after component complete)

**User Story 2 (Toggle View):**
- T030, T032, T034 can run in parallel (wrapper, toggle, preview are independent components)
- T031, T033, T035 build on T030, T032, T034 respectively
- T036-T040 integrate components sequentially

**User Story 3 (Export):**
- T041-T044 can run in parallel (export component and different export functions)
- T045-T049 must run sequentially (integration and updates)

### Parallel Opportunities

- All Setup tasks marked [P] (T002, T003, T004, T005, T008) can run in parallel
- All Foundational tasks marked [P] (T010, T012, T016, T017, T018) can run in parallel within their dependencies
- Within US1: T019-T020 parallel
- Within US2: T030, T032, T034 parallel
- Within US3: T041-T044 parallel
- Once Foundational completes, US1 can start immediately
- Polish tasks marked [P] (T050-T053, T055-T056, T058-T059, T064) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T009-T011 (schema changes) complete, launch in parallel:
Task T012: "Create drawing utility functions in lib/drawingUtils.ts"
Task T016: "Implement createDrawing mutation in convex/drawings.ts"
Task T017: "Implement updateDrawing mutation in convex/drawings.ts"
Task T018: "Implement deleteDrawing mutation in convex/drawings.ts"
```

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task T019: "Create DrawingCanvas component in components/drawing/DrawingCanvas.tsx"
Task T020: "Import tldraw CSS in DrawingCanvas component"
```

## Parallel Example: User Story 2

```bash
# Launch independent components in parallel:
Task T030: "Create DrawingSection wrapper component"
Task T032: "Create DrawingToggle component for collapsed view"
Task T034: "Create DrawingPreview component for static preview"
```

## Parallel Example: User Story 3

```bash
# Launch export functions in parallel:
Task T041: "Create DrawingExportMenu component"
Task T042: "Implement PNG export function"
Task T043: "Implement SVG export function"
Task T044: "Implement copy to clipboard function"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T018) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T019-T029)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open note, create drawing, draw shapes
   - Wait for auto-save, refresh page
   - Verify drawing persists
5. Deploy/demo if ready - **This is your MVP!**

### Incremental Delivery

1. Complete Setup + Foundational (T001-T018) → Foundation ready
2. Add User Story 1 (T019-T029) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T030-T040) → Test independently → Deploy/Demo (Enhanced UX)
4. Add User Story 3 (T041-T049) → Test independently → Deploy/Demo (Full Feature)
5. Add Polish (T050-T065) → Final testing → Production Release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T018)
2. Once Foundational is done:
   - Developer A: User Story 1 (T019-T029)
   - Must complete before US2/US3 can start
3. After US1 complete:
   - Developer A: User Story 2 (T030-T040)
   - Developer B: User Story 3 (T041-T049)
4. Team: Polish together (T050-T065)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (US1 - MVP)**: 11 tasks
- **Phase 4 (US2)**: 11 tasks
- **Phase 5 (US3)**: 9 tasks
- **Phase 6 (Polish)**: 16 tasks
- **Phase 7 (UI Consistency & Canvas Refinements)**: 27 tasks
- **Phase 8 (Final Validation)**: 14 tasks

**Total**: 106 tasks (was 65, added 41 for custom Canvas implementation)

**Parallel Opportunities**: 43 tasks marked [P] (includes new UI consistency tasks)

**MVP Scope**: T001-T029 (29 tasks) = User Story 1 complete

**Full Feature Scope (Custom Canvas)**: T001-T106 (all phases) = Production-ready with UI consistency

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- [UI] label = UI consistency task aligning with note editor design
- [Canvas] label = Custom Canvas implementation feature
- [UX] label = User experience enhancement (keyboard shortcuts, etc.)
- [Mobile] label = Mobile responsive task
- [Docs] label = Documentation task
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are NOT included as they were not requested in the feature specification
- **DECISION: Custom HTML5 Canvas** (not tldraw/Excalidraw) to avoid licensing costs
- Custom Canvas requires implementing undo/redo, zoom, shapes, pen tool from scratch
- Grid toggle, pan, select, multi-select deferred to v2 (marked in tasks)
- SVG/PDF export deferred to v2 (Canvas API limitations, would need additional libraries)
- Mobile users get view-only mode (readonly canvas) for screen widths < 768px
- Drawing size limit is 500 KB (PNG data URL) to stay within Convex 1MB document limit
- **Phase 7 (T066-T092)** is critical for UI consistency with note editor design system
- Refer to `ui-consistency-guidelines.md` for detailed design token specifications
