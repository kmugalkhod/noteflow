# Quick Start Guide: Bi-Directional Links

**Feature**: 003-bidirectional-links
**Date**: 2025-10-24
**For**: Developers implementing this feature

This guide helps you get started with implementing bi-directional links in NoteFlow.

---

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ pnpm installed
- ✅ Convex CLI installed (`pnpm add -g convex`)
- ✅ NoteFlow repository cloned
- ✅ Development server running (`pnpm dev`)
- ✅ Convex dev environment set up

---

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd /Users/kunal007/projects/noteflow

# Install React Flow for graph visualization
pnpm add @xyflow/react

# Install types (if needed)
pnpm add -D @types/react
```

### 2. Verify Existing Setup

Check that these files exist:
```bash
# Existing schema
ls convex/schema.ts

# Existing editor
ls modules/notes/components/rich-editor/RichEditor.tsx

# Existing types
ls modules/notes/types/blocks.ts
```

---

## Implementation Phases

### Phase 1: Database Schema (Day 1)

**Goal**: Add `noteLinks` table to Convex

**Files to modify**:
- `/Users/kunal007/projects/noteflow/convex/schema.ts`

**Steps**:

1. Open `convex/schema.ts`
2. Add the new `noteLinks` table:

```typescript
noteLinks: defineTable({
  sourceNoteId: v.id("notes"),
  targetNoteId: v.id("notes"),
  linkText: v.string(),
  contextBefore: v.optional(v.string()),
  contextAfter: v.optional(v.string()),
  blockId: v.optional(v.string()),
  userId: v.id("users"),
  createdAt: v.number(),
})
  .index("by_source", ["sourceNoteId"])
  .index("by_target", ["targetNoteId"])
  .index("by_user", ["userId"])
  .index("by_source_and_target", ["sourceNoteId", "targetNoteId"])
  .index("by_target_and_user", ["targetNoteId", "userId"])
  .index("by_user_created", ["userId", "createdAt"]),
```

3. Push schema changes:
```bash
convex dev
# Schema will auto-deploy
```

4. Verify in Convex dashboard:
   - Go to https://dashboard.convex.dev
   - Check that `noteLinks` table exists with 6 indexes

**Testing**:
```bash
# Run Convex console
npx convex dev

# In console:
await db.insert("noteLinks", {
  sourceNoteId: "j57...", // Replace with real ID
  targetNoteId: "j58...", // Replace with real ID
  linkText: "Test Link",
  userId: "j56...",       // Replace with real user ID
  createdAt: Date.now(),
});

# Verify insert worked
await db.query("noteLinks").collect();
```

---

### Phase 2: Link Parsing (Days 2-3)

**Goal**: Parse `[[Wiki Links]]` from note content

**Files to create**:
1. `/Users/kunal007/projects/noteflow/modules/notes/utils/wikiLinkParser.ts`
2. `/Users/kunal007/projects/noteflow/modules/notes/components/WikiLink.tsx`

**Files to modify**:
1. `/Users/kunal007/projects/noteflow/modules/notes/types/blocks.ts`

**Steps**:

1. **Extend TypeScript types**:

Add to `modules/notes/types/blocks.ts`:
```typescript
export interface FormattedTextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: TextColor;
  backgroundColor?: TextColor;

  // NEW
  wikiLink?: {
    pageTitle: string;
    displayText?: string;
    exists: boolean;
  };
}
```

2. **Create wiki link parser**:

Create `modules/notes/utils/wikiLinkParser.ts` (see data-model.md for full code)

3. **Create WikiLink component**:

Create `modules/notes/components/WikiLink.tsx`:
```typescript
"use client";

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface WikiLinkProps {
  pageTitle: string;
  displayText?: string;
  exists: boolean;
}

export function WikiLink({ pageTitle, displayText, exists }: WikiLinkProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement navigation/creation logic
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1 transition-colors cursor-pointer",
        exists
          ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50"
          : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 italic",
      )}
    >
      {displayText || pageTitle}
      {!exists && <span className="text-xs">+</span>}
    </a>
  );
}
```

**Testing**:
```typescript
// Test in React component
import { parseWikiLinks } from '@/modules/notes/utils/wikiLinkParser';

