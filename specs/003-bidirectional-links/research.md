# Research: Bi-Directional Links Implementation

**Date**: 2025-10-24
**Feature**: 003-bidirectional-links

This document captures research findings that resolve technical uncertainties identified during planning.

---

## Decision 1: Graph Visualization Library

### Question
Which graph visualization library should be used for the interactive knowledge graph (User Story 3)?

### Research Summary
Evaluated D3.js, Cytoscape.js, vis.js, React Flow, and Reagraph across 8 criteria: performance with 1000+ nodes, React integration, interactive features, force-directed layouts, customization, bundle size, TypeScript support, and licensing.

### Decision
**React Flow (@xyflow/react)**

### Rationale
React Flow provides the optimal balance for NoteFlow:
- **Performance**: Handles 5,000+ nodes with viewport-based rendering optimizations
- **React Integration**: Native React library with hooks, works seamlessly with Next.js 15 App Router
- **Interactive Features**: Built-in zoom, pan, drag, selection without custom implementation
- **MIT License**: Free forever with no licensing concerns
- **TypeScript**: Native TypeScript support with full type definitions
- **Bundle Size**: Lightweight, tree-shakeable, no heavy dependencies
- **Customization**: Nodes are React components allowing full Tailwind CSS styling

### Alternatives Considered

**Reagraph**: WebGL-based with promised high performance, but real-world usage reveals UI thread blocking (2+ seconds), expensive edge rendering, and scene dragging lag. The "raw" library state makes it less production-ready than React Flow.

**Cytoscape.js**: Powerful and well-established, but requires complex React integration (official wrapper abandoned 5 years ago), uses Canvas limiting customization flexibility, and has longer layout computation times (15 seconds for medium graphs).

### Implementation Notes
- Install: `pnpm add @xyflow/react`
- Use `"use client"` directive for Next.js App Router
- Import base styles: `import '@xyflow/react/dist/style.css'`
- For force-directed layout, integrate d3-force as shown in React Flow examples
- Implement viewport-based rendering for 1000+ nodes with `onlyRenderVisibleElements` prop
- Use `React.memo()` for custom node components to prevent unnecessary re-renders
- Clean up D3 force simulations in useEffect return functions to prevent memory leaks

---

## Decision 2: Wiki Link Parsing Strategy

### Question
How should `[[Wiki-style links]]` be parsed and rendered in the block-based rich text editor?

### Research Summary
Analyzed three approaches: real-time parsing with custom decorators, parse on save/blur, and AST transformation. Evaluated performance, user experience, and maintainability.

### Decision
**Real-time Parsing with Custom Decorators/Inline Elements**

### Rationale
This approach works best for NoteFlow because:
- **Performance**: Simple regex `/\[\[([^\]]+)\]\]/g` is fast and avoids catastrophic backtracking. Parse only changed blocks, not entire document.
- **User Experience**: Links render as you type providing instant visual confirmation, aligning with Notion/Obsidian UX patterns
- **Maintainability**: Extends existing `FormattedTextSegment` architecture in `/modules/notes/types/blocks.ts`
- **Type Safety**: Leverages existing TypeScript types

### Implementation Pattern

**Phase 1**: Extend type system to include `wikiLink` property in `FormattedTextSegment`:
```typescript
wikiLink?: {
  pageTitle: string;
  displayText?: string;
  exists: boolean;
}
```

**Phase 2**: Create parser in `/modules/notes/utils/wikiLinkParser.ts`:
- Extract wiki links with regex
- Support aliases: `[[Page Title|Display Text]]`
- Convert plain text to formatted segments
- Check note existence via Convex query (debounced)

**Phase 3**: Create rendering component `/modules/notes/components/WikiLink.tsx`:
- Blue color for existing notes (navigates on click)
- Purple + italic for non-existent notes (creates on click)
- Show "+" indicator for creation links

**Phase 4**: Integrate with existing block rendering in TextBlock, HeadingBlock, etc.

**Phase 5**: Real-time parsing in RichEditor.tsx using `handleBlockChange`

### Alternatives Considered

**Parse on Save/Blur Only**: Better typing performance and simpler implementation, but delayed visual feedback causes user confusion about link syntax.

**AST Transformation (markdown-it/remark)**: Robust parsing that handles complex markdown, but heavyweight and doesn't fit block-based architecture. Overkill for wiki links alone.

### Edge Cases Handled
- Escaped brackets: `\[\[Not a Link\]\]`
- Nested brackets: `[[Note with [square] brackets]]`
- Special characters: `[[Note: Plan & Design]]`, `[[Café ☕ Notes]]`
- Empty links: `[[]]` → invalid
- Very long titles: Truncate display to 100 characters
- Circular references: Track visited notes during traversal
- Case-insensitive matching: `[[project plan]]` matches "Project Plan"

---

## Decision 3: Convex Schema and Query Patterns

### Question
What is the optimal Convex schema design and query pattern for bidirectional links and backlinks?

### Research Summary
Compared separate links table vs embedded arrays in notes. Evaluated schema design, index optimization, query patterns, update strategies, and performance implications.

