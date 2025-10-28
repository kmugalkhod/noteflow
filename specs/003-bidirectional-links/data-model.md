# Data Model: Bi-Directional Links

**Feature**: 003-bidirectional-links
**Date**: 2025-10-24

This document defines the data entities, relationships, and validation rules for the bi-directional links feature.

---

## Entity: noteLinks (New)

### Description
Junction table that stores bidirectional link relationships between notes. Each record represents one link from a source note to a target note, with context for display in backlinks panel.

### Fields

| Field Name | Type | Required | Description | Validation Rules |
|------------|------|----------|-------------|------------------|
| `sourceNoteId` | `Id<"notes">` | ✅ Yes | Note containing the link | Must reference existing note |
| `targetNoteId` | `Id<"notes">` | ✅ Yes | Note being referenced | Must reference existing note |
| `linkText` | `string` | ✅ Yes | Text displayed in link | 1-500 characters, trimmed |
| `contextBefore` | `string` | ❌ No | 50 chars before link | Max 100 characters |
| `contextAfter` | `string` | ❌ No | 50 chars after link | Max 100 characters |
| `blockId` | `string` | ❌ No | Block containing the link | UUID format |
| `userId` | `Id<"users">` | ✅ Yes | Owner of source note | Must match source note's userId |
| `createdAt` | `number` | ✅ Yes | Unix timestamp | Auto-set by system |

### Indexes

```typescript
.index("by_source", ["sourceNoteId"])                      // Get all outgoing links
.index("by_target", ["targetNoteId"])                      // Get all backlinks
.index("by_user", ["userId"])                              // Filter by user
.index("by_source_and_target", ["sourceNoteId", "targetNoteId"])  // Check duplicates
.index("by_target_and_user", ["targetNoteId", "userId"])   // Backlinks per user
.index("by_user_created", ["userId", "createdAt"])         // Recent links
```

### Relationships

- **Many-to-One** with `notes` (source)
  - Each link belongs to one source note
  - One note can have many outgoing links

- **Many-to-One** with `notes` (target)
  - Each link references one target note
  - One note can have many backlinks (incoming links)

- **Many-to-One** with `users`
  - Each link belongs to one user
  - One user can have many links

### State Transitions

```
[Not Exists] → CREATE → [Active Link]
[Active Link] → UPDATE (context changed) → [Active Link]
[Active Link] → DELETE (note deleted or link removed) → [Not Exists]
```

### Business Rules

1. **Uniqueness**: One link per source-target pair per block
2. **Referential Integrity**: Both source and target notes must exist
3. **User Isolation**: Links only visible to owning user
4. **Cascade Delete**: When source or target note is deleted, link is deleted
5. **Context Capture**: Store surrounding text for backlink previews

---

## Entity: notes (Enhanced)

### Description
Existing notes table with new computed fields for link statistics.

### New Computed Fields

These fields are **not stored** in the database but computed on-the-fly in queries:

| Field Name | Type | Description | Computation |
|------------|------|-------------|-------------|
| `outgoingLinksCount` | `number` | Count of links from this note | Count `noteLinks` where `sourceNoteId = note._id` |
| `incomingLinksCount` | `number` | Count of backlinks to this note | Count `noteLinks` where `targetNoteId = note._id` |
| `isOrphan` | `boolean` | Has zero connections | `outgoingLinksCount === 0 && incomingLinksCount === 0` |

### Why Not Stored?

- **Data Consistency**: Counts auto-update when links change
- **No Stale Data**: No risk of count drift
- **Convex Performance**: Queries execute near database, counts are fast
- **Simplified Mutations**: No need to update counts in multiple places

### Usage Example

```typescript
// In Convex query
export const getNoteWithLinkStats = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const note = await ctx.db.get(noteId);
    if (!note) return null;

    const [outgoing, incoming] = await Promise.all([
      ctx.db.query("noteLinks")
        .withIndex("by_source", q => q.eq("sourceNoteId", noteId))
        .collect(),
      ctx.db.query("noteLinks")
        .withIndex("by_target", q => q.eq("targetNoteId", noteId))
        .collect(),
    ]);

    return {
      ...note,
      outgoingLinksCount: outgoing.length,
      incomingLinksCount: incoming.length,
      isOrphan: outgoing.length === 0 && incoming.length === 0,
    };
  },
});
```