const content = "Check out [[Project Plan]] and [[Meeting Notes]]";
const links = parseWikiLinks(content);

console.log(links);
// Expected: [
//   { pageTitle: "Project Plan", displayText: "Project Plan", ... },
//   { pageTitle: "Meeting Notes", displayText: "Meeting Notes", ... }
// ]
```

---

### Phase 3: Convex Queries (Days 4-5)

**Goal**: Create queries for backlinks, outgoing links, and graph data

**Files to create**:
- `/Users/kunal007/projects/noteflow/convex/noteLinks.ts`

**Steps**:

1. Create `convex/noteLinks.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all backlinks for a note
export const getBacklinks = query({
  args: {
    noteId: v.id("notes"),
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { noteId, userId, limit = 50 }) => {
    const links = await ctx.db
      .query("noteLinks")
      .withIndex("by_target_and_user", (q) =>
        q.eq("targetNoteId", noteId).eq("userId", userId)
      )
      .order("desc")
      .take(limit);

    // Enrich with source note data
    const backlinksWithNotes = await Promise.all(
      links.map(async (link) => {
        const sourceNote = await ctx.db.get(link.sourceNoteId);
        return {
          ...link,
          sourceNote: sourceNote ? {
            _id: sourceNote._id,
            title: sourceNote.title,
            updatedAt: sourceNote.updatedAt,
          } : null,
        };
      })
    );

    return backlinksWithNotes.filter(b => b.sourceNote !== null);
  },
});

// Add more queries from contracts/convex-api.md
```

2. Update `convex/_generated/api.d.ts` by running:
```bash
convex dev
# Types auto-generate
```

**Testing**:
```bash
# In Convex dashboard console
await Query.noteLinks.getBacklinks({
  noteId: "j58...",
  userId: "j56...",
  limit: 10
});
```

---

### Phase 4: Backlinks UI (Days 6-7)

**Goal**: Display backlinks panel in note editor

**Files to create**:
- `/Users/kunal007/projects/noteflow/modules/notes/components/BacklinksPanel.tsx`

**Files to modify**:
- `/Users/kunal007/projects/noteflow/modules/notes/components/note-editor/note-editor.tsx`

**Steps**:

1. **Create BacklinksPanel component**:

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface BacklinksPanelProps {
  noteId: Id<"notes">;
  userId: Id<"users">;
}

export function BacklinksPanel({ noteId, userId }: BacklinksPanelProps) {
  const router = useRouter();
  const backlinks = useQuery(api.noteLinks.getBacklinks, {
    noteId,
    userId,
    limit: 50,
  });

  if (!backlinks) return <div>Loading backlinks...</div>;

  if (backlinks.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No notes link to this page yet
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold">Backlinks ({backlinks.length})</h3>
      {backlinks.map((link) => (
        <div
          key={link._id}
          onClick={() => router.push(`/note/${link.sourceNote?._id}`)}
          className="p-2 rounded hover:bg-accent cursor-pointer"
        >
          <div className="font-medium text-sm">{link.sourceNote?.title}</div>
          {link.contextBefore && (
            <div className="text-xs text-muted-foreground truncate">
              ...{link.contextBefore} <span className="text-blue-600">[[{link.linkText}]]</span> {link.contextAfter}...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

2. **Add to note editor**:

In `modules/notes/components/note-editor/note-editor.tsx`, add:
```typescript
import { BacklinksPanel } from '../BacklinksPanel';

// Inside component
<div className="flex">
  <div className="flex-1">
    {/* Existing editor content */}
  </div>
  <div className="w-80 border-l">
    <BacklinksPanel noteId={noteId} userId={userId} />
  </div>
</div>
```

**Testing**:
1. Create two notes
2. Add `[[Note B]]` link in Note A
3. Open Note B
4. Verify backlinks panel shows "Note A"

---

### Phase 5: Graph View (Days 8-10)

**Goal**: Interactive knowledge graph visualization

**Files to create**:
- `/Users/kunal007/projects/noteflow/modules/notes/components/GraphView.tsx`
- `/Users/kunal007/projects/noteflow/app/(dashboard)/graph/page.tsx`

**Steps**:

1. **Create GraphView component**:

```typescript
"use client";

