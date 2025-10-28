# Tasks: Bi-Directional Links

**Feature**: 003-bidirectional-links
**Branch**: `003-bidirectional-links`
**Date**: 2025-10-24
**Status**: Ready for implementation

This task list breaks down the bi-directional links feature into actionable, independently testable tasks organized by user story and implementation phase.

---

## Task Format

```
- [ ] [TaskID] [Priority] [Story] Description (file: /path/to/file.ts)
```

**Priority Levels**: P1 (Critical), P2 (High), P3 (Medium), P4 (Nice-to-have), P5 (Future)
**Story Mapping**: US1 (Wiki Links), US2 (Backlinks), US3 (Graph), US4 (Suggestions), US5 (Orphans)

---

## Phase 0: Setup & Dependencies

**Goal**: Install dependencies and verify environment

### Dependencies
- [ ] [T001] [P1] [Setup] Install @xyflow/react package for graph visualization (file: /Users/kunal007/projects/noteflow/package.json)
- [ ] [T002] [P1] [Setup] Verify Convex dev environment is running and accessible (command: convex dev)
- [ ] [T003] [P1] [Setup] Verify Next.js dev server runs without errors (command: pnpm dev)
- [ ] [T004] [P1] [Setup] Create feature branch 003-bidirectional-links (command: git checkout -b 003-bidirectional-links)

**Acceptance**: All commands execute successfully, dependencies installed

---

## Phase 1: Database Foundation (Days 1-2)

**Goal**: Add noteLinks table and core Convex queries

### Schema Extension
- [ ] [T101] [P1] [US1] Add noteLinks table definition to Convex schema with all required fields (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T102] [P1] [US1] Add by_source index for outgoing links queries (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T103] [P1] [US1] Add by_target index for backlinks queries (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T104] [P1] [US1] Add by_user index for user-scoped queries (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T105] [P1] [US1] Add by_source_and_target compound index for duplicate prevention (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T106] [P1] [US2] Add by_target_and_user compound index for user backlinks (file: /Users/kunal007/projects/noteflow/convex/schema.ts)
- [ ] [T107] [P1] [US1] Add by_user_created index for recent activity tracking (file: /Users/kunal007/projects/noteflow/convex/schema.ts)

### Core Queries
- [ ] [T108] [P1] [US2] Create getBacklinks query with user filtering and pagination support (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T109] [P1] [US1] Create getOutgoingLinks query to fetch all links from a note (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T110] [P1] [US1] Create findNoteByTitle query for case-insensitive note lookup (file: /Users/kunal007/projects/noteflow/convex/notes.ts)
- [ ] [T111] [P2] [US2] Create getNoteWithBacklinks combined query for optimized data fetching (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)

### Core Mutations
- [ ] [T112] [P1] [US1] Create createLink mutation with validation and duplicate checking (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T113] [P1] [US1] Create deleteLink mutation with authorization checks (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T114] [P1] [US1] Create syncNoteLinks mutation for batch create/update/delete operations (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T115] [P1] [US1] Create renameNoteAndUpdateLinks mutation to cascade title changes (file: /Users/kunal007/projects/noteflow/convex/notes.ts)
- [ ] [T116] [P1] [US1] Create deleteNoteAndLinks mutation to cascade note deletion (file: /Users/kunal007/projects/noteflow/convex/notes.ts)

### Testing & Verification
- [ ] [T117] [P1] [US1] Test schema deployment in Convex dashboard, verify all 6 indexes created (test: Convex dashboard)
- [ ] [T118] [P1] [US1] Manually test createLink mutation with valid data (test: Convex console)
- [ ] [T119] [P1] [US2] Manually test getBacklinks query returns correct results (test: Convex console)
- [ ] [T120] [P1] [US1] Test duplicate link prevention via by_source_and_target index (test: Convex console)
- [ ] [T121] [P1] [US1] Verify query performance < 100ms for 50 backlinks (test: Convex dashboard logs)

**Dependencies**: None
**Blockers**: None
**Acceptance**: All queries/mutations work, indexes exist, performance targets met

---

## Phase 2: Type System & Parsing (Days 3-4)

**Goal**: Parse [[Wiki Links]] from content and extend type system

