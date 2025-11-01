# Convex API Contract: Drawing Functions

**Feature**: 006-excalidraw-drawing-feature
**Date**: 2025-10-29
**Backend**: Convex

## Overview

This document defines the Convex functions (queries and mutations) for the drawing feature.

---

## Queries

### 1. getDrawingByNote

Get the drawing associated with a specific note.

#### Signature

```typescript
export const getDrawingByNote = query({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => Promise<Drawing | null>
});
```

#### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `noteId` | `Id<"notes">` | Yes | Note ID to get drawing for |

#### Output

Returns `Drawing | null`:

```typescript
interface Drawing {
  _id: Id<"drawings">;
  _creationTime: number;
  noteId: Id<"notes">;
  userId: Id<"users">;
  data: string;              // Compressed tldraw data
  version: number;
  sizeBytes: number;
  elementCount?: number;
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}
```

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Authorization**: Only returns drawing if user owns the note
3. **Filtering**: Excludes soft-deleted drawings (`isDeleted !== true`)
4. **Not Found**: Returns `null` if no drawing exists

#### Errors

- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: User doesn't own the note

#### Example Usage

```typescript
// Client-side
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const drawing = useQuery(api.drawings.getDrawingByNote, {
  noteId: "k17abc123..." as Id<"notes">
});
```

---

### 2. getDrawing

Get a drawing by its ID (for direct access scenarios).

#### Signature

```typescript
export const getDrawing = query({
  args: {
    drawingId: v.id("drawings"),
  },
  handler: async (ctx, args) => Promise<Drawing | null>
});
```

#### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drawingId` | `Id<"drawings">` | Yes | Drawing ID |

#### Output

Returns `Drawing | null` (same structure as above)

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Authorization**: Only returns if user owns the drawing
3. **Filtering**: Excludes soft-deleted drawings
4. **Not Found**: Returns `null` if drawing doesn't exist or user lacks access

---

### 3. getUserDrawings

List all drawings for the authenticated user.

#### Signature

```typescript
export const getUserDrawings = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => Promise<DrawingSummary[]>
});
```

#### Input

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | `number` | No | 100 | Max drawings to return |

#### Output

Returns `DrawingSummary[]`:

```typescript
interface DrawingSummary {
  _id: Id<"drawings">;
  noteId: Id<"notes">;
  noteTitle: string;         // Joined from notes table
  sizeBytes: number;
  elementCount?: number;
  createdAt: number;
  updatedAt: number;
}
```

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Ordering**: Most recently updated first
3. **Limit**: Max 100 drawings by default
4. **Joins**: Includes note title for context

---

## Mutations

### 1. createDrawing

Create a new drawing for a note.

#### Signature

```typescript
export const createDrawing = mutation({
  args: {
    noteId: v.id("notes"),
    data: v.string(),
  },
  handler: async (ctx, args) => Promise<{ drawingId: Id<"drawings"> }>
});
```

#### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `noteId` | `Id<"notes">` | Yes | Note to attach drawing to |
| `data` | `string` | Yes | Compressed tldraw snapshot (JSON) |

#### Output

```typescript
{
  drawingId: Id<"drawings">
}
```

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Authorization**: Note must belong to user
3. **Validation**:
   - Note must exist
   - Note must not already have a drawing
   - Data size must be ≤ 500 KB
   - Data must be valid compressed JSON
4. **Side Effects**:
   - Creates drawing record
   - Updates `notes.hasDrawing = true`
   - Sets `createdAt` and `updatedAt` to current time
   - Sets `version = 1`

#### Errors

| Code | Status | Condition |
|------|--------|-----------|
| `NOTE_NOT_FOUND` | 404 | Note doesn't exist |
| `UNAUTHORIZED` | 403 | User doesn't own note |
| `DRAWING_EXISTS` | 409 | Note already has a drawing |
| `DRAWING_TOO_LARGE` | 413 | Data exceeds 500 KB |
| `INVALID_DRAWING_DATA` | 400 | Invalid format |

#### Example Usage

```typescript
// Client-side
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import LZString from "lz-string";

const createDrawing = useMutation(api.drawings.createDrawing);

const handleSave = async (snapshot: TLStoreSnapshot) => {
  const json = JSON.stringify(snapshot);
  const compressed = LZString.compressToUTF16(json);

  const { drawingId } = await createDrawing({
    noteId,
    data: compressed,
  });

  console.log("Drawing created:", drawingId);
};
```