import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function GraphView({ userId }: { userId: Id<"users"> }) {
  const graphData = useQuery(api.noteLinks.getGraphData, { userId });

  if (!graphData) return <div>Loading graph...</div>;

  const nodes: Node[] = graphData.nodes.map(node => ({
    id: node.id,
    data: { label: node.title },
    position: { x: Math.random() * 500, y: Math.random() * 500 },
    style: {
      width: node.isHub ? 100 : 60,
      fontSize: node.isHub ? 14 : 12,
    },
  }));

  const edges: Edge[] = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

2. **Create graph page**:

Create `app/(dashboard)/graph/page.tsx`:
```typescript
import { GraphView } from "@/modules/notes/components/GraphView";
import { useConvexUser } from "@/modules/shared/hooks/use-convex-user";

export default function GraphPage() {
  const user = useConvexUser();
  if (!user) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <GraphView userId={user._id} />
    </div>
  );
}
```

3. **Add navigation link**:

In sidebar, add:
```typescript
<Link href="/graph">
  <NetworkIcon className="w-4 h-4" />
  Graph View
</Link>
```

**Testing**:
1. Navigate to `/graph`
2. Verify nodes appear for all notes
3. Verify edges connect linked notes
4. Test zoom, pan, click interactions

---

## Development Workflow

### Running the App

```bash
# Terminal 1: Convex backend
convex dev

# Terminal 2: Next.js frontend
pnpm dev

# Open browser
open http://localhost:3001
```

### Testing Changes

```bash
# Run TypeScript check
pnpm tsc --noEmit

# Run linter
pnpm lint

# Test in browser
# 1. Create test notes
# 2. Add [[links]]
# 3. Check backlinks panel
# 4. Check graph view
```

### Debugging

**Convex Queries**:
- Use Convex dashboard: https://dashboard.convex.dev
- Check "Logs" tab for errors
- Use "Data" tab to inspect tables

**React Components**:
- Use React DevTools
- Check console for errors
- Add `console.log()` in components

**Performance**:
- Use Chrome DevTools Performance tab
- Check React Profiler
- Monitor Convex query times in dashboard

---

## Common Issues

### Issue: "Cannot find module '@xyflow/react'"

**Solution**:
```bash
pnpm add @xyflow/react
# Restart dev server
```

### Issue: "noteLinks table does not exist"

**Solution**:
```bash
# Ensure Convex is running
convex dev

# Check schema deployed
convex dashboard
```

### Issue: "Links not updating in real-time"

**Solution**:
- Ensure using `useQuery` not `useMutation`
- Check Convex connection in browser console
- Verify `userId` passed correctly

### Issue: "Graph view is slow with 1000+ notes"

**Solution**:
- Implement viewport-based rendering
- Add `onlyRenderVisibleElements` prop
- Use `React.memo()` for custom nodes

---

## Next Steps

After completing basic implementation:

1. **Add link suggestions** (P4 feature)
2. **Implement orphan detection** (P5 feature)
3. **Add graph filters** (future enhancement)
4. **Optimize performance** (as needed)

---

## Resources

- **Convex Docs**: https://docs.convex.dev
- **React Flow Docs**: https://reactflow.dev
- **NoteFlow Architecture**: See `/docs/architecture.md`
- **Feature Spec**: See `specs/003-bidirectional-links/spec.md`
- **Data Model**: See `specs/003-bidirectional-links/data-model.md`
- **API Contracts**: See `specs/003-bidirectional-links/contracts/convex-api.md`

---

## Getting Help

- **Convex Discord**: https://convex.dev/community
- **React Flow Discord**: https://discord.gg/Bqt6xrs
- **Team**: Post in #noteflow-dev Slack channel

---

## Success Criteria Checklist

After implementation, verify:

- [ ] ✅ Can create links with `[[syntax]]` in under 5 seconds
- [ ] ✅ Backlinks appear in panel within 100ms
- [ ] ✅ Graph loads in under 2 seconds for 1000 notes
- [ ] ✅ Link suggestions appear within 500ms
- [ ] ✅ 100% bidirectional accuracy (every link has backlink)
- [ ] ✅ Note rename updates all links in under 500ms
- [ ] ✅ Graph maintains 60 FPS when zooming/panning

---

**Happy coding! 🚀**
