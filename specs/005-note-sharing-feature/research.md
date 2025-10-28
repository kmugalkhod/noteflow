# Research: Note Sharing Feature

**Date**: 2025-10-28
**Feature**: 005-note-sharing-feature
**Purpose**: Resolve all NEEDS CLARIFICATION items from Technical Context

## Research Items

### 1. Testing Framework

**Question**: What testing framework should be used for this feature?

**Decision**: Use Vitest with React Testing Library

**Rationale**:
- Next.js 15 works well with Vitest as a faster alternative to Jest
- React Testing Library is the standard for testing React components
- Convex provides testing utilities that work with standard testing frameworks
- Vitest has excellent TypeScript support and is faster than Jest

**Alternatives Considered**:
- Jest: More common but slower, Next.js has moved toward recommending Vitest
- Playwright: Better for E2E but overkill for component/integration tests
- No tests: Unacceptable for a feature involving public access and security

**Implementation Notes**:
- Add `vitest` and `@testing-library/react` as devDependencies
- Create test files for share components and Convex functions
- Focus on testing: share link generation, revocation, public access validation

---

### 2. Share ID Generation Strategy

**Question**: Should we use crypto.randomUUID() or nanoid for generating share IDs?

**Decision**: Use nanoid with custom alphabet and length of 16 characters

**Rationale**:
- nanoid is URL-friendly by default (no special characters that need encoding)
- Shorter than UUIDs (16 chars vs 36) while maintaining security
- Customizable alphabet allows excluding ambiguous characters (0/O, 1/l/I)
- Battle-tested in production with >1M weekly downloads
- Size: only 130 bytes (negligible bundle impact)

**Alternatives Considered**:
- crypto.randomUUID(): Standard UUID (36 chars) is longer and less URL-friendly
- crypto.getRandomValues() with base64: Need to handle URL encoding, more complex
- Sequential IDs: Predictable and insecure (rejected)

**Implementation Notes**:
- Install: `npm install nanoid`
- Usage: `import { nanoid } from 'nanoid'; const shareId = nanoid(16);`
- Alphabet: Use default URL-safe (A-Za-z0-9_-) or customize to exclude ambiguous chars
- Collision probability at 16 chars: ~1 billion years at 1000 IDs/hour (safe)

---

### 3. Public Route Structure

**Question**: Should public share URLs use `/share/[shareId]` or `/s/[shareId]`?

**Decision**: Use `/share/[shareId]` (longer, more descriptive)

**Rationale**:
- `/share/` is self-documenting and clear to users
- SEO benefit: search engines can understand the URL purpose
- Professional appearance: users trust descriptive URLs over cryptic short links
- Consistency: other features can follow similar patterns (`/public/`, `/view/`)
- Not a problem: modern chat apps/social media auto-link URLs regardless of length

**Alternatives Considered**:
- `/s/[shareId]`: Shorter but cryptic, users might think it's spam or unsafe
- `/n/[shareId]`: Even more cryptic, no semantic meaning
- `/public/[shareId]`: Considered but "share" better describes the action

**Implementation Notes**:
- Create folder: `app/share/[shareId]/page.tsx`
- Dynamic route parameter: `params.shareId`
- Metadata generation for SEO: use Next.js `generateMetadata` function

---

### 4. Image Handling in Shared Notes

**Question**: Are coverImages already publicly accessible or do they need a proxy?

**Decision**: Images need to be publicly accessible; use Convex file storage with public URLs

**Rationale**:
- Convex file storage generates public URLs automatically when files are uploaded
- If existing notes use external URLs (user-provided), those are already public
- For Convex-stored files, ensure proper public access permissions are set
- No need for proxy if using proper Convex file storage patterns

**Alternatives Considered**:
- Image proxy: Adds complexity, latency, and potential failure point
- Base64 embed: Bloats HTML, poor performance for large images
- Restrict images in shared notes: Bad UX, defeats purpose of rich content sharing

**Implementation Notes**:
- Verify existing coverImage storage pattern in the codebase
- If using Convex file storage: ensure files are uploaded with public access
- If using external URLs: no changes needed (already public)
- Handle missing/broken images gracefully in public view (placeholder or hide)

**Follow-up Action**: Check existing note creation flow to confirm image storage pattern

---

### 5. SEO Meta Tags Generation

**Question**: Should we use Next.js Metadata API or custom head tags?

**Decision**: Use Next.js 15 Metadata API (`generateMetadata`)

