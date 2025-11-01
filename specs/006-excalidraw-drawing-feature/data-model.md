# Data Model: Excalidraw Drawing Integration

**Feature**: 006-excalidraw-drawing-feature
**Date**: 2025-10-29

## Overview

This document defines the data model for the drawing feature, including database schema, entity relationships, and validation rules.

---

## Entities

### 1. Drawing

Represents a whiteboard drawing associated with a note.

#### Schema (Convex)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...

  drawings: defineTable({
    // Relationships
    noteId: v.id("notes"),        // Foreign key to notes table
    userId: v.id("users"),        // Owner of the drawing

    // Drawing data
    data: v.string(),             // Serialized tldraw data (compressed JSON)
    version: v.number(),          // Schema version for migrations (start at 1)

    // Metadata
    sizeBytes: v.number(),        // Size of compressed data in bytes
    elementCount: v.optional(v.number()), // Number of elements in drawing (for analytics)

    // Timestamps
    createdAt: v.number(),        // Unix timestamp (ms)
    updatedAt: v.number(),        // Unix timestamp (ms)

    // Soft delete
    isDeleted: v.optional(v.boolean()), // Soft delete flag
  })
    .index("by_note", ["noteId"])           // Query drawings by note
    .index("by_user", ["userId"])           // Query user's drawings
    .index("by_note_user", ["noteId", "userId"]) // Composite for auth checks
});
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noteId` | `Id<"notes">` | Yes | Reference to parent note |
| `userId` | `Id<"users">` | Yes | Owner (must match note owner) |
| `data` | `string` | Yes | Compressed tldraw JSON data |
| `version` | `number` | Yes | Schema version (for migrations) |
| `sizeBytes` | `number` | Yes | Compressed data size (for limits) |
| `elementCount` | `number` | No | Count of shapes/elements |
| `createdAt` | `number` | Yes | Creation timestamp |
| `updatedAt` | `number` | Yes | Last modification timestamp |
| `isDeleted` | `boolean` | No | Soft delete flag |

#### Validation Rules

1. **Size Limits**:
   - `sizeBytes` must be ≤ 500,000 (500 KB)
   - Warning threshold at 400,000 (400 KB)

2. **Ownership**:
   - `userId` must match authenticated user
   - `noteId` must exist and belong to same user

3. **Data Format**:
   - `data` must be valid compressed JSON string
   - Must decompress to valid tldraw store snapshot

4. **Version**:
   - `version` must be positive integer
   - Current version: `1`

#### State Transitions

```
[No Drawing] --create--> [Draft]
[Draft] --update--> [Draft]
[Draft] --delete--> [Soft Deleted]
[Soft Deleted] --restore--> [Draft]
[Soft Deleted] --permanent delete--> [Removed from DB]
```

---

### 2. Notes (Modified)

Existing `notes` table needs minimal modification.

#### Schema Changes

```typescript
// convex/schema.ts - MODIFIED
notes: defineTable({
  // ... existing fields ...

  // NEW: Optional reference to drawing (denormalized for performance)
  hasDrawing: v.optional(v.boolean()), // Quick check without querying drawings table
})
```

**Rationale**: `hasDrawing` flag avoids additional query when rendering note list. Updated when drawing is created/deleted.

---

## Relationships

### Drawing ↔ Note (One-to-One)

- **Relationship**: One note can have zero or one drawing
- **Foreign Key**: `drawings.noteId → notes._id`
- **Cascade Behavior**:
  - If note is deleted → soft delete associated drawing
  - If note is permanently deleted → permanently delete drawing
  - Drawing can be deleted independently

### Drawing ↔ User (Many-to-One)

- **Relationship**: One user can have many drawings
- **Foreign Key**: `drawings.userId → users._id`
- **Cascade Behavior**: User deletion cascades to all their drawings

---

## Data Format

### tldraw Store Snapshot

The `data` field contains compressed JSON of tldraw's store snapshot:

```typescript
// Uncompressed structure (for reference)
interface TLStoreSnapshot {
  store: {
    'document:document': TLDocument;
    'page:page1': TLPage;
    'shape:id1': TLShape; // rectangle, arrow, text, etc.
    'shape:id2': TLShape;
    // ... more shapes
    'instance:instance': TLInstance;
    'instance_page_state:page1': TLInstancePageState;
    // ... other records
  };
  schema: {
    schemaVersion: number;
    storeVersion: number;
    recordVersions: Record<string, number>;
  };
}
```

### Compression Strategy

```typescript
import LZString from 'lz-string';

// Before saving
const compressDrawing = (snapshot: TLStoreSnapshot): string => {
  const json = JSON.stringify(snapshot);
  return LZString.compressToUTF16(json);
};

