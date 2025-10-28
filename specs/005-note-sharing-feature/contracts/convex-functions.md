# API Contracts: Convex Functions

**Date**: 2025-10-28
**Feature**: 005-note-sharing-feature
**Backend**: Convex

## Overview

This document defines the Convex function contracts (queries and mutations) for the note sharing feature. Functions are organized into two files:
- `sharedNotes.ts` - Authenticated functions (require user auth)
- `publicShare.ts` - Public functions (no auth required)

---

## Authenticated Functions (sharedNotes.ts)

These functions require user authentication via Clerk.

### 1. createShareLink

**Type**: Mutation
**Description**: Creates a public share link for a note. Returns existing link if note already shared.

**Arguments**:
```typescript
{
  noteId: v.id("notes")
}
```

**Returns**:
```typescript
{
  shareId: string;          // The unique share link ID
  shareUrl: string;         // Full URL: https://noteflow.app/share/{shareId}
  isNew: boolean;           // true if newly created, false if reusing existing
}
```

**Errors**:
- `"Note not found"` - noteId doesn't exist
- `"Unauthorized"` - User doesn't own the note
- `"Note is deleted"` - Cannot share a deleted note

**Business Logic**:
1. Verify user owns the note (via `getAuthenticatedUserId`)
2. Check if note is deleted (cannot share deleted notes)
3. Query if share link already exists for this noteId
4. If exists and active → return existing shareId
5. If exists but inactive → reactivate (set isActive=true)
6. If not exists → generate new shareId (nanoid 16 chars), create SharedNote
7. Return shareId and full URL

**Example**:
```typescript
const result = await createShareLink({ noteId: "k123..." });
// Returns: {
//   shareId: "abc123xyz789mnop",
//   shareUrl: "https://noteflow.app/share/abc123xyz789mnop",
//   isNew: true
// }
```

---

### 2. revokeShareLink

**Type**: Mutation
**Description**: Revokes a share link, making it inaccessible. Preserves analytics data.

**Arguments**:
```typescript
{
  shareId: v.string()
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Errors**:
- `"Share not found"` - shareId doesn't exist
- `"Unauthorized"` - User doesn't own the share

**Business Logic**:
1. Verify user owns the share (userId matches authenticated user)
2. Set isActive = false
3. Update updatedAt timestamp
4. Keep viewCount and other analytics data

**Example**:
```typescript
await revokeShareLink({ shareId: "abc123xyz789mnop" });
// Returns: { success: true, message: "Share link revoked" }
```

---

### 3. getMySharedNotes

**Type**: Query
**Description**: Returns list of all active shared notes for the authenticated user.

**Arguments**: None

**Returns**:
```typescript
Array<{
  _id: Id<"sharedNotes">;
  shareId: string;
  shareUrl: string;
  noteId: Id<"notes">;
  noteTitle: string;
  viewCount: number;
  lastAccessedAt: number | undefined;
  createdAt: number;
  isActive: boolean;
}>
```

**Business Logic**:
1. Get authenticated userId
2. Query sharedNotes by userId (all shares, active and inactive)
3. For each share, fetch note title
4. Sort by createdAt (newest first)
5. Return enriched list

**Example**:
```typescript
const myShares = await getMySharedNotes();
// Returns: [
//   {
//     _id: "abc...",
//     shareId: "xyz123...",
//     shareUrl: "https://noteflow.app/share/xyz123...",
//     noteTitle: "My Public Note",
//     viewCount: 42,
//     lastAccessedAt: 1698765432000,
//     createdAt: 1698700000000,
//     isActive: true
//   },
//   // ...
// ]
```

---

### 4. getShareAnalytics

**Type**: Query
**Description**: Get detailed analytics for a specific share link.

**Arguments**:
```typescript
{
  shareId: v.string()
}
```

**Returns**:
```typescript
{
  shareId: string;
  viewCount: number;
  lastAccessedAt: number | undefined;
  createdAt: number;
  isActive: boolean;
  noteTitle: string;
}
```

**Errors**:
- `"Share not found"` - shareId doesn't exist
- `"Unauthorized"` - User doesn't own the share

**Business Logic**:
1. Verify user owns the share
2. Fetch share data
3. Fetch note title
4. Return combined analytics

---

### 5. reactivateShareLink (Future Enhancement)

**Type**: Mutation
**Description**: Reactivates a previously revoked share link.

**Arguments**:
```typescript
{
  shareId: v.string()
}
```

**Returns**:
```typescript
{
  success: boolean;
  message: string;
}
```

**Note**: Not implemented in MVP but documented for future.

---

## Public Functions (publicShare.ts)

These functions do NOT require authentication - accessible to anyone.

### 1. getSharedNote

**Type**: Query
**Description**: Fetches note content for public display via share link. Increments view count.

**Arguments**:
```typescript
{
  shareId: v.string()
}
```

**Returns**:
```typescript
{
  title: string;
  content: string;
  blocks: string | undefined;
  contentType: "plain" | "rich" | undefined;
  coverImage: string | undefined;
} | null
```

Returns `null` if:
- Share link doesn't exist
- Share link is revoked (isActive = false)
- Referenced note is deleted
- Note doesn't exist

**Business Logic**:
1. Query sharedNotes by shareId (indexed lookup)
2. If not found OR isActive=false → return null
3. Fetch note by noteId
4. If note.isDeleted OR note not found → return null
5. Increment viewCount (separate mutation or within same transaction)
6. Update lastAccessedAt timestamp
7. Return ONLY public-safe note fields (no userId, email, etc.)

**Security Notes**:
- NO authentication required
- NO user personal data returned
- Only returns note content fields
- Validates isActive and isDeleted before returning

**Example**:
```typescript
const note = await getSharedNote({ shareId: "abc123xyz789mnop" });
// Returns: {
//   title: "My Public Note",
//   content: "This is the note content...",
//   contentType: "rich",
//   blocks: "{...}",
//   coverImage: "https://..."
// }

