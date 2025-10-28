# Quickstart Guide: Note Sharing Feature

**Date**: 2025-10-28
**Feature**: 005-note-sharing-feature
**Estimated Time**: 3-4 hours for MVP implementation

## Overview

This guide provides a step-by-step implementation plan for the note sharing feature. Follow these steps in order for smooth development.

---

## Prerequisites

Before starting:
- ✅ Feature branch created: `005-note-sharing-feature`
- ✅ Research completed (all NEEDS CLARIFICATION resolved)
- ✅ Data model designed
- ✅ API contracts defined
- 📦 Install nanoid: `npm install nanoid`
- 📦 (Optional) Install Vitest for testing: `npm install -D vitest @testing-library/react`

---

## Phase 1: Backend Setup (Convex) - ~90 minutes

### Step 1.1: Update Convex Schema (~15 min)

**File**: `convex/schema.ts`

Add the `sharedNotes` table definition:

```typescript
// Add to existing schema
sharedNotes: defineTable({
  shareId: v.string(),
  noteId: v.id("notes"),
  userId: v.id("users"),
  isActive: v.boolean(),
  viewCount: v.number(),
  lastAccessedAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_share_id", ["shareId"])
  .index("by_note", ["noteId"])
  .index("by_user", ["userId"])
  .index("by_user_active", ["userId", "isActive"]),
```

**Test**: Run `npm run dev` and verify Convex schema updates without errors.

---

### Step 1.2: Create Share Utilities (~10 min)

**File**: `lib/shareUtils.ts` (create new)

```typescript
import { nanoid } from 'nanoid';

export function generateShareId(): string {
  return nanoid(16); // URL-safe, 16 characters
}

export function buildShareUrl(shareId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/share/${shareId}`;
}

export function validateShareId(shareId: string): boolean {
  return typeof shareId === 'string' && shareId.length === 16;
}
```

**Test**: Import and call `generateShareId()` in a test file to verify it works.

---

### Step 1.3: Create Authenticated Share Functions (~30 min)

**File**: `convex/sharedNotes.ts` (create new)

Implement these functions:
1. `createShareLink` (mutation)
2. `revokeShareLink` (mutation)
3. `getMySharedNotes` (query)
4. `getShareByNoteId` (query - internal helper)

**Reference**: See `contracts/convex-functions.md` for detailed specs.

**Key Implementation Notes**:
- Use `getAuthenticatedUserId(ctx)` for auth
- Use `verifyNoteOwnership(ctx, noteId, userId)` pattern from existing `notes.ts`
- Check if share already exists before creating new one

**Test**: Use Convex dashboard to manually test mutations.

---

### Step 1.4: Create Public Share Query (~20 min)

**File**: `convex/publicShare.ts` (create new)

Implement:
1. `getSharedNote` (query - NO AUTH)

**Critical**: This query must NOT call `getAuthenticatedUserId`. It's public!

**Implementation**:
```typescript
export const getSharedNote = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    if (!share || !share.isActive) return null;

    const note = await ctx.db.get(share.noteId);
    if (!note || note.isDeleted) return null;

    // Increment view count
    await ctx.db.patch(share._id, {
      viewCount: share.viewCount + 1,
      lastAccessedAt: Date.now(),
    });

    return {
      title: note.title,
      content: note.content,
      blocks: note.blocks,
      contentType: note.contentType,
      coverImage: note.coverImage,
    };
  },
});
```

**Test**: Access via Convex dashboard without authentication.

---

### Step 1.5: Update Notes Functions (~15 min)

**File**: `convex/notes.ts`

Modify `deleteNote` mutation to revoke shares when note is deleted:

```typescript
// Inside deleteNote mutation, before patching note
const shares = await ctx.db
  .query("sharedNotes")
  .withIndex("by_note", (q) => q.eq("noteId", noteId))
  .collect();

for (const share of shares) {
  if (share.isActive) {
    await ctx.db.patch(share._id, { isActive: false, updatedAt: Date.now() });
  }
}
```

**Test**: Delete a shared note and verify share link is revoked.

---

## Phase 2: Frontend Components - ~90 minutes

### Step 2.1: Create Share Button Component (~20 min)

**File**: `components/share/ShareButton.tsx` (create new)

**Implementation**:
- Use existing button patterns from your UI library
- Add share icon (Lucide `Share2` icon)
- On click, open share dialog
- Show loading state while checking if note is shared

**Reference**: See `contracts/ui-components.md` for detailed specs.

**Test**: Add to note editor/view page and verify it renders.

---

### Step 2.2: Create Share Dialog Component (~40 min)

**File**: `components/share/ShareDialog.tsx` (create new)

**Implementation**:
- Use Radix UI Dialog component (already in dependencies)
- Fetch share status on mount: `useQuery(api.sharedNotes.getShareByNoteId)`
- If not shared: Show "Create Share Link" button
- If shared: Show URL with copy button + analytics + revoke button
- Use `useMutation` for create/revoke actions

**UI Libraries to Use**:
- Dialog: `@radix-ui/react-dialog`
- Button: Your existing button component
- Copy: Use browser Clipboard API + toast notification

**Test**: Open dialog, create share link, copy URL, revoke access.

---

### Step 2.3: Create Public Note View Component (~30 min)

**File**: `components/share/PublicNoteView.tsx` (create new)

**Implementation**:
- Clean, minimal layout
- Display title, content, cover image
- Use prose classes for typography (Tailwind Typography plugin)
- Add branding footer

**Styling**:
```tsx
<div className="max-w-4xl mx-auto px-4 py-12">
  {coverImage && <img src={coverImage} alt="" className="w-full h-64 object-cover rounded-lg mb-8" />}
  <h1 className="text-4xl font-bold mb-6">{title}</h1>
  <div className="prose prose-lg dark:prose-invert">
    {/* Render content */}
  </div>
  <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
    Created with <a href="/">NoteFlow</a>
  </footer>
