# Convex API Contracts: Bi-Directional Links

**Feature**: 003-bidirectional-links
**Date**: 2025-10-24

This document defines the Convex queries and mutations for the bi-directional links feature.

---

## Queries

### `noteLinks.getBacklinks`

Get all notes that link to the specified note (backlinks).

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Target note ID
  userId: Id<"users">,      // Required: Current user ID
  limit?: number,           // Optional: Max results (default: 50)
}
```

**Returns**:
```typescript
Array<{
  _id: Id<"noteLinks">,
  sourceNoteId: Id<"notes">,
  targetNoteId: Id<"notes">,
  linkText: string,
  contextBefore?: string,
  contextAfter?: string,
  blockId?: string,
  createdAt: number,
  sourceNote: {
    _id: Id<"notes">,
    title: string,
    updatedAt: number,
  } | null,
}>
```

**Performance**: < 100ms for 50 backlinks
**Caching**: Automatic via Convex
**Real-time**: Yes, auto-updates when links change

---

### `noteLinks.getOutgoingLinks`

Get all links contained within the specified note.

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Source note ID
  userId: Id<"users">,      // Required: Current user ID
}
```

**Returns**:
```typescript
Array<{
  _id: Id<"noteLinks">,
  sourceNoteId: Id<"notes">,
  targetNoteId: Id<"notes">,
  linkText: string,
  contextBefore?: string,
  contextAfter?: string,
  blockId?: string,
  createdAt: number,
  targetNote: {
    _id: Id<"notes">,
    title: string,
    exists: boolean,
  } | null,
}>
```

**Performance**: < 50ms for typical notes
**Caching**: Automatic via Convex
**Real-time**: Yes

---

### `noteLinks.getNoteWithBacklinks`

Get note data and backlinks in a single optimized query.

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Note ID
  userId: Id<"users">,      // Required: Current user ID
}
```

**Returns**:
```typescript
{
  note: Note,
  backlinks: Array<BacklinkWithSource>,
  backlinkCount: number,
  outgoingLinksCount: number,
  isOrphan: boolean,
} | null
```

**Performance**: < 100ms for notes with 100 backlinks
**Caching**: Automatic via Convex
**Real-time**: Yes

---

### `noteLinks.getBacklinksPaginated`

Get backlinks with pagination for notes with many backlinks.

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Target note ID
  userId: Id<"users">,      // Required: Current user ID
  paginationOpts: PaginationOptions,
}
```

**Returns**:
```typescript
{
  page: Array<BacklinkWithSource>,
  isDone: boolean,
  continueCursor: string,
  pageStatus: "SplitRecommended" | "SplitRequired" | "CanContinue",
}
```

**Performance**: < 100ms per page
**Page Size**: 50 items (configurable)
**Use Case**: Notes with 500+ backlinks

---

### `notes.findNoteByTitle`

Find a note by its title (case-insensitive).

**Arguments**:
```typescript
{
  title: string,            // Required: Note title to search
  userId: Id<"users">,      // Required: Current user ID
}
```

**Returns**:
```typescript
{
  _id: Id<"notes">,
  title: string,
  exists: true,
} | {
  title: string,
  exists: false,
} | null
```

**Performance**: < 10ms (uses search index)
**Caching**: Automatic via Convex
**Use Case**: Check if [[linked note]] exists

---

### `noteLinks.getOrphanNotes`

Get all notes with zero incoming and outgoing links.

**Arguments**:
```typescript
{
  userId: Id<"users">,      // Required: Current user ID
}
```

**Returns**:
```typescript
Array<{
  _id: Id<"notes">,
  title: string,
  content: string,
  createdAt: number,
  updatedAt: number,
}>
```

**Performance**: O(n) where n = note count, < 1s for 10,000 notes
**Caching**: Automatic via Convex
**Real-time**: Yes

---

### `noteLinks.getGraphData`

Get all notes and links for graph visualization.

**Arguments**:
```typescript
{
  userId: Id<"users">,      // Required: Current user ID
  limit?: number,           // Optional: Max notes (default: 1000)
}
```