**Rationale**:
- Next.js 15 App Router uses `generateMetadata` as the standard approach
- Type-safe and integrated with framework
- Automatically generates proper meta tags (title, description, og:tags, twitter:card)
- Supports dynamic metadata based on route params (perfect for share IDs)
- Better SEO out of the box compared to manual meta tag management

**Alternatives Considered**:
- Custom `<head>` tags: Not recommended in App Router, can cause hydration issues
- next-seo library: Unnecessary overhead when Metadata API exists
- No meta tags: Poor social media preview and SEO (rejected)

**Implementation Notes**:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sharedNote = await getSharedNote(params.shareId);

  return {
    title: sharedNote?.title || 'Shared Note',
    description: sharedNote?.content.substring(0, 160) || 'View this shared note',
    openGraph: {
      title: sharedNote?.title,
      description: sharedNote?.content.substring(0, 160),
      images: sharedNote?.coverImage ? [sharedNote.coverImage] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: sharedNote?.title,
      description: sharedNote?.content.substring(0, 160),
      images: sharedNote?.coverImage ? [sharedNote.coverImage] : [],
    },
  };
}
```

---

### 6. Convex Public Queries (Auth Bypass)

**Question**: How to properly secure Convex queries that need to work without authentication?

**Decision**: Create separate public query functions that explicitly skip auth and validate share IDs

**Rationale**:
- Convex allows queries without auth by not calling `getAuthenticatedUserId`
- Create dedicated `publicShare.ts` file for public queries (separation of concerns)
- Validate share link existence and active status before returning note data
- Never expose user personal data in public queries (only note content)

**Best Practices**:
- Use `ctx.db.query()` without auth checks for public endpoints
- Always validate `shareId` existence and `isActive` status
- Return minimal data (only what's needed for display)
- Log access for analytics (view count tracking)
- Rate limiting: rely on Convex's built-in protections (upgrade if needed)

**Implementation Notes**:
```typescript
// convex/publicShare.ts
export const getSharedNote = query({
  args: { shareId: v.string() },
  handler: async (ctx, { shareId }) => {
    // No auth check - this is public!
    const share = await ctx.db
      .query("sharedNotes")
      .withIndex("by_share_id", (q) => q.eq("shareId", shareId))
      .first();

    if (!share || !share.isActive) {
      return null; // Share not found or revoked
    }

    const note = await ctx.db.get(share.noteId);
    if (!note || note.isDeleted) {
      return null; // Note no longer exists
    }

    // Increment view count (separate mutation)
    await ctx.db.patch(share._id, {
      viewCount: share.viewCount + 1,
      lastAccessedAt: Date.now(),
    });

    // Return ONLY public-safe data
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

---

### 7. Convex Rate Limiting for Public Endpoints

**Question**: Can Convex handle 1000 concurrent public reads without rate limiting?

**Decision**: Yes, with proper query optimization and monitoring

**Rationale**:
- Convex Free tier: 1M function calls/month, 1GB egress/month
- Convex Pro tier: Unlimited function calls, 100GB egress/month
- 1000 concurrent reads is well within limits if queries are efficient
- Each public share view = 1 query (fetch share data) + 1 mutation (increment view count)
- Estimated: ~60K function calls/month for moderate sharing (2K views/month)

**Alternatives Considered**:
- Add caching layer: Premature optimization, adds complexity
- Use separate CDN for static content: Overkill for MVP
- Implement custom rate limiting: Convex has built-in protections

**Implementation Notes**:
- Monitor usage in Convex dashboard after launch
- Optimize query: use index on `shareId` for fast lookups
- Consider upgrading to Pro tier if sharing becomes very popular
- Set up alerts if approaching limits

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| Testing Framework | Vitest + React Testing Library | Fast, modern, great TypeScript support |
| Share ID Generation | nanoid (16 chars) | URL-friendly, secure, shorter than UUID |
| Public Route | `/share/[shareId]` | Self-documenting, SEO-friendly |
| Image Handling | Use public Convex file storage | No proxy needed, simple |
| SEO Meta Tags | Next.js Metadata API | Type-safe, dynamic, built-in |
| Auth Bypass | Dedicated public query file | Clear separation, secure by design |
| Rate Limiting | Rely on Convex limits + monitoring | Sufficient for MVP, scalable |

All NEEDS CLARIFICATION items have been resolved. Ready to proceed to Phase 1: Design & Contracts.