// OR returns null if invalid/revoked
```

---

### 2. trackShareView (Internal - Called by getSharedNote)

**Type**: Mutation
**Description**: Increments view count and updates lastAccessedAt. Called internally by getSharedNote.

**Arguments**:
```typescript
{
  shareId: v.string()
}
```

**Returns**: void

**Business Logic**:
1. Find SharedNote by shareId
2. Increment viewCount by 1
3. Set lastAccessedAt = Date.now()

**Note**: This might be combined into getSharedNote rather than separate function, depending on Convex capabilities for mutations within queries.

---

## Error Handling Strategy

All functions follow consistent error handling:

1. **Authentication Errors**: Throw `"Unauthorized: ..."` message
2. **Not Found Errors**: Throw `"<Entity> not found"` message
3. **Validation Errors**: Throw descriptive message (e.g., `"Note is deleted"`)
4. **Public Queries**: Return `null` for invalid/revoked shares (no error thrown)

---

## Performance Considerations

1. **Indexes**: All queries use appropriate indexes for fast lookups
   - `getSharedNote`: Uses `by_share_id` index
   - `getMySharedNotes`: Uses `by_user` index
   - `createShareLink`: Uses `by_note` index to check existing

2. **Data Fetching**: Minimize queries
   - `getMySharedNotes`: Single query for shares + batch fetch note titles
   - `getSharedNote`: Two queries max (share lookup + note fetch)

3. **View Tracking**: Increment viewCount efficiently
   - Use Convex's atomic increment if available
   - Avoid race conditions on concurrent views

---

## Testing Scenarios

### Authenticated Functions
- ✅ Create share link for owned note
- ✅ Create share link for already-shared note (returns existing)
- ❌ Create share link for note owned by another user
- ❌ Create share link for deleted note
- ✅ Revoke share link
- ❌ Revoke share link owned by another user
- ✅ List all shared notes
- ✅ Get analytics for owned share

### Public Functions
- ✅ Get shared note with valid, active shareId
- ❌ Get shared note with invalid shareId (returns null)
- ❌ Get shared note with revoked shareId (returns null)
- ❌ Get shared note where underlying note is deleted (returns null)
- ✅ View count increments on each access
- ✅ lastAccessedAt updates correctly

---

## Rate Limiting (Future)

Not implemented in MVP, but consider for production:
- Limit share link creation: Max 100 shares per user
- Limit public view access: Max 1000 views per share per hour (DDoS protection)
- Use Convex's built-in rate limiting or implement custom throttling

---

## Migration Path

No migration needed - new tables and functions. Existing note queries remain unchanged.

**Rollback**: Simply remove routes and UI; keep functions for data preservation.