// After loading
const decompressDrawing = (data: string): TLStoreSnapshot => {
  const json = LZString.decompressFromUTF16(data);
  return JSON.parse(json);
};
```

**Compression Ratio**: Typically 60-80% size reduction

---

## Indexes

### Primary Indexes

1. **by_note**: Query drawing for a specific note
   ```typescript
   const drawing = await ctx.db
     .query("drawings")
     .withIndex("by_note", (q) => q.eq("noteId", noteId))
     .first();
   ```

2. **by_user**: List all drawings for a user
   ```typescript
   const drawings = await ctx.db
     .query("drawings")
     .withIndex("by_user", (q) => q.eq("userId", userId))
     .collect();
   ```

3. **by_note_user**: Authorization checks
   ```typescript
   const drawing = await ctx.db
     .query("drawings")
     .withIndex("by_note_user", (q) =>
       q.eq("noteId", noteId).eq("userId", userId)
     )
     .first();
   ```

---

## Migrations

### Version 1 (Initial)

- Initial schema as defined above
- No migration needed for new installations

### Future Migrations

When schema changes:

```typescript
// Example: Adding elementCount field
// Version 2 migration
export const migrateDrawingsV1toV2 = internalMutation({
  handler: async (ctx) => {
    const drawings = await ctx.db
      .query("drawings")
      .filter((q) => q.eq(q.field("version"), 1))
      .collect();

    for (const drawing of drawings) {
      const data = decompressDrawing(drawing.data);
      const elementCount = Object.keys(data.store).filter(
        k => k.startsWith('shape:')
      ).length;

      await ctx.db.patch(drawing._id, {
        version: 2,
        elementCount,
      });
    }
  },
});
```

---

## Validation Examples

### 1. Size Validation

```typescript
const validateDrawingSize = (data: string): void => {
  const sizeBytes = new Blob([data]).size;

  if (sizeBytes > 500_000) {
    throw new ConvexError({
      code: "DRAWING_TOO_LARGE",
      message: "Drawing exceeds 500 KB limit",
      sizeBytes,
      limitBytes: 500_000,
    });
  }

  if (sizeBytes > 400_000) {
    // Warning logged, but allow save
    console.warn(`Drawing approaching size limit: ${sizeBytes} bytes`);
  }
};
```

### 2. Ownership Validation

```typescript
const validateOwnership = async (
  ctx: MutationCtx,
  noteId: Id<"notes">,
  userId: Id<"users">
): Promise<void> => {
  const note = await ctx.db.get(noteId);

  if (!note) {
    throw new ConvexError({
      code: "NOTE_NOT_FOUND",
      message: "Note does not exist",
    });
  }

  if (note.userId !== userId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "You don't have permission to modify this note's drawing",
    });
  }
};
```

### 3. Data Format Validation

```typescript
const validateDrawingData = (data: string): void => {
  try {
    // Attempt to decompress
    const json = LZString.decompressFromUTF16(data);
    if (!json) {
      throw new Error("Decompression failed");
    }

    // Attempt to parse JSON
    const snapshot = JSON.parse(json);

    // Validate structure
    if (!snapshot.store || !snapshot.schema) {
      throw new Error("Invalid snapshot structure");
    }

  } catch (error) {
    throw new ConvexError({
      code: "INVALID_DRAWING_DATA",
      message: "Drawing data is corrupted or invalid format",
      originalError: error.message,
    });
  }
};
```

---

## Query Patterns

### Get Drawing for Note

```typescript
export const getDrawingByNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await getUserId(ctx);

    const drawing = await ctx.db
      .query("drawings")
      .withIndex("by_note_user", (q) =>
        q.eq("noteId", noteId).eq("userId", userId)
      )
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .first();

    return drawing;
  },
});
```

### List User's Drawings

```typescript
export const getUserDrawings = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    const drawings = await ctx.db
      .query("drawings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .order("desc") // Most recent first
      .take(100); // Limit results

    return drawings;
  },
});
```

---

## Analytics Data

### Drawing Metrics

Track these metrics for analytics:

- Total drawings created
- Average drawing size
- Drawings per user
- Most common element count
- Export frequency (tracked separately)

```typescript
// Example: Track in separate analytics table (future enhancement)
drawingAnalytics: defineTable({
  drawingId: v.id("drawings"),
  userId: v.id("users"),
  eventType: v.union(
    v.literal("created"),
    v.literal("updated"),
    v.literal("exported"),
    v.literal("deleted")
  ),
  metadata: v.optional(v.any()), // Event-specific data
  timestamp: v.number(),
})
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DRAWING_NOT_FOUND` | 404 | Drawing doesn't exist |
| `DRAWING_TOO_LARGE` | 413 | Exceeds 500 KB limit |
| `INVALID_DRAWING_DATA` | 400 | Corrupted or invalid format |
| `UNAUTHORIZED` | 403 | User doesn't own note/drawing |
| `NOTE_NOT_FOUND` | 404 | Associated note doesn't exist |

---

## Performance Considerations

1. **Indexes**: All queries use indexes for O(log n) performance
2. **Denormalization**: `hasDrawing` flag on notes avoids extra queries
3. **Compression**: LZ-string reduces storage and network payload
4. **Lazy Loading**: Drawing data only loaded when canvas opens
5. **Caching**: Convex automatically caches query results

---

## Security

1. **Row-Level Security**: All queries filter by authenticated userId
2. **Input Validation**: Size, format, and ownership validated in mutations
3. **No Public Access**: Drawings only accessible to owner (no sharing in v1)
4. **XSS Prevention**: Data is JSON, not rendered as HTML

---

## Future Enhancements (Out of Scope for v1)

- **Drawing Templates**: Pre-defined shapes/diagrams
- **Drawing History**: Version control for drawings
- **Collaborative Editing**: Real-time multi-user editing
- **Drawing Sharing**: Public/private sharing like notes
- **Drawing Collections**: Organize drawings independently of notes
- **Advanced Analytics**: Heat maps, usage patterns

---

## References

- [Convex Schema Definition](https://docs.convex.dev/database/schemas)
- [tldraw Store Documentation](https://tldraw.dev/docs/persistence)
- [LZ-String Documentation](https://github.com/pieroxy/lz-string)
