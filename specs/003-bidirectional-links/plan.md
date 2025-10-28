# Implementation Plan: Bi-Directional Links

**Branch**: `003-bidirectional-links` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-bidirectional-links/spec.md`

## Summary

Implement wiki-style bidirectional linking system enabling users to create `[[Note Title]]` links that automatically create backlinks. Includes interactive knowledge graph visualization, link suggestions, and orphan note detection. Technical approach uses a separate `noteLinks` junction table in Convex for scalable backlink queries, real-time parsing with custom decorators in the block-based editor, and React Flow for graph visualization handling 1000+ nodes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.1.0, Next.js 15.5.5
**Primary Dependencies**: Convex 1.28.0 (backend), @xyflow/react (graph visualization), Tailwind CSS 4, Radix UI
**Storage**: Convex database (NoSQL with real-time subscriptions)
**Testing**: Convex test suite, React Testing Library, manual browser testing
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)
**Project Type**: Web application (Next.js App Router with Convex backend)
**Performance Goals**:
- Backlinks query < 100ms
- Link parsing < 100ms per block
- Graph rendering < 2 seconds for 1000 nodes
- Graph interaction 60 FPS
- Real-time updates < 500ms

**Constraints**:
- Must work offline for parsing (online for queries)
- Must maintain 100% bidirectional accuracy
- Must scale to 10,000 notes with 500+ backlinks each
- Must support real-time multi-user sync (Convex native)

**Scale/Scope**:
- Support 10,000+ notes per user
- Support 500+ backlinks per note
- Support 1000 nodes in graph view simultaneously
- Handle 50 concurrent link operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: ⚠️ Constitution file is template-only (not yet customized for NoteFlow)

**Assumed Principles** (standard software engineering best practices):

✅ **Modularity**: Feature is self-contained in dedicated modules
- Link parsing in `/modules/notes/utils/`
- Components in `/modules/notes/components/`
- Convex queries in `/convex/noteLinks.ts`

✅ **Type Safety**: Full TypeScript throughout
- Strict types for all entities
- Convex schema validation
- React component prop types

✅ **Performance**: Meets all success criteria
- Indexed database queries
- Memoized React components
- Optimized graph rendering

✅ **Testing**: Testable architecture
- Pure functions for parsing
- Mockable Convex queries
- Component unit tests

✅ **Documentation**: Comprehensive docs provided
- Feature specification
- Data model
- API contracts
- Quick start guide

**No violations identified** - architecture follows standard Next.js/Convex patterns.

## Project Structure

### Documentation (this feature)

```text
specs/003-bidirectional-links/
├── spec.md              # Feature specification (user stories, requirements)
├── plan.md              # This file (implementation plan)
├── research.md          # ✅ Phase 0 output (technical research)
├── data-model.md        # ✅ Phase 1 output (entity definitions)
├── quickstart.md        # ✅ Phase 1 output (developer guide)
├── contracts/
│   └── convex-api.md    # ✅ Phase 1 output (API specifications)
├── checklists/
│   └── requirements.md  # ✅ Specification quality validation
└── tasks.md             # Phase 2 output (/speckit.tasks - next step)
```

### Source Code (repository root)

**Next.js App Router + Convex Backend Structure:**

```text
/Users/kunal007/projects/noteflow/

# Backend (Convex)
convex/
├── schema.ts            # ADD: noteLinks table with 6 indexes
├── noteLinks.ts         # NEW: Queries and mutations for links
├── notes.ts             # MODIFY: Add findNoteByTitle query
├── folders.ts           # (existing, no changes)
├── tags.ts              # (existing, no changes)
└── _generated/          # (auto-generated types)

# Frontend (Next.js + React)
app/(dashboard)/
├── graph/
│   └── page.tsx         # NEW: Graph view page
├── note/[id]/           # (existing note editor page)
└── favorites/           # (existing favorites page)

modules/notes/
├── types/
│   └── blocks.ts        # MODIFY: Add wikiLink to FormattedTextSegment
├── utils/
│   ├── wikiLinkParser.ts        # NEW: Parse [[links]] from content
│   └── textFormatting.ts        # (existing, may need updates)
├── components/
│   ├── WikiLink.tsx             # NEW: Link component (blue/purple)
│   ├── BacklinksPanel.tsx       # NEW: Show backlinks in sidebar
│   ├── GraphView.tsx            # NEW: Interactive graph visualization
│   ├── rich-editor/
│   │   ├── RichEditor.tsx       # MODIFY: Integrate link parsing
│   │   └── EditorBlock.tsx      # MODIFY: Render WikiLink components
│   ├── blocks/
│   │   ├── TextBlock.tsx        # MODIFY: Render links in text
│   │   └── HeadingBlock.tsx     # MODIFY: Render links in headings
│   └── note-editor/
│       └── note-editor.tsx      # MODIFY: Add BacklinksPanel
└── hooks/
    └── useLinkSuggestions.ts    # NEW: Link autocomplete (P4 feature)