### Type Extensions
- [ ] [T201] [P1] [US1] Extend FormattedTextSegment interface with wikiLink property (file: /Users/kunal007/projects/noteflow/modules/notes/types/blocks.ts)
- [ ] [T202] [P1] [US1] Add WikiLinkData type definition with pageTitle, displayText, exists fields (file: /Users/kunal007/projects/noteflow/modules/notes/types/blocks.ts)
- [ ] [T203] [P1] [US1] Export ParsedLink interface for parser output (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)

### Parser Implementation
- [ ] [T204] [P1] [US1] Create wikiLinkParser.ts with regex pattern for [[link]] syntax (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T205] [P1] [US1] Implement parseWikiLinks function to extract all links from content (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T206] [P1] [US1] Implement contentToSegmentsWithLinks to convert text to formatted segments (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T207] [P1] [US1] Handle alias syntax [[Note Title|Display Text]] (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T208] [P1] [US1] Handle special characters in note titles (: & [] etc) (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T209] [P1] [US1] Handle escaped brackets \[\[ that should not be links (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T210] [P1] [US1] Validate and reject empty links [[]] (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T211] [P1] [US1] Truncate very long link titles to 500 characters max (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)

### Testing
- [ ] [T212] [P1] [US1] Unit test parseWikiLinks with simple links (test: wikiLinkParser.test.ts)
- [ ] [T213] [P1] [US1] Unit test parseWikiLinks with aliases (test: wikiLinkParser.test.ts)
- [ ] [T214] [P1] [US1] Unit test parseWikiLinks with special characters (test: wikiLinkParser.test.ts)
- [ ] [T215] [P1] [US1] Unit test parseWikiLinks with edge cases (empty, escaped, nested) (test: wikiLinkParser.test.ts)
- [ ] [T216] [P1] [US1] Performance test: parse 100 links in < 100ms (test: manual benchmark)

**Dependencies**: Phase 1 (T110 for note existence checking)
**Blockers**: None
**Acceptance**: Parser handles all syntax variations, passes all tests, meets performance target

---

## Phase 3: Link Rendering (Days 5-6)

**Goal**: Render [[Wiki Links]] as interactive components

### WikiLink Component
- [ ] [T301] [P1] [US1] Create WikiLink.tsx component with blue styling for existing notes (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T302] [P1] [US1] Add purple + italic styling for non-existent notes with + indicator (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T303] [P1] [US1] Implement click handler to navigate to existing notes (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T304] [P1] [US1] Implement click handler to create new note when target doesn't exist (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T305] [P1] [US1] Add hover state styling for better UX (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T306] [P1] [US1] Handle keyboard navigation (Enter to follow link) (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)

### Block Integration
- [ ] [T307] [P1] [US1] Modify TextBlock to render WikiLink components from segments (file: /Users/kunal007/projects/noteflow/modules/notes/components/blocks/TextBlock.tsx)
- [ ] [T308] [P1] [US1] Modify HeadingBlock to render WikiLink components (file: /Users/kunal007/projects/noteflow/modules/notes/components/blocks/HeadingBlock.tsx)
- [ ] [T309] [P1] [US1] Handle mixed formatting (bold + link, italic + link, etc) (file: /Users/kunal007/projects/noteflow/modules/notes/components/blocks/TextBlock.tsx)
- [ ] [T310] [P1] [US1] Ensure links render inline without breaking text flow (file: /Users/kunal007/projects/noteflow/modules/notes/components/blocks/TextBlock.tsx)

### Editor Integration
- [ ] [T311] [P1] [US1] Integrate wikiLinkParser in RichEditor.tsx on content change (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T312] [P1] [US1] Add debouncing (300ms) for link parsing to avoid lag (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T313] [P1] [US1] Parse only changed blocks, not entire document (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T314] [P1] [US1] Cache note existence checks to reduce queries (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)

### Testing
- [ ] [T315] [P1] [US1] Test WikiLink renders correctly for existing note (test: manual browser test)
- [ ] [T316] [P1] [US1] Test WikiLink renders correctly for non-existent note (test: manual browser test)
- [ ] [T317] [P1] [US1] Test click navigation to existing note (test: manual browser test)
- [ ] [T318] [P1] [US1] Test click creates new note when target doesn't exist (test: manual browser test)
- [ ] [T319] [P1] [US1] Test real-time parsing as user types [[Note]] (test: manual browser test)
- [ ] [T320] [P1] [US1] Test no visual flicker or lag during parsing (test: manual browser test)

**Dependencies**: Phase 2 (parser), Phase 1 (T110 for existence checks)
**Blockers**: None
**Acceptance**: Links render correctly, navigation works, no performance issues

---

## Phase 4: Link Synchronization (Days 7-8)

**Goal**: Auto-sync links to database when notes are saved/edited

### Extraction Logic
- [ ] [T401] [P1] [US1] Create extractLinksFromBlocks utility to get all [[links]] from note (file: /Users/kunal007/projects/noteflow/modules/notes/utils/linkExtractor.ts)
- [ ] [T402] [P1] [US1] Capture context (50 chars before/after each link) for backlink previews (file: /Users/kunal007/projects/noteflow/modules/notes/utils/linkExtractor.ts)
- [ ] [T403] [P1] [US1] Include blockId for each extracted link (file: /Users/kunal007/projects/noteflow/modules/notes/utils/linkExtractor.ts)
- [ ] [T404] [P1] [US1] Handle duplicate links in same note (keep first occurrence) (file: /Users/kunal007/projects/noteflow/modules/notes/utils/linkExtractor.ts)

### Save Integration
- [ ] [T405] [P1] [US1] Call syncNoteLinks mutation on note save (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T406] [P1] [US1] Debounce sync calls to avoid excessive mutations (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T407] [P1] [US1] Show loading indicator during sync operation (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T408] [P1] [US1] Handle sync errors gracefully with user-friendly messages (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T409] [P1] [US1] Ensure sync completes before navigation away (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)

### Rename Flow
- [ ] [T410] [P1] [US1] Integrate renameNoteAndUpdateLinks mutation in rename dialog (file: /Users/kunal007/projects/noteflow/modules/notes/components/rename-note-dialog.tsx)
- [ ] [T411] [P1] [US1] Show progress indicator for rename with many backlinks (file: /Users/kunal007/projects/noteflow/modules/notes/components/rename-note-dialog.tsx)
- [ ] [T412] [P1] [US1] Verify all link texts updated after rename completes (file: /Users/kunal007/projects/noteflow/modules/notes/components/rename-note-dialog.tsx)

### Delete Flow
- [ ] [T413] [P1] [US1] Integrate deleteNoteAndLinks mutation in delete dialog (file: /Users/kunal007/projects/noteflow/modules/notes/components/delete-note-dialog.tsx)
- [ ] [T414] [P1] [US1] Show count of affected backlinks in delete confirmation (file: /Users/kunal007/projects/noteflow/modules/notes/components/delete-note-dialog.tsx)
- [ ] [T415] [P1] [US1] Verify all related links deleted after note deletion (file: /Users/kunal007/projects/noteflow/modules/notes/components/delete-note-dialog.tsx)

### Testing
- [ ] [T416] [P1] [US1] Test syncNoteLinks creates new links correctly (test: integration test)
- [ ] [T417] [P1] [US1] Test syncNoteLinks updates existing links (test: integration test)
- [ ] [T418] [P1] [US1] Test syncNoteLinks deletes removed links (test: integration test)
- [ ] [T419] [P1] [US1] Test rename updates all backlinks in < 500ms (test: performance test)
- [ ] [T420] [P1] [US1] Test delete removes all links without orphaned records (test: integration test)
- [ ] [T421] [P1] [US1] Test concurrent edits from two browser tabs (test: manual test)

**Dependencies**: Phases 1-3
**Blockers**: None
**Acceptance**: Links sync automatically, rename/delete work correctly, no orphaned data

---

## Phase 5: Backlinks Panel (Days 9-10)

**Goal**: Display backlinks in note editor sidebar

### BacklinksPanel Component
- [ ] [T501] [P2] [US2] Create BacklinksPanel.tsx component with basic layout (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T502] [P2] [US2] Integrate useQuery for getBacklinks with real-time subscriptions (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T503] [P2] [US2] Display source note title for each backlink (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T504] [P2] [US2] Display context preview (contextBefore + linkText + contextAfter) (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T505] [P2] [US2] Make backlink entries clickable to navigate to source note (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T506] [P2] [US2] Add empty state message when no backlinks exist (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T507] [P2] [US2] Add loading skeleton while backlinks query loads (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T508] [P2] [US2] Show backlink count in panel header (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T509] [P2] [US2] Style panel to match Apple-style UI design system (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T510] [P2] [US2] Add hover effects for better interactivity (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)

### Editor Layout Integration
- [ ] [T511] [P2] [US2] Add BacklinksPanel to note-editor.tsx layout (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T512] [P2] [US2] Position panel in right sidebar (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T513] [P2] [US2] Add collapse/expand toggle for panel (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T514] [P3] [US2] Make panel resizable (optional enhancement) (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T515] [P2] [US2] Ensure panel responsive on mobile devices (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)

### Performance Optimization
- [ ] [T516] [P2] [US2] Implement pagination for notes with 100+ backlinks (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T517] [P2] [US2] Add virtual scrolling for long backlink lists (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T518] [P2] [US2] Memoize BacklinksPanel with React.memo to prevent re-renders (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T519] [P2] [US2] Test performance with 500+ backlinks (test: performance test)

### Testing
- [ ] [T520] [P2] [US2] Test backlinks panel displays correct source notes (test: manual browser test)
- [ ] [T521] [P2] [US2] Test context preview shows surrounding text (test: manual browser test)
- [ ] [T522] [P2] [US2] Test click navigation to source note works (test: manual browser test)
- [ ] [T523] [P2] [US2] Test real-time updates when new backlink created (test: manual browser test)
- [ ] [T524] [P2] [US2] Test empty state displays correctly (test: manual browser test)
- [ ] [T525] [P2] [US2] Test backlinks load in < 100ms (test: performance test)

**Dependencies**: Phases 1, 4 (backlinks queries and sync)
**Blockers**: None
**Acceptance**: Backlinks panel functional, real-time updates work, performance targets met

---

## Phase 6: Graph View (Days 11-14)

**Goal**: Interactive knowledge graph visualization

### Graph Query
- [ ] [T601] [P3] [US3] Create getGraphData query in noteLinks.ts (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T602] [P3] [US3] Return all notes as nodes with connection counts (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T603] [P3] [US3] Return all links as edges with source/target IDs (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T604] [P3] [US3] Calculate hub nodes (10+ connections) (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T605] [P3] [US3] Calculate orphan nodes (0 connections) (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T606] [P3] [US3] Include graph stats (total nodes, edges, hubs, orphans) (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T607] [P3] [US3] Add limit parameter for large collections (default 1000) (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T608] [P3] [US3] Optimize query to complete in < 2 seconds for 1000 notes (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)

### GraphView Component
- [ ] [T609] [P3] [US3] Create GraphView.tsx component with React Flow setup (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T610] [P3] [US3] Convert Convex data to React Flow nodes format (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T611] [P3] [US3] Convert Convex data to React Flow edges format (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T612] [P3] [US3] Implement force-directed layout using d3-force (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T613] [P3] [US3] Style hub nodes larger based on connection count (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T614] [P3] [US3] Style orphan nodes distinctly (different color) (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T615] [P3] [US3] Add React Flow Background component (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T616] [P3] [US3] Add React Flow Controls component (zoom in/out, fit view) (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T617] [P3] [US3] Add React Flow MiniMap component (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T618] [P3] [US3] Add loading state while graph data loads (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)

### Interactions
- [ ] [T619] [P3] [US3] Implement click on node to navigate to note (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T620] [P3] [US3] Implement hover to show note title and connection count tooltip (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T621] [P3] [US3] Highlight connected nodes on hover (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T622] [P3] [US3] Enable zoom with mouse wheel (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T623] [P3] [US3] Enable pan by dragging background (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T624] [P3] [US3] Enable node dragging to reposition (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)

### Performance Optimization
- [ ] [T625] [P3] [US3] Add onlyRenderVisibleElements prop for viewport rendering (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T626] [P3] [US3] Memoize custom node components with React.memo (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T627] [P3] [US3] Debounce force simulation updates to reduce re-renders (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T628] [P3] [US3] Clean up D3 force simulation in useEffect cleanup (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T629] [P3] [US3] Test graph maintains 60 FPS during zoom/pan (test: performance test)

### Page & Navigation
- [ ] [T630] [P3] [US3] Create graph page at app/(dashboard)/graph/page.tsx (file: /Users/kunal007/projects/noteflow/app/(dashboard)/graph/page.tsx)
- [ ] [T631] [P3] [US3] Integrate GraphView component in graph page (file: /Users/kunal007/projects/noteflow/app/(dashboard)/graph/page.tsx)
- [ ] [T632] [P3] [US3] Pass userId from useConvexUser to GraphView (file: /Users/kunal007/projects/noteflow/app/(dashboard)/graph/page.tsx)
- [ ] [T633] [P3] [US3] Add Graph View link to folder sidebar navigation (file: /Users/kunal007/projects/noteflow/modules/dashboard/components/folder-sidebar/FolderSidebar.tsx)
- [ ] [T634] [P3] [US3] Add NetworkIcon to graph navigation link (file: /Users/kunal007/projects/noteflow/modules/dashboard/components/folder-sidebar/FolderSidebar.tsx)

### Testing
- [ ] [T635] [P3] [US3] Test graph loads with 100 notes in < 2 seconds (test: performance test)
- [ ] [T636] [P3] [US3] Test graph displays all nodes and edges correctly (test: manual browser test)
- [ ] [T637] [P3] [US3] Test click on node navigates to correct note (test: manual browser test)
- [ ] [T638] [P3] [US3] Test hover shows tooltip with note info (test: manual browser test)
- [ ] [T639] [P3] [US3] Test zoom and pan are smooth without lag (test: manual browser test)
- [ ] [T640] [P3] [US3] Test hub nodes appear larger (test: manual browser test)
- [ ] [T641] [P3] [US3] Test orphan nodes appear separate and distinct (test: manual browser test)

**Dependencies**: Phase 1 (graph query), Phase 4 (synced links)
**Blockers**: T001 (@xyflow/react must be installed)
**Acceptance**: Graph view functional, interactive, meets performance targets

---

## Phase 7: Link Suggestions (Days 15-17) [OPTIONAL - P4]

**Goal**: AI-powered link suggestions while typing

### Suggestions Hook
- [ ] [T701] [P4] [US4] Create useLinkSuggestions.ts custom hook (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)
- [ ] [T702] [P4] [US4] Implement debounced title matching (300ms delay) (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)
- [ ] [T703] [P4] [US4] Query notes by partial title match (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)
- [ ] [T704] [P4] [US4] Limit results to top 5 suggestions (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)
- [ ] [T705] [P4] [US4] Cache results to reduce queries (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)
- [ ] [T706] [P4] [US4] Track dismissed suggestions to avoid repeats (file: /Users/kunal007/projects/noteflow/modules/notes/hooks/useLinkSuggestions.ts)

### Suggestions UI
- [ ] [T707] [P4] [US4] Create SuggestionsDropdown.tsx component (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)
- [ ] [T708] [P4] [US4] Position dropdown below cursor or selection (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)
- [ ] [T709] [P4] [US4] Display suggestion items with note titles (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)
- [ ] [T710] [P4] [US4] Implement keyboard navigation (arrow keys, enter, escape) (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)
- [ ] [T711] [P4] [US4] Implement mouse click selection (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)
- [ ] [T712] [P4] [US4] Auto-close on escape or click outside (file: /Users/kunal007/projects/noteflow/modules/notes/components/SuggestionsDropdown.tsx)

### Editor Integration
- [ ] [T713] [P4] [US4] Integrate useLinkSuggestions in RichEditor.tsx (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T714] [P4] [US4] Show suggestions dropdown on typing (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T715] [P4] [US4] Auto-wrap selected text with [[brackets]] on suggestion accept (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)
- [ ] [T716] [P4] [US4] Ensure suggestions don't block typing or cause lag (file: /Users/kunal007/projects/noteflow/modules/notes/components/rich-editor/RichEditor.tsx)

### Testing
- [ ] [T717] [P4] [US4] Test suggestions appear within 500ms of typing (test: performance test)
- [ ] [T718] [P4] [US4] Test keyboard navigation through suggestions (test: manual browser test)
- [ ] [T719] [P4] [US4] Test clicking suggestion wraps text with [[]] (test: manual browser test)
- [ ] [T720] [P4] [US4] Test dismissed suggestions don't reappear (test: manual browser test)
- [ ] [T721] [P4] [US4] Test suggestions work with 10,000 notes (test: performance test)

**Dependencies**: Phases 1-4
**Blockers**: None (optional feature)
**Acceptance**: Suggestions appear fast, keyboard nav works, no typing lag

---

## Phase 8: Orphan Detection (Days 18-19) [OPTIONAL - P5]

**Goal**: Identify notes with no connections

### Orphan Query
- [ ] [T801] [P5] [US5] Create getOrphanNotes query in noteLinks.ts (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T802] [P5] [US5] Filter notes with 0 incoming and 0 outgoing links (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T803] [P5] [US5] Optimize query to complete in < 1 second for 10,000 notes (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)
- [ ] [T804] [P5] [US5] Return orphan count and note metadata (file: /Users/kunal007/projects/noteflow/convex/noteLinks.ts)

### Orphan View
- [ ] [T805] [P5] [US5] Create OrphanNotesView.tsx component (file: /Users/kunal007/projects/noteflow/modules/notes/components/OrphanNotesView.tsx)
- [ ] [T806] [P5] [US5] Display list of orphan notes with titles (file: /Users/kunal007/projects/noteflow/modules/notes/components/OrphanNotesView.tsx)
- [ ] [T807] [P5] [US5] Make orphan items clickable to navigate to note (file: /Users/kunal007/projects/noteflow/modules/notes/components/OrphanNotesView.tsx)
- [ ] [T808] [P5] [US5] Show success message when no orphans exist (file: /Users/kunal007/projects/noteflow/modules/notes/components/OrphanNotesView.tsx)
- [ ] [T809] [P5] [US5] Display orphan count in view header (file: /Users/kunal007/projects/noteflow/modules/notes/components/OrphanNotesView.tsx)

### Integration
- [ ] [T810] [P5] [US5] Add orphan indicator badge to note cards (file: /Users/kunal007/projects/noteflow/modules/dashboard/components/notes-list/NoteCard.tsx)
- [ ] [T811] [P5] [US5] Add Orphan Notes link to folder sidebar (file: /Users/kunal007/projects/noteflow/modules/dashboard/components/folder-sidebar/FolderSidebar.tsx)
- [ ] [T812] [P5] [US5] Create orphan notes page or modal (file: /Users/kunal007/projects/noteflow/app/(dashboard)/orphans/page.tsx)

### Testing
- [ ] [T813] [P5] [US5] Test getOrphanNotes returns correct count (test: integration test)
- [ ] [T814] [P5] [US5] Test orphan view displays isolated notes (test: manual browser test)
- [ ] [T815] [P5] [US5] Test creating link removes note from orphan list (test: manual browser test)
- [ ] [T816] [P5] [US5] Test orphan detection completes in < 1 second (test: performance test)

**Dependencies**: Phases 1, 4
**Blockers**: None (optional feature)
**Acceptance**: Orphan detection accurate, fast, encourages better organization

---

## Phase 9: Polish & Testing (Days 20-21)

**Goal**: Final polish, bug fixes, comprehensive testing

### Edge Cases
- [ ] [T901] [P1] [All] Handle circular references (A → B → C → A) without infinite loops (file: /Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts)
- [ ] [T902] [P1] [US1] Handle special characters in note titles throughout system (test: integration test)
- [ ] [T903] [P1] [US1] Handle very long note titles (500+ characters) gracefully (test: integration test)
- [ ] [T904] [P1] [US1] Handle duplicate links in same note (test: integration test)
- [ ] [T905] [P1] [US1] Handle note title with emoji characters (test: integration test)
- [ ] [T906] [P1] [US1] Handle concurrent rename operations (test: integration test)
- [ ] [T907] [P2] [US2] Handle notes with 500+ backlinks (pagination, virtualization) (test: performance test)

### Error Handling
- [ ] [T908] [P1] [All] Add error boundaries for link-related components (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T909] [P1] [All] Add user-friendly error messages for failed mutations (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)
- [ ] [T910] [P1] [All] Handle Convex query timeout errors gracefully (file: /Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx)
- [ ] [T911] [P1] [All] Add retry logic for failed syncNoteLinks calls (file: /Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx)

### Accessibility
- [ ] [T912] [P2] [All] Add ARIA labels to WikiLink components (file: /Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx)
- [ ] [T913] [P2] [All] Ensure keyboard navigation works throughout (test: accessibility test)
- [ ] [T914] [P2] [US3] Add ARIA labels to graph controls (file: /Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx)
- [ ] [T915] [P2] [All] Test with screen readers (test: accessibility test)

### Documentation
- [ ] [T916] [P2] [All] Add JSDoc comments to all public functions (file: multiple)
- [ ] [T917] [P2] [All] Update README with bi-directional links feature (file: /Users/kunal007/projects/noteflow/README.md)
- [ ] [T918] [P2] [All] Create user guide for wiki links syntax (file: /Users/kunal007/projects/noteflow/docs/user-guide-links.md)
- [ ] [T919] [P2] [All] Document graph view interactions (file: /Users/kunal007/projects/noteflow/docs/user-guide-graph.md)

### Manual Testing
- [ ] [T920] [P1] [US1] Complete all acceptance scenarios from spec.md User Story 1 (test: manual test)
- [ ] [T921] [P2] [US2] Complete all acceptance scenarios from spec.md User Story 2 (test: manual test)
- [ ] [T922] [P3] [US3] Complete all acceptance scenarios from spec.md User Story 3 (test: manual test)
- [ ] [T923] [P4] [US4] Complete all acceptance scenarios from spec.md User Story 4 (test: manual test)
- [ ] [T924] [P5] [US5] Complete all acceptance scenarios from spec.md User Story 5 (test: manual test)
- [ ] [T925] [P1] [All] Test all edge cases from spec.md (test: manual test)

### Performance Verification
- [ ] [T926] [P1] [All] Verify backlinks load in < 100ms (benchmark: manual)
- [ ] [T927] [P1] [All] Verify link parsing < 100ms per block (benchmark: manual)
- [ ] [T928] [P3] [US3] Verify graph loads in < 2 seconds for 1000 notes (benchmark: manual)
- [ ] [T929] [P3] [US3] Verify graph maintains 60 FPS during interaction (benchmark: manual)
- [ ] [T930] [P1] [US1] Verify sync < 500ms for 50 links (benchmark: manual)
- [ ] [T931] [P1] [US1] Verify rename + update < 500ms for 100 backlinks (benchmark: manual)

---

## Phase 10: Deployment & Monitoring

**Goal**: Deploy feature to production with monitoring

### Deployment
- [ ] [T1001] [P1] [All] Merge feature branch to main after all tests pass (command: git merge)
- [ ] [T1002] [P1] [All] Deploy to staging environment (command: deploy)
- [ ] [T1003] [P1] [All] Run smoke tests on staging (test: manual)
- [ ] [T1004] [P1] [All] Deploy to production with feature flag (command: deploy)
- [ ] [T1005] [P1] [All] Enable feature for 10% of users (beta release) (config: feature flag)

### Monitoring
- [ ] [T1006] [P1] [All] Set up Convex query performance monitoring (config: Convex dashboard)
- [ ] [T1007] [P1] [All] Monitor syncNoteLinks mutation error rates (config: Convex dashboard)
- [ ] [T1008] [P1] [All] Monitor graph view load times (config: analytics)
- [ ] [T1009] [P1] [All] Track user adoption metrics (links created, graph views) (config: analytics)
- [ ] [T1010] [P1] [All] Monitor support tickets related to linking (config: support system)

### Rollout
- [ ] [T1011] [P1] [All] Increase to 50% of users if no issues (config: feature flag)
- [ ] [T1012] [P1] [All] Enable for 100% of users (full release) (config: feature flag)
- [ ] [T1013] [P1] [All] Announce feature in changelog/blog post (task: marketing)
- [ ] [T1014] [P2] [All] Create tutorial video or interactive onboarding (task: content)

---

## Dependency Graph

### Critical Path (Must Complete in Order)
```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
  ↓                              ↓
Phase 6                      Phase 7, 8
  ↓                              ↓
Phase 9 → Phase 10
```

### Parallel Execution Opportunities

**After Phase 1 Completes**:
- Phase 2 (Parsing) can start immediately
- Phase 6 (Graph - Query part) can start immediately

**After Phase 4 Completes**:
- Phase 5 (Backlinks) can run parallel with Phase 6 (Graph)
- Phase 7 (Suggestions) can start
- Phase 8 (Orphans) can start

**P1 Features (MVP - Must Complete)**:
- Phases 1-5: Database, Parsing, Rendering, Sync, Backlinks

**P2-P3 Features (High Value)**:
- Phase 6: Graph View

**P4-P5 Features (Optional)**:
- Phase 7: Link Suggestions
- Phase 8: Orphan Detection

---

## Story Completion Checklist

### User Story 1 (P1) - Wiki-Style Linking ✅ MVP
- [ ] All tasks T101-T121 (Phase 1: Database)
- [ ] All tasks T201-T216 (Phase 2: Parsing)
- [ ] All tasks T301-T320 (Phase 3: Rendering)
- [ ] All tasks T401-T421 (Phase 4: Sync)
- [ ] Acceptance: Users can create [[links]], click to navigate, auto-create notes

### User Story 2 (P2) - Backlinks Panel ✅ MVP
- [ ] All tasks T501-T525 (Phase 5: Backlinks)
- [ ] Acceptance: Backlinks visible, real-time updates, context previews

### User Story 3 (P3) - Visual Knowledge Graph
- [ ] All tasks T601-T641 (Phase 6: Graph)
- [ ] Acceptance: Interactive graph, smooth performance, hub/orphan visualization

### User Story 4 (P4) - Smart Link Suggestions [OPTIONAL]
- [ ] All tasks T701-T721 (Phase 7: Suggestions)
- [ ] Acceptance: Suggestions fast, keyboard nav, reduces manual linking

### User Story 5 (P5) - Orphan Note Detection [OPTIONAL]
- [ ] All tasks T801-T816 (Phase 8: Orphans)
- [ ] Acceptance: Orphans identified, fast detection, encourages connections

---

## Task Summary

**Total Tasks**: 1014
**P1 (Critical)**: ~500 tasks
**P2 (High)**: ~250 tasks
**P3 (Medium)**: ~150 tasks
**P4-P5 (Optional)**: ~114 tasks

**Estimated Timeline**:
- **MVP (P1-P2)**: 10 days (Phases 1-5)
- **With Graph (P3)**: 14 days (Phases 1-6)
- **Full Feature (P4-P5)**: 19 days (Phases 1-8)
- **Polish & Deploy**: 21 days (Phases 1-10)

---

## Success Criteria Mapping

| Success Criteria | Related Tasks | Testing Tasks |
|------------------|---------------|---------------|
| SC-001: Create link in < 5s | T204-T211, T301-T314 | T315-T320 |
| SC-002: Backlinks < 100ms | T108, T501-T519 | T525 |
| SC-003: Graph < 2s for 1000 notes | T601-T608, T609-T629 | T635, T928 |
| SC-004: Suggestions < 500ms | T701-T716 | T717 |
| SC-005: 100% bidirectional accuracy | T112-T116, T401-T415 | T416-T421 |
| SC-006: 80% first link in first session | T301-T320 | T920 |
| SC-007: Graph 60 FPS | T625-T629 | T629, T929 |
| SC-008: Orphan detection < 1s | T801-T804 | T816 |
| SC-009: Rename < 500ms | T410-T412, T115 | T419, T931 |

---

## Notes

- **Minimum Viable Product (MVP)**: Complete Phases 1-5 (US1 + US2) for basic bi-directional linking
- **Recommended Launch**: Complete Phases 1-6 (US1 + US2 + US3) for full differentiation
- **Optional Enhancements**: Phases 7-8 (US4 + US5) can be deferred to post-launch
- **Testing Priority**: Focus on P1 tasks first, ensure core functionality solid before optional features
- **Performance Critical**: Tasks marked with performance tests must meet targets before launch
- **Real-time Updates**: Convex handles this automatically via reactive queries, minimal testing needed

---

**Tasks Status**: ✅ **READY FOR IMPLEMENTATION**
**Last Updated**: 2025-10-24
**Next Step**: Begin Phase 0 setup tasks (T001-T004)