### Decision
**Separate `noteLinks` Junction Table**

### Rationale
Superior to embedded arrays because:
- **Scalability**: Notes with 500+ backlinks won't bloat the note document
- **Efficient Queries**: Indexed lookups are O(log n) vs array scans O(n)
- **Context Preservation**: Can store surrounding text for backlink previews
- **No Array Limitations**: Convex limits arrays to 8,192 items
- **Atomic Updates**: Mutations are transactional - update both records safely
- **Cannot Index Arrays**: Convex doesn't support array indexes - forces full table scans

### Schema Design

```typescript
noteLinks: defineTable({
  sourceNoteId: v.id("notes"),      // Note containing the link
  targetNoteId: v.id("notes"),      // Note being referenced
  linkText: v.string(),             // Text in [[brackets]]
  contextBefore: v.optional(v.string()), // 50 chars before link
  contextAfter: v.optional(v.string()),  // 50 chars after link
  blockId: v.optional(v.string()),  // Which block contains the link
  createdAt: v.number(),
  userId: v.id("users"),            // For access control
})
```

### Key Indexes

**Critical** (Must Have):
1. `by_target` - Fast backlink queries (most frequent operation)
2. `by_source` - Get all outgoing links from a note
3. `by_source_and_target` - Duplicate prevention, uniqueness check

**Performance** (Highly Recommended):
4. `by_target_and_user` - User-scoped backlinks (security + performance)
5. `by_user_created` - Recent activity tracking

### Query Patterns

**Backlinks Query** (Real-Time):
```typescript
const links = await ctx.db
  .query("noteLinks")
  .withIndex("by_target_and_user", (q) =>
    q.eq("targetNoteId", noteId).eq("userId", userId)
  )
  .order("desc")
  .take(50);
```

**Performance**: ~1ms indexed lookup + ~1ms per enrichment = ~50ms for 50 backlinks

**Pagination** (For 500+ backlinks):
```typescript
await ctx.db
  .query("noteLinks")
  .withIndex("by_target_and_user", (q) => ...)
  .paginate(paginationOpts);
```

### Update Strategy

**Link Creation**: On save/blur, extract all links from note content, sync with database (create/update/delete as needed)

**Note Rename**: Query all backlinks using `by_target` index, update `linkText` for each in parallel (~500ms for 100 backlinks)

**Note Deletion**: Query both outgoing (`by_source`) and incoming (`by_target`) links in parallel, delete all links, then soft-delete note

### Performance Optimizations

1. **Index Optimization**: Use multi-field indexes (`["targetNoteId", "userId"]`) for compound queries
2. **Parallel Execution**: Convex allows concurrent reads without locking
3. **Automatic Caching**: Query results cached and invalidate on document changes
4. **Pagination**: For notes with 1000+ backlinks, use `.paginate()` and virtual scrolling

### Alternatives Considered

**Embedded Arrays in Notes**: Only viable for < 100 links per note. Cannot create indexes on arrays in Convex, forcing full table scans for backlinks. Bloats note documents and hits 8,192 item array limit.

---

## Dependencies Resolved

### Existing Note System
- **Status**: ✅ Available
- **Location**: `/convex/notes.ts`, `/convex/schema.ts`
- **Notes**: Current schema supports `userId`, `folderId`, `title`, `content`. Will be extended with link counts.

### Search Infrastructure
- **Status**: ✅ Available
- **Location**: Convex schema includes `searchIndex` for title and content
- **Notes**: Can use existing search for link suggestions and note title matching

### Real-time Updates
- **Status**: ✅ Available (Convex Native)
- **Notes**: Convex queries are reactive by default. Backlinks panel will auto-update when links created/deleted.

### Rich Text Editor
- **Status**: ✅ Available
- **Location**: `/modules/notes/components/rich-editor/`, `/modules/notes/types/blocks.ts`
- **Notes**: Block-based editor with `FormattedTextSegment` architecture. Perfect foundation for wiki link rendering.

### Graph Visualization Library
- **Status**: ⚠️ Needs Installation
- **Action**: Add `@xyflow/react` to package.json
- **Notes**: React Flow chosen for optimal React integration and performance

---

## Technical Constraints Resolved

### Performance Goals
- **Backlinks < 100ms**: ✅ Achievable with indexed queries (~1ms + enrichment)
- **Link creation < 5 seconds**: ✅ Parser runs in < 100ms
- **Graph load < 2 seconds for 1000 notes**: ✅ React Flow handles 5000+ nodes
- **Graph 60 FPS at 500 nodes**: ✅ React Flow viewport optimization

### Scale/Scope
- **Support 10,000 notes**: ✅ Indexed queries scale logarithmically
- **Support 500+ backlinks per note**: ✅ Pagination pattern handles this
- **Real-time updates**: ✅ Convex reactive queries

### Storage
- **Convex Database**: ✅ Current backend, perfect for real-time sync
- **Link Storage**: Separate `noteLinks` table with 5 critical indexes
- **Context Storage**: Store 50 chars before/after each link for previews

---

## Open Technical Questions

None remaining. All critical technical decisions have been researched and resolved with concrete recommendations.