# UI Components (no changes needed)
components/ui/           # (existing Radix UI components)

# Package Dependencies
package.json             # ADD: @xyflow/react
```

**Structure Decision**: Using existing Next.js App Router structure with Convex backend. All new code follows established patterns:
- Convex backend functions in `/convex/`
- React components in `/modules/notes/components/`
- Utilities in `/modules/notes/utils/`
- Types in `/modules/notes/types/`

No new directories required - feature integrates cleanly into existing architecture.

## Complexity Tracking

✅ **No complexity violations** - feature uses standard patterns throughout.

### Architectural Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|-------------------------|
| Separate `noteLinks` table | Scalable to 500+ backlinks per note, indexed queries | Embedded arrays (doesn't scale, can't index) |
| React Flow for graph | Production-ready, handles 5000+ nodes, MIT license | Reagraph (UI blocking), Cytoscape (complex integration) |
| Real-time parsing | Immediate visual feedback, aligns with user expectations | Parse on save (delayed feedback, confusing UX) |
| Junction table pattern | Standard SQL/NoSQL pattern for many-to-many | Custom graph database (overkill for use case) |

## Implementation Phases

### Phase 1: Database Foundation (Priority: P1 - Days 1-2)

**Goal**: Add `noteLinks` table and core queries

**Tasks**:
1. Add `noteLinks` table to `convex/schema.ts` with 6 indexes
2. Create `convex/noteLinks.ts` with:
   - `getBacklinks` query
   - `getOutgoingLinks` query
   - `syncNoteLinks` mutation
   - `createLink` mutation
   - `deleteLink` mutation
3. Add `findNoteByTitle` query to `convex/notes.ts`
4. Test queries in Convex dashboard
5. Verify indexes created correctly

**Deliverables**:
- ✅ `noteLinks` table with data
- ✅ 5 working queries/mutations
- ✅ Manual testing passed

**Dependencies**: None (can start immediately)

**Success Criteria**:
- Query backlinks in < 100ms
- Create link in < 50ms
- Database accepts all valid data

---

### Phase 2: Link Parsing (Priority: P1 - Days 3-4)

**Goal**: Parse and render `[[Wiki Links]]` in editor

**Tasks**:
1. Extend `FormattedTextSegment` type in `modules/notes/types/blocks.ts`
2. Create `modules/notes/utils/wikiLinkParser.ts`:
   - `parseWikiLinks()` function
   - `contentToSegmentsWithLinks()` function
   - Handle edge cases (special chars, empty links, etc.)
3. Create `modules/notes/components/WikiLink.tsx`:
   - Blue styling for existing notes
   - Purple + italic for non-existent notes
   - Click to navigate or create
4. Modify `modules/notes/components/blocks/TextBlock.tsx`:
   - Render WikiLink components
   - Handle mixed formatting (bold + link, etc.)
5. Test parsing with various inputs

**Deliverables**:
- ✅ Links render in real-time as user types
- ✅ Click navigation works
- ✅ Edge cases handled gracefully

**Dependencies**: Phase 1 complete

**Success Criteria**:
- Parse 100 links in < 100ms
- Links render correctly in all block types
- No visual glitches or flicker

---

### Phase 3: Backlinks Panel (Priority: P2 - Days 5-6)

**Goal**: Display backlinks in note editor sidebar

**Tasks**:
1. Create `modules/notes/components/BacklinksPanel.tsx`:
   - Use `useQuery` for real-time updates
   - Display source note title
   - Show context preview
   - Click to navigate
2. Modify `modules/notes/components/note-editor/note-editor.tsx`:
   - Add backlinks panel to layout
   - Make resizable (optional)
   - Show/hide toggle
3. Style panel to match Apple-style UI
4. Add loading and empty states
5. Test with notes that have many backlinks

**Deliverables**:
- ✅ Backlinks panel functional
- ✅ Real-time updates work
- ✅ Performance good with 100+ backlinks

**Dependencies**: Phases 1 & 2 complete

**Success Criteria**:
- Backlinks load in < 100ms
- Real-time updates within 500ms
- Panel responsive and smooth

---

### Phase 4: Link Synchronization (Priority: P1 - Days 7-8)

**Goal**: Sync links when user saves/edits notes

**Tasks**:
1. Create link extraction logic in `RichEditor.tsx`:
   - Extract all `[[links]]` from blocks
   - Include context (50 chars before/after)
   - Handle duplicates
2. Implement `syncNoteLinks` mutation call:
   - On save (debounced)
   - On blur (optional)
   - Batch operations
3. Handle note rename flow:
   - Update all link texts
   - Trigger backlink updates
4. Handle note deletion flow:
   - Remove all related links
   - Clean up orphaned records
5. Test concurrent edits

**Deliverables**:
- ✅ Links auto-sync on save
- ✅ Rename updates all backlinks
- ✅ Delete cleans up links

**Dependencies**: Phases 1-3 complete

**Success Criteria**:
- Sync 50 links in < 500ms
- Rename + update 100 backlinks in < 500ms
- No orphaned link records

---

### Phase 5: Graph View (Priority: P3 - Days 9-12)

**Goal**: Interactive knowledge graph visualization

**Tasks**:
1. Install `@xyflow/react` dependency
2. Create `convex/noteLinks.ts` `getGraphData` query:
   - Return all notes as nodes
   - Return all links as edges
   - Include stats (hub detection, orphans)
3. Create `modules/notes/components/GraphView.tsx`:
   - Initialize React Flow
   - Convert data to React Flow format
   - Implement force-directed layout (d3-force)
   - Style nodes (size based on connections)
   - Add zoom, pan, controls
4. Create `app/(dashboard)/graph/page.tsx`
5. Add navigation link to sidebar
6. Optimize performance for 1000+ nodes:
   - Viewport-based rendering
   - Memoization
   - Debounced updates
7. Add graph interactions:
   - Click node → navigate to note
   - Hover → show title and count
   - Highlight connected nodes

**Deliverables**:
- ✅ Graph view page functional
- ✅ Interactive and responsive
- ✅ Performance meets targets

**Dependencies**: Phases 1-4 complete

**Success Criteria**:
- Load 1000 notes in < 2 seconds
- Maintain 60 FPS while interacting
- Graph updates in real-time

---

### Phase 6: Link Suggestions (Priority: P4 - Days 13-15) [OPTIONAL]

**Goal**: Suggest notes to link while typing

**Tasks**:
1. Create `modules/notes/hooks/useLinkSuggestions.ts`:
   - Debounced title matching
   - Semantic similarity (optional)
   - Cache results
2. Add suggestion dropdown to editor:
   - Show on typing
   - Keyboard navigation (arrow keys, enter)
   - Click to select
3. Auto-wrap selected text with `[[brackets]]`
4. Dismiss on escape or click away
5. Test performance with 10,000 notes

**Deliverables**:
- ✅ Suggestions appear within 500ms
- ✅ Keyboard navigation smooth
- ✅ Reduces manual linking time

**Dependencies**: Phases 1-4 complete

**Success Criteria**:
- Suggestions in < 500ms
- Relevant results (top 5)
- No typing lag

---

### Phase 7: Orphan Detection (Priority: P5 - Days 16-17) [OPTIONAL]

**Goal**: Identify notes with no connections

**Tasks**:
1. Create `getOrphanNotes` query in `convex/noteLinks.ts`
2. Create orphan notes view (page or modal)
3. Add "Fix" button to create suggested links
4. Add orphan indicator badge on note cards
5. Optimize query for large collections

**Deliverables**:
- ✅ Orphan notes list functional
- ✅ Performance good with 10,000 notes
- ✅ Encourages better organization

**Dependencies**: Phases 1-4 complete

**Success Criteria**:
- Detection completes in < 1 second
- Accurate identification (0% false positives)
- Helpful UX for users

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degrades with many backlinks | Medium | High | Use pagination, virtual scrolling, limit initial load to 50 |
| Graph view slow with 1000+ nodes | Medium | Medium | Viewport rendering, React.memo(), debouncing, lazy loading |
| Regex parsing edge cases | Low | Medium | Extensive testing, validation, clear error messages |
| Convex query limits exceeded | Low | High | Batch operations, pagination, monitor usage |
| Real-time sync conflicts | Low | Medium | Convex handles this automatically, test concurrent edits |

### User Experience Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users confused by link syntax | Medium | Low | In-app tooltips, documentation, examples |
| Accidental link creation | Medium | Low | Undo toast (P3 feature from spec), clear visual feedback |
| Too many backlinks overwhelming | Low | Medium | Pagination, collapsible panel, filtering |
| Graph view too complex | Medium | Low | Tutorial on first use, simple controls, minimap |

---

## Testing Strategy

### Unit Tests

```typescript
// wikiLinkParser.ts
describe('parseWikiLinks', () => {
  it('parses simple links', () => {
    expect(parseWikiLinks('[[Note]]')).toEqual([...]);
  });
  
  it('handles aliases', () => {
    expect(parseWikiLinks('[[Note|Alias]]')).toEqual([...]);
  });
  
  it('handles special characters', () => {
    expect(parseWikiLinks('[[Note: Plan & Design]]')).toEqual([...]);
  });
  
  it('rejects empty links', () => {
    expect(parseWikiLinks('[[]]')).toEqual([]);
  });
});
```

### Integration Tests

```typescript
// Convex functions
describe('noteLinks mutations', () => {
  it('creates bidirectional link', async () => {
    const linkId = await createLink({...});
    const backlinks = await getBacklinks({targetNoteId: ...});
    expect(backlinks).toHaveLength(1);
  });
  
  it('syncs links on note update', async () => {
    await syncNoteLinks({extractedLinks: [...]});
    // Verify database state
  });
  
  it('cleans up on note delete', async () => {
    await deleteNoteAndLinks({noteId: ...});
    const links = await getOutgoingLinks({noteId: ...});
    expect(links).toHaveLength(0);
  });
});
```

### Manual Testing Checklist

- [ ] Create link with `[[Note Title]]` syntax
- [ ] Verify link is clickable and navigates correctly
- [ ] Create link to non-existent note, verify note is created on click
- [ ] Check backlinks panel shows correct source notes
- [ ] Rename note, verify all backlinks update
- [ ] Delete note with backlinks, verify cleanup
- [ ] Open graph view with 100 notes, verify performance
- [ ] Zoom and pan in graph, verify smooth interaction
- [ ] Create circular references (A → B → C → A), verify no infinite loops
- [ ] Test with special characters in titles
- [ ] Test with very long note titles (500 chars)
- [ ] Test with note that has 500+ backlinks
- [ ] Test concurrent edits from two browser tabs
- [ ] Test offline behavior (parsing works, queries fail gracefully)

---

## Performance Benchmarks

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Backlinks query (50) | < 100ms | TBD | ⏳ Pending |
| Link parsing (100 links) | < 100ms | TBD | ⏳ Pending |
| Graph load (1000 nodes) | < 2s | TBD | ⏳ Pending |
| Graph interaction | 60 FPS | TBD | ⏳ Pending |
| Sync links (50) | < 500ms | TBD | ⏳ Pending |
| Rename + update (100) | < 500ms | TBD | ⏳ Pending |
| Orphan detection (10k) | < 1s | TBD | ⏳ Pending |

*Benchmarks to be measured during implementation*

---

## Rollout Plan

### Phase 1: Internal Testing (Week 1-2)
- Deploy to staging environment
- Test with synthetic data (1000+ notes)
- Fix bugs and performance issues
- Gather internal feedback

### Phase 2: Beta Release (Week 3)
- Enable for 10% of users (feature flag)
- Monitor performance metrics
- Collect user feedback
- Fix critical issues

### Phase 3: Gradual Rollout (Week 4)
- Increase to 50% of users
- Monitor Convex query performance
- Adjust based on real-world usage
- Document learnings

### Phase 4: Full Release (Week 5)
- Enable for 100% of users
- Announce feature in changelog
- Create tutorial/documentation
- Monitor support tickets

### Rollback Plan
- Feature flag can disable instantly
- Convex schema is additive (non-breaking)
- Links table can be dropped if needed
- No data migration required for rollback

---

## Success Metrics

**Technical**:
- ✅ All performance targets met
- ✅ < 1% error rate on link operations
- ✅ 99.9% uptime for Convex queries
- ✅ No memory leaks in graph view

**User**:
- ✅ 80% of users create first link within first session
- ✅ 70% of users find graph view helpful
- ✅ 40% improvement in finding related information
- ✅ < 5 support tickets per 1000 users

**Business**:
- ✅ Feature differentiates NoteFlow from competitors
- ✅ Increases user engagement (daily active users +10%)
- ✅ Positive user reviews mentioning linking feature
- ✅ Enables "second brain" positioning

---

## Next Steps

1. **Review this plan** with team
2. **Run `/speckit.tasks`** to generate detailed task breakdown
3. **Create GitHub issues** from tasks.md
4. **Assign Phase 1 tasks** to developers
5. **Set up monitoring** for performance metrics
6. **Schedule checkpoints** at end of each phase

---

## Resources

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/convex-api.md](./contracts/convex-api.md)
- **Quick Start**: [quickstart.md](./quickstart.md)
- **Convex Docs**: https://docs.convex.dev
- **React Flow Docs**: https://reactflow.dev

---

**Plan Status**: ✅ **COMPLETE** - Ready for `/speckit.tasks` phase

**Last Updated**: 2025-10-24