**Returns**:
```typescript
{
  nodes: Array<{
    id: Id<"notes">,
    title: string,
    linksCount: number,      // Total connections
    isHub: boolean,          // Has 10+ connections
    isOrphan: boolean,       // Has 0 connections
  }>,
  edges: Array<{
    id: Id<"noteLinks">,
    source: Id<"notes">,
    target: Id<"notes">,
    linkText: string,
  }>,
  stats: {
    totalNotes: number,
    totalLinks: number,
    orphanCount: number,
    hubCount: number,
  },
}
```

**Performance**: < 2 seconds for 1000 notes
**Caching**: Automatic via Convex
**Use Case**: Graph view component

---

## Mutations

### `noteLinks.syncNoteLinks`

Sync all links in a note (create/update/delete as needed).

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Note being edited
  userId: Id<"users">,      // Required: Current user ID
  extractedLinks: Array<{   // Required: Links parsed from content
    targetTitle: string,
    blockId: string,
    contextBefore: string,
    contextAfter: string,
  }>,
}
```

**Returns**:
```typescript
{
  success: boolean,
  created: number,          // Count of new links created
  updated: number,          // Count of links updated
  deleted: number,          // Count of links removed
}
```

**Performance**: < 500ms for 50 links
**Side Effects**:
- Creates new notes for non-existent [[links]]
- Deletes links no longer in content
- Updates context for existing links
- Triggers real-time updates for backlinks

---

### `noteLinks.createLink`

Create a single link between two notes.

**Arguments**:
```typescript
{
  sourceNoteId: Id<"notes">,      // Required: Note containing link
  targetNoteId: Id<"notes">,      // Required: Note being referenced
  linkText: string,               // Required: Display text
  contextBefore?: string,         // Optional: Surrounding context
  contextAfter?: string,          // Optional: Surrounding context
  blockId?: string,               // Optional: Block ID
  userId: Id<"users">,            // Required: Current user ID
}
```

**Returns**:
```typescript
{
  linkId: Id<"noteLinks">,
  created: boolean,               // true if new, false if updated
}
```

**Performance**: < 50ms
**Side Effects**:
- Updates existing link if source-target pair exists
- Triggers backlink updates

---

### `noteLinks.deleteLink`

Delete a specific link.

**Arguments**:
```typescript
{
  linkId: Id<"noteLinks">,  // Required: Link to delete
  userId: Id<"users">,      // Required: Current user ID
}
```

**Returns**:
```typescript
{
  success: boolean,
  deleted: boolean,
}
```

**Performance**: < 10ms
**Side Effects**: Triggers backlink updates

---

### `notes.renameNoteAndUpdateLinks`

Rename a note and update all link texts referencing it.

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Note to rename
  newTitle: string,         // Required: New title (1-500 chars)
}
```

**Returns**:
```typescript
{
  success: boolean,
  linksUpdated: number,     // Count of backlinks updated
}
```

**Performance**: < 500ms for 100 backlinks
**Side Effects**:
- Updates note title
- Updates `linkText` for all backlinks
- Triggers real-time updates across app

---

### `notes.deleteNoteAndLinks`

Delete a note and all its associated links.

**Arguments**:
```typescript
{
  noteId: Id<"notes">,      // Required: Note to delete
}
```

**Returns**:
```typescript
{
  success: boolean,
  linksDeleted: number,     // Total links removed (in + out)
}
```

**Performance**: < 200ms for 200 total links
**Side Effects**:
- Soft-deletes note (sets `isDeleted: true`)
- Deletes all outgoing links
- Deletes all backlinks
- Triggers real-time updates

---

## Error Handling

### Standard Error Responses

All queries and mutations may throw these errors:

```typescript
// Validation errors
throw new ConvexError("Link text must be 1-500 characters");
throw new ConvexError("Source note does not exist");
throw new ConvexError("User does not own this note");

// Not found errors
throw new ConvexError("Note not found");
throw new ConvexError("Link not found");

// Permission errors
throw new ConvexError("Unauthorized: cannot access other users' notes");
```