---

### 2. updateDrawing

Update an existing drawing.

#### Signature

```typescript
export const updateDrawing = mutation({
  args: {
    drawingId: v.id("drawings"),
    data: v.string(),
  },
  handler: async (ctx, args) => Promise<void>
});
```

#### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drawingId` | `Id<"drawings">` | Yes | Drawing to update |
| `data` | `string` | Yes | New compressed drawing data |

#### Output

`void` (no return value, success indicated by no error)

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Authorization**: Drawing must belong to user
3. **Validation**:
   - Drawing must exist and not be deleted
   - Data size must be ≤ 500 KB
   - Data must be valid compressed JSON
4. **Side Effects**:
   - Updates `data`, `sizeBytes`, `updatedAt`
   - Optionally updates `elementCount` (if calculated)

#### Errors

| Code | Status | Condition |
|------|--------|-----------|
| `DRAWING_NOT_FOUND` | 404 | Drawing doesn't exist |
| `UNAUTHORIZED` | 403 | User doesn't own drawing |
| `DRAWING_TOO_LARGE` | 413 | Data exceeds 500 KB |
| `INVALID_DRAWING_DATA` | 400 | Invalid format |

#### Example Usage

```typescript
// Client-side with debouncing
import { useDebounce } from "@/hooks/useDebounce";

const updateDrawing = useMutation(api.drawings.updateDrawing);
const [snapshot, setSnapshot] = useState<TLStoreSnapshot>(initialSnapshot);
const debouncedSnapshot = useDebounce(snapshot, 1500);

useEffect(() => {
  if (debouncedSnapshot && drawingId) {
    const compressed = compressSnapshot(debouncedSnapshot);
    updateDrawing({ drawingId, data: compressed })
      .catch(err => toast.error("Failed to save drawing"));
  }
}, [debouncedSnapshot]);
```

---

### 3. deleteDrawing

Soft delete a drawing.

#### Signature

```typescript
export const deleteDrawing = mutation({
  args: {
    drawingId: v.id("drawings"),
  },
  handler: async (ctx, args) => Promise<void>
});
```

#### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drawingId` | `Id<"drawings">` | Yes | Drawing to delete |

#### Output

`void`

#### Behavior

1. **Authentication**: Requires authenticated user
2. **Authorization**: Drawing must belong to user
3. **Soft Delete**: Sets `isDeleted = true`, doesn't remove from database
4. **Side Effects**:
   - Updates `notes.hasDrawing = false`
   - Sets `updatedAt` to current time

#### Errors

| Code | Status | Condition |
|------|--------|-----------|
| `DRAWING_NOT_FOUND` | 404 | Drawing doesn't exist |
| `UNAUTHORIZED` | 403 | User doesn't own drawing |

---

### 4. permanentlyDeleteDrawing (Internal)

Permanently delete a drawing (hard delete).

#### Signature

```typescript
export const permanentlyDeleteDrawing = internalMutation({
  args: {
    drawingId: v.id("drawings"),
  },
  handler: async (ctx, args) => Promise<void>
});
```

#### Behavior

- **Internal only**: Not exposed to client
- Used by cleanup jobs or when note is permanently deleted
- Removes drawing record from database completely

---

## Helper Functions

### getUserId

Get authenticated user ID or throw error.

```typescript
async function getUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Must be logged in",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "User record not found",
    });
  }

  return user._id;
}
```

### validateDrawingSize

Validate drawing data size.

```typescript
function validateDrawingSize(data: string): number {
  const sizeBytes = new Blob([data]).size;

  if (sizeBytes > 500_000) {
    throw new ConvexError({
      code: "DRAWING_TOO_LARGE",
      message: `Drawing size (${sizeBytes} bytes) exceeds 500 KB limit`,
      sizeBytes,
      limitBytes: 500_000,
    });
  }

  return sizeBytes;
}
```

### validateDrawingData

Validate drawing data format.

```typescript
function validateDrawingData(data: string): void {
  try {
    // Attempt decompression
    const json = LZString.decompressFromUTF16(data);
    if (!json) {
      throw new Error("Decompression failed");
    }

    // Attempt JSON parse
    const snapshot = JSON.parse(json);

    // Basic structure validation
    if (!snapshot.store || !snapshot.schema) {
      throw new Error("Invalid snapshot structure");
    }
  } catch (error) {
    throw new ConvexError({
      code: "INVALID_DRAWING_DATA",
      message: "Drawing data is corrupted or invalid",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
```