---

## Entity: FormattedTextSegment (Enhanced)

### Description
Existing TypeScript type for formatted text in blocks, extended to support wiki links.

### Location
`/Users/kunal007/projects/noteflow/modules/notes/types/blocks.ts`

### New Field

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

  // NEW: Wiki link properties
  wikiLink?: {
    pageTitle: string;       // The note title being linked to
    displayText?: string;    // Optional alias (for [[Note Title|Display Text]])
    exists: boolean;         // Whether target note exists
  };
}
```

### Validation Rules

- `wikiLink.pageTitle`: Required if `wikiLink` present, 1-500 characters
- `wikiLink.displayText`: Optional, 1-500 characters
- `wikiLink.exists`: Boolean, computed by querying notes table
- Text cannot be empty if `wikiLink` is present

---

## Data Flow Diagrams

### Create Link Flow

```
User Types [[Note Title]]
         ↓
Parse Content (Frontend)
         ↓
Check Note Exists (Convex Query)
         ↓
Render as WikiLink Component
         ↓
User Saves Note
         ↓
Extract All Links (Regex)
         ↓
Sync Links (Convex Mutation)
    ├─→ Create new links
    ├─→ Update existing links
    └─→ Delete removed links
         ↓
Trigger Real-Time Updates
    ├─→ Backlinks panel refreshes
    ├─→ Link counts update
    └─→ Graph view updates
```

### Backlinks Query Flow

```
User Opens Note
         ↓
Query Note + Backlinks (Parallel)
    ├─→ Get note data
    └─→ Query noteLinks.by_target_and_user
         ↓
Enrich with Source Notes (Parallel)
         ↓
Display in Backlinks Panel
    ├─→ Source note title
    ├─→ Context preview
    └─→ Click to navigate
```

### Note Rename Flow

```
User Renames Note
         ↓
Update Note Title (Mutation)
         ↓
Query All Backlinks
    └─→ noteLinks.by_target
         ↓
Update Each Link (Parallel)
    └─→ Set linkText = newTitle
         ↓
Real-Time Updates Propagate
    ├─→ All notes with links update
    └─→ Backlinks panels update
```

---

## Data Validation Rules

### noteLinks Table

```typescript
// Validation functions
function validateLinkText(text: string): boolean {
  return text.trim().length >= 1 && text.trim().length <= 500;
}

function validateContext(context: string | undefined): boolean {
  if (!context) return true;
  return context.length <= 100;
}

function validateBlockId(blockId: string | undefined): boolean {
  if (!blockId) return true;
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(blockId);
}

async function validateLink(ctx: Context, link: LinkInput): Promise<string[]> {
  const errors: string[] = [];

  // Check link text
  if (!validateLinkText(link.linkText)) {
    errors.push("Link text must be 1-500 characters");
  }

  // Check source note exists
  const sourceNote = await ctx.db.get(link.sourceNoteId);
  if (!sourceNote) {
    errors.push("Source note does not exist");
  }

  // Check target note exists
  const targetNote = await ctx.db.get(link.targetNoteId);
  if (!targetNote) {
    errors.push("Target note does not exist");
  }

  // Check user ownership
  if (sourceNote && sourceNote.userId !== link.userId) {
    errors.push("User does not own source note");
  }

  // Check context lengths
  if (!validateContext(link.contextBefore)) {
    errors.push("Context before must be <= 100 characters");
  }
  if (!validateContext(link.contextAfter)) {
    errors.push("Context after must be <= 100 characters");
  }

  // Check block ID format
  if (!validateBlockId(link.blockId)) {
    errors.push("Invalid block ID format");
  }

  return errors;
}
```

### WikiLink Parsing

```typescript
// Edge case validation
function isValidWikiLink(match: string): boolean {
  // Check not empty
  if (match.trim().length === 0) return false;

  // Check no nested [[[[
  if (match.includes('[[[[')) return false;

  // Check balanced brackets
  const openCount = (match.match(/\[\[/g) || []).length;
  const closeCount = (match.match(/\]\]/g) || []).length;
  if (openCount !== closeCount) return false;

  return true;
}