### Frontend Error Handling

```typescript
// In React component
try {
  await syncNoteLinks({ noteId, userId, extractedLinks });
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.data);
  } else {
    toast.error("Failed to sync links. Please try again.");
  }
}
```

---

## Rate Limiting

Convex has built-in rate limiting:

- **Queries**: Unlimited (cached)
- **Mutations**: 1000/min per user (generous for note-taking)
- **Pagination**: Recommended page size 50 items

---

## Real-Time Subscriptions

All queries support real-time subscriptions via `useQuery`:

```typescript
// Automatically updates when backlinks change
const backlinks = useQuery(api.noteLinks.getBacklinks, {
  noteId: currentNoteId,
  userId: currentUserId,
});

// Loading state
if (backlinks === undefined) return <Skeleton />;

// Render backlinks
return backlinks.map(link => <BacklinkItem key={link._id} {...link} />);
```

**Performance Note**: Convex caches query results and only pushes updates when subscribed data changes. No polling required.

---

## Security & Access Control

### User Isolation

All queries and mutations **MUST** filter by `userId`:

```typescript
// GOOD: Filters by user
await ctx.db
  .query("noteLinks")
  .withIndex("by_target_and_user", q =>
    q.eq("targetNoteId", noteId).eq("userId", userId)
  )
  .collect();

// BAD: Leaks other users' links
await ctx.db
  .query("noteLinks")
  .withIndex("by_target", q => q.eq("targetNoteId", noteId))
  .collect();
```

### Validation Checks

```typescript
// Always validate ownership
const note = await ctx.db.get(noteId);
if (!note || note.userId !== userId) {
  throw new ConvexError("Unauthorized");
}

// Always validate input
if (linkText.trim().length === 0 || linkText.length > 500) {
  throw new ConvexError("Invalid link text");
}
```

---

## Testing Contracts

### Unit Tests

```typescript
// Test backlinks query
describe("getBacklinks", () => {
  it("returns only links for specified note", async () => {
    // Setup: Create 3 notes with links
    // Test: Query backlinks
    // Assert: Returns correct links
  });

  it("filters by userId", async () => {
    // Setup: Create links from different users
    // Test: Query with userId
    // Assert: Only returns user's links
  });

  it("respects limit parameter", async () => {
    // Setup: Create 100 backlinks
    // Test: Query with limit=50
    // Assert: Returns exactly 50
  });
});
```

### Integration Tests

```typescript
// Test full link lifecycle
describe("Link Lifecycle", () => {
  it("creates, updates, and deletes links correctly", async () => {
    // 1. syncNoteLinks creates new links
    // 2. Edit note content
    // 3. syncNoteLinks updates links
    // 4. Remove link from content
    // 5. syncNoteLinks deletes link
    // Assert: Database state correct at each step
  });

  it("maintains referential integrity on note delete", async () => {
    // 1. Create note A linking to note B
    // 2. Delete note B
    // 3. Assert: Link from A to B deleted
    // 4. Assert: Backlink count updated
  });
});
```

---

## Performance Benchmarks

| Operation | Target | Expected | Max Acceptable |
|-----------|--------|----------|----------------|
| Get backlinks (50) | < 100ms | ~50ms | 200ms |
| Get outgoing links | < 50ms | ~20ms | 100ms |
| Sync note links (50) | < 500ms | ~300ms | 1000ms |
| Rename + update (100) | < 500ms | ~400ms | 1000ms |
| Delete + cleanup (200) | < 500ms | ~300ms | 1000ms |
| Graph data (1000 notes) | < 2s | ~1.5s | 3s |
| Orphan detection (10k) | < 1s | ~800ms | 2s |

---

## API Versioning

Current version: **v1**

No breaking changes expected. Future enhancements may include:
- Block-level links (v2)
- Link annotations (v2)
- Graph filtering APIs (v2)
- Link analytics (v2)

All changes will be additive (new fields, new queries) to maintain backward compatibility.