---

## Rate Limiting (Future Enhancement)

Consider implementing rate limiting for mutations:

```typescript
// Example: Limit updates to 10 per minute per user
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10;

// Store in separate table or in-memory cache
interface RateLimit {
  userId: Id<"users">;
  count: number;
  windowStart: number;
}
```

---

## Performance Considerations

1. **Indexes**: All queries use indexes (by_note, by_user, by_note_user)
2. **Debouncing**: Client should debounce updates (1.5s recommended)
3. **Compression**: Always compress data before sending to server
4. **Lazy Loading**: Only query drawing when canvas opens
5. **Batch Operations**: If bulk operations needed, use `Promise.all()`

---

## Testing Scenarios

### Query Tests

```typescript
test("getDrawingByNote returns drawing for owner", async () => {
  // Setup: Create note and drawing
  const { noteId } = await ctx.runMutation(api.notes.create, { title: "Test" });
  const { drawingId } = await ctx.runMutation(api.drawings.createDrawing, {
    noteId,
    data: compressedData,
  });

  // Test: Query drawing
  const drawing = await ctx.runQuery(api.drawings.getDrawingByNote, { noteId });

  // Assert
  expect(drawing).toBeDefined();
  expect(drawing?._id).toBe(drawingId);
});

test("getDrawingByNote returns null for non-owner", async () => {
  // Setup: Create note as user A, query as user B
  // ... implementation
});
```

### Mutation Tests

```typescript
test("createDrawing succeeds with valid data", async () => {
  const { drawingId } = await ctx.runMutation(api.drawings.createDrawing, {
    noteId: validNoteId,
    data: validCompressedData,
  });

  expect(drawingId).toBeDefined();
});

test("createDrawing fails when drawing already exists", async () => {
  // Create first drawing
  await ctx.runMutation(api.drawings.createDrawing, {
    noteId,
    data: compressedData,
  });

  // Attempt to create second drawing for same note
  await expect(
    ctx.runMutation(api.drawings.createDrawing, {
      noteId,
      data: compressedData,
    })
  ).rejects.toThrow("DRAWING_EXISTS");
});

test("updateDrawing fails when size exceeds limit", async () => {
  const largeData = generateLargeDrawing(600_000); // 600 KB

  await expect(
    ctx.runMutation(api.drawings.updateDrawing, {
      drawingId,
      data: largeData,
    })
  ).rejects.toThrow("DRAWING_TOO_LARGE");
});
```

---

## Error Response Format

All errors follow ConvexError format:

```typescript
{
  code: "ERROR_CODE",      // Machine-readable error code
  message: "Human-readable error message",
  ...additionalFields      // Error-specific fields
}
```

### Client-Side Error Handling

```typescript
try {
  await updateDrawing({ drawingId, data });
} catch (error) {
  if (error instanceof ConvexError) {
    switch (error.data.code) {
      case "DRAWING_TOO_LARGE":
        toast.error("Drawing is too large. Try simplifying it.");
        break;
      case "UNAUTHORIZED":
        toast.error("You don't have permission to edit this drawing.");
        break;
      default:
        toast.error("Failed to save drawing.");
    }
  } else {
    toast.error("Network error. Please try again.");
  }
}
```

---

## Versioning & Backwards Compatibility

### Schema Version

Current: `version = 1`

When breaking changes are needed:
1. Increment version number
2. Create migration function
3. Support both old and new versions during transition
4. Update all clients before removing old version support

---

## Security Checklist

- [x] All queries check user authentication
- [x] All queries filter by authenticated user ID
- [x] All mutations validate user owns resource
- [x] Input validation (size, format) on all mutations
- [x] No public access to drawings (no sharing in v1)
- [x] XSS prevention (data is JSON, not rendered as HTML)
- [x] Rate limiting considered (for future enhancement)

---

## References

- [Convex Functions Documentation](https://docs.convex.dev/functions)
- [Convex Authentication](https://docs.convex.dev/auth)
- [Convex Error Handling](https://docs.convex.dev/functions/error-handling)
- [tldraw Persistence](https://tldraw.dev/docs/persistence)