function sanitizeNoteTitle(title: string): string {
  return title
    .trim()
    .substring(0, 500) // Enforce max length
    .replace(/[\r\n]/g, ' ') // No newlines in titles
    .replace(/\s+/g, ' '); // Collapse whitespace
}
```

---

## Performance Considerations

### Index Usage

All critical queries use indexes:

| Operation | Index Used | Complexity | Performance |
|-----------|-----------|------------|-------------|
| Get backlinks | `by_target_and_user` | O(log n) | ~1ms |
| Get outgoing links | `by_source` | O(log n) | ~1ms |
| Check duplicate | `by_source_and_target` | O(log n) | ~1ms |
| Recent activity | `by_user_created` | O(log n) | ~1ms |
| Count links | Index scan | O(k) | ~1ms per 100 items |

### Query Optimization

```typescript
// GOOD: Uses index, executes in ~1ms
const links = await ctx.db
  .query("noteLinks")
  .withIndex("by_target", q => q.eq("targetNoteId", noteId))
  .collect();

// BAD: Full table scan, O(n) where n = all links
const links = await ctx.db
  .query("noteLinks")
  .filter(q => q.eq(q.field("targetNoteId"), noteId))
  .collect();
```

### Caching Strategy

- **Convex Automatic Caching**: Query results cached, invalidate on document change
- **Frontend Caching**: Note existence cache in `useRef<Map<string, boolean>>`
- **Debouncing**: Parse links on blur or 300ms after typing stops
- **Memoization**: Use `React.memo()` for WikiLink components

---

## Migration Strategy

### Phase 1: Schema Addition

```typescript
// Add to convex/schema.ts
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
  .index("by_user_created", ["userId", "createdAt"]);
```

### Phase 2: Backfill Existing Notes

```typescript
// Optional: Parse existing note content for links
export const backfillLinks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allNotes = await ctx.db.query("notes").collect();

    for (const note of allNotes) {
      // Parse content for [[links]]
      const links = parseWikiLinks(note.content);

      // Create link records
      for (const link of links) {
        const targetNote = await findNoteByTitle(ctx, link.pageTitle, note.userId);
        if (targetNote) {
          await ctx.db.insert("noteLinks", {
            sourceNoteId: note._id,
            targetNoteId: targetNote._id,
            linkText: link.displayText,
            userId: note.userId,
            createdAt: Date.now(),
          });
        }
      }
    }
  },
});
```

### Phase 3: Gradual Rollout

1. Deploy schema changes (non-breaking, adds new table)
2. Enable link parsing in editor (hidden behind feature flag)
3. Backfill existing notes (background job)
4. Enable backlinks panel (new feature, no breaking changes)
5. Enable graph view (new feature, no breaking changes)

---

## Data Integrity Constraints

### Enforced by Schema

- `sourceNoteId` must be valid note ID (Convex validates)
- `targetNoteId` must be valid note ID (Convex validates)
- `userId` must be valid user ID (Convex validates)

### Enforced by Application Logic

- No duplicate links per source-target pair (check in mutation)
- Source note must belong to user (check in mutation)
- Link text must be non-empty and <= 500 chars (validate in mutation)
- Context strings must be <= 100 chars (validate in mutation)

### Maintained by Cascade Operations

- Delete note → Delete all related links (handled in `deleteNoteAndLinks` mutation)
- Rename note → Update all link texts (handled in `renameNoteAndUpdateLinks` mutation)

---

## Summary

This data model provides:

- ✅ **Scalable**: Separate table handles 10,000+ notes with 500+ backlinks each
- ✅ **Performant**: Indexed queries complete in < 100ms
- ✅ **Consistent**: Atomic mutations maintain referential integrity
- ✅ **Real-time**: Convex reactive queries auto-update UI
- ✅ **Extensible**: Easy to add metadata (view counts, timestamps, etc.)
- ✅ **Type-safe**: Full TypeScript support throughout stack