</div>
```

**Test**: Create mock note data and verify rendering.

---

## Phase 3: Public Share Page - ~45 minutes

### Step 3.1: Create Share Page Route (~30 min)

**File**: `app/share/[shareId]/page.tsx` (create new)

**Implementation**:
```tsx
import { convex } from "@/convex/_generated/api";
import { api } from "@/convex/_generated/api";
import PublicNoteView from "@/components/share/PublicNoteView";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { shareId: string } }): Promise<Metadata> {
  const note = await convex.query(api.publicShare.getSharedNote, {
    shareId: params.shareId,
  });

  if (!note) {
    return { title: "Note Not Found" };
  }

  return {
    title: note.title,
    description: note.content.substring(0, 160),
    openGraph: {
      title: note.title,
      description: note.content.substring(0, 160),
      images: note.coverImage ? [note.coverImage] : [],
    },
  };
}

export default async function SharePage({ params }: { params: { shareId: string } }) {
  const note = await convex.query(api.publicShare.getSharedNote, {
    shareId: params.shareId,
  });

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Note Not Found</h1>
          <p className="text-muted-foreground">This note is no longer available.</p>
        </div>
      </div>
    );
  }

  return <PublicNoteView note={note} />;
}
```

**Test**: Access `/share/test123` and verify "not found" page. Create real share link and verify note displays.

---

### Step 3.2: Add Share Button to Note Editor (~15 min)

**File**: Modify existing note editor/view component

Add `<ShareButton noteId={note._id} />` to the toolbar or actions area.

**Placement Suggestions**:
- Note editor toolbar (next to delete, favorite buttons)
- Note context menu
- Note card actions (in list view)

**Test**: Open note, click share button, verify dialog opens.

---

## Phase 4: Optional Enhancements - ~30 minutes

### Enhancement 1: Share List View (Optional)

**File**: `components/share/ShareList.tsx`

Display list of all user's shared notes with analytics. Great for settings page or dedicated "My Shares" section.

---

### Enhancement 2: Toast Notifications

Ensure toast notifications are shown for:
- ✅ "Share link created!"
- ✅ "Link copied to clipboard!"
- ✅ "Share link revoked."
- ❌ "Failed to create share link."

---

### Enhancement 3: Share Analytics Widget

Add view count badge to note cards that have active shares.

---

## Phase 5: Testing - ~45 minutes

### Manual Testing Checklist

- [ ] Create share link for note
- [ ] Copy share link to clipboard
- [ ] Access share link in incognito/new browser
- [ ] Verify note content displays correctly
- [ ] Check view count increments
- [ ] Revoke share link
- [ ] Verify revoked link shows "not available"
- [ ] Delete note, verify share link is revoked
- [ ] Test on mobile (responsive design)
- [ ] Test dark mode
- [ ] Test SEO: share link on social media (Discord, Slack) to see preview

### Automated Tests (Optional)

If time permits, write basic tests:
- Unit test: `generateShareId()` returns 16-char string
- Integration test: Create share → fetch public note → verify data
- Component test: ShareDialog creates and revokes share

---

## Deployment Checklist

Before merging to main:
- [ ] All Convex schema changes deployed
- [ ] Environment variable `NEXT_PUBLIC_APP_URL` set in production
- [ ] Public share route is accessible (no auth required)
- [ ] OG tags render correctly (test with https://www.opengraph.xyz/)
- [ ] Mobile responsive design verified
- [ ] Performance: Public page loads in <2s

---

## Common Issues & Troubleshooting

### Issue: "Unauthorized" error on public share page
**Fix**: Ensure `publicShare.getSharedNote` does NOT call `getAuthenticatedUserId()`

### Issue: Share link shows 404
**Fix**: Verify route created at `app/share/[shareId]/page.tsx` (not `pages/`)

### Issue: View count doesn't increment
**Fix**: Check mutation is called in `getSharedNote` query (Convex allows mutations in queries)

### Issue: Images don't load on public page
**Fix**: Ensure images are publicly accessible URLs (not private Convex files)

### Issue: OG tags not showing in social media
**Fix**: Ensure `generateMetadata` is exported and returns proper OpenGraph fields

---

## Next Steps After MVP

1. Add password protection for shares
2. Add expiration dates for shares
3. Implement detailed analytics (unique visitors, referrers)
4. Add custom share settings (disable copying, watermark)
5. Create dedicated "My Shares" dashboard page
6. Add rate limiting for public endpoint

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Backend Setup | 90 min |
| 2 | Frontend Components | 90 min |
| 3 | Public Share Page | 45 min |
| 4 | Testing | 45 min |
| **Total** | **MVP Complete** | **~4.5 hours** |

---

## Success Metrics

After implementation, verify:
- ✅ Users can create share links in <5 seconds
- ✅ Public share page loads in <2 seconds
- ✅ Revocation is instant (<100ms)
- ✅ Mobile responsive (test on phone)
- ✅ Zero user data exposed in public view
- ✅ SEO preview works on social platforms

---

## Support & Resources

- **Convex Docs**: https://docs.convex.dev
- **Next.js App Router**: https://nextjs.org/docs/app
- **Radix UI**: https://www.radix-ui.com
- **nanoid**: https://github.com/ai/nanoid

Happy coding! 🚀
