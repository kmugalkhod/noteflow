# API Contracts: UI Components

**Date**: 2025-10-28
**Feature**: 005-note-sharing-feature
**Framework**: React 19, Next.js 15, Radix UI, Tailwind CSS

## Overview

This document defines the React component interfaces and contracts for the note sharing feature.

---

## Component 1: ShareButton

**Location**: `components/share/ShareButton.tsx`
**Purpose**: Trigger button to open share dialog, displayed in note view/editor

**Props**:
```typescript
interface ShareButtonProps {
  noteId: string;           // ID of the note to share
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}
```

**Behavior**:
- Displays a button with share icon (Radix UI Icon or Lucide)
- On click, opens ShareDialog modal
- Shows loading state while checking share status
- Disabled if note is deleted or user doesn't own it
- Shows visual indicator if note is already shared (e.g., different icon color)

**UI States**:
- Default: Share icon, neutral color
- Hover: Highlighted, tooltip "Share note"
- Active (already shared): Filled icon or accent color, tooltip "Manage share"
- Disabled: Muted, tooltip "Cannot share deleted note"
- Loading: Spinner while fetching share status

**Example Usage**:
```tsx
<ShareButton
  noteId={note._id}
  variant="outline"
  size="md"
/>
```

---

## Component 2: ShareDialog

**Location**: `components/share/ShareDialog.tsx`
**Purpose**: Modal dialog for creating, viewing, and managing share links

**Props**:
```typescript
interface ShareDialogProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
  noteTitle?: string;       // Optional, for display in dialog
}
```

**States**:
```typescript
type ShareDialogState =
  | { status: "loading" }
  | { status: "not_shared" }
  | { status: "shared"; shareId: string; shareUrl: string; viewCount: number; lastAccessedAt?: number }
  | { status: "error"; message: string };
```

**Behavior**:

### When Not Shared:
- Shows "Share this note" heading
- Description: "Create a public link that anyone can view"
- Primary action: "Create Share Link" button
- On click: Call `createShareLink` mutation
- Show loading spinner during creation
- On success: Transition to "shared" state

### When Already Shared:
- Shows "Note is shared" heading
- Displays full share URL in read-only input with "Copy" button
- Shows analytics: "{viewCount} views" and "Last viewed {relative time}"
- Actions:
  - "Copy Link" button (primary)
  - "Revoke Access" button (destructive/secondary)
  - "Preview" link (opens share URL in new tab)
- On "Revoke": Show confirmation dialog, then call `revokeShareLink`
- On "Copy": Copy URL to clipboard, show toast "Link copied!"

### Error State:
- Shows error message
- "Try Again" button to retry

**UI Structure**:
```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Share "{noteTitle}"</DialogTitle>
    </DialogHeader>

    {state.status === "not_shared" && (
      <CreateShareView onCreateShare={handleCreate} />
    )}

    {state.status === "shared" && (
      <ManageShareView
        shareUrl={state.shareUrl}
        viewCount={state.viewCount}
        lastAccessedAt={state.lastAccessedAt}
        onCopy={handleCopy}
        onRevoke={handleRevoke}
      />
    )}

    {state.status === "error" && (
      <ErrorView message={state.message} onRetry={handleRetry} />
    )}
  </DialogContent>
</Dialog>
```

**Example Usage**:
```tsx
const [dialogOpen, setDialogOpen] = useState(false);

<ShareDialog
  noteId={note._id}
  noteTitle={note.title}
  isOpen={dialogOpen}
  onClose={() => setDialogOpen(false)}
/>
```

---

## Component 3: ShareList

**Location**: `components/share/ShareList.tsx`
**Purpose**: Display list of user's shared notes with analytics (for dashboard or settings page)

**Props**:
```typescript
interface ShareListProps {
  className?: string;
}
```

**Data Fetching**:
- Uses Convex query: `useQuery(api.sharedNotes.getMySharedNotes)`
- Automatically subscribes to updates

**Behavior**:
- Shows loading skeleton while fetching
- Displays empty state if no shares: "You haven't shared any notes yet"
- Each list item shows:
  - Note title
  - Share URL (truncated) with copy button
  - View count and last accessed time
  - Status badge (Active/Revoked)
  - Actions: Copy, Revoke, Preview
- Sorted by creation date (newest first)
- Responsive: Card layout on mobile, table on desktop

**List Item Structure**:
```tsx
<ShareListItem>
  <div>
    <h3>{noteTitle}</h3>
    <p className="text-sm text-muted">{truncatedUrl}</p>
  </div>
  <div>
    <Badge>{isActive ? "Active" : "Revoked"}</Badge>
    <span>{viewCount} views</span>
    <span>Last viewed {relativeTime}</span>
  </div>
  <div>
    <Button onClick={handleCopy}>Copy</Button>
    <Button onClick={handleRevoke} variant="destructive">Revoke</Button>
    <Button onClick={handlePreview} variant="ghost">Preview</Button>
  </div>
</ShareListItem>
```

**Example Usage**:
```tsx
<ShareList className="mt-8" />
```

---

## Component 4: PublicNoteView

**Location**: `components/share/PublicNoteView.tsx`
**Purpose**: Clean, read-only note viewer for public share pages

**Props**:
```typescript
interface PublicNoteViewProps {
  note: {
    title: string;
    content: string;
    blocks?: string;
    contentType?: "plain" | "rich";
    coverImage?: string;
  };
}
```

**Behavior**:
- Displays note content in clean, distraction-free layout
- No editing controls or interactive elements
- Responsive typography optimized for reading
- Shows cover image at top (if present)
- Renders rich text or plain text based on contentType
- Minimal branding footer: "Created with NoteFlow"

**UI Structure**:
```tsx
<div className="max-w-4xl mx-auto px-4 py-12">
  {coverImage && (
    <img src={coverImage} alt="" className="w-full h-64 object-cover rounded-lg mb-8" />
  )}

  <h1 className="text-4xl font-bold mb-6">{title}</h1>

  <div className="prose prose-lg dark:prose-invert">
    {contentType === "rich" ? (
      <RichTextRenderer blocks={blocks} />
    ) : (
      <div className="whitespace-pre-wrap">{content}</div>
    )}
  </div>

  <footer className="mt-16 pt-8 border-t text-center text-sm text-muted">
    <span>Created with <a href="https://noteflow.app">NoteFlow</a></span>
  </footer>
</div>
```

**Styling**:
- Typography: Large, readable font (18px base)
- Spacing: Generous line height (1.7) and margins
- Colors: High contrast for accessibility
- Dark mode support via Tailwind dark: classes

**Example Usage**:
```tsx
<PublicNoteView note={sharedNoteData} />
```

---

## Page Component: SharePage

**Location**: `app/share/[shareId]/page.tsx`
**Type**: Next.js App Router Server Component

**Purpose**: Public share page that fetches and displays shared note

**Route Params**:
```typescript
interface SharePageParams {
  shareId: string;
}
```

**Behavior**:
- Server-side fetch of shared note data (Convex query)
- Generate SEO metadata (title, description, OG tags)
- If note found: Render PublicNoteView
- If not found: Render "Note not available" error page
- No authentication required

**Metadata Generation**:
```typescript
export async function generateMetadata({ params }: { params: SharePageParams }): Promise<Metadata> {
  const note = await convex.query(api.publicShare.getSharedNote, {
    shareId: params.shareId
  });

  if (!note) {
    return {
      title: "Note Not Found",
      description: "This shared note is no longer available.",
    };
  }

  return {
    title: note.title,
    description: note.content.substring(0, 160),
    openGraph: {
      title: note.title,
      description: note.content.substring(0, 160),
      images: note.coverImage ? [note.coverImage] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.content.substring(0, 160),
      images: note.coverImage ? [note.coverImage] : [],
    },
  };
}
```

**Page Structure**:
```tsx
export default async function SharePage({ params }: { params: SharePageParams }) {
  const note = await convex.query(api.publicShare.getSharedNote, {
    shareId: params.shareId,
  });

  if (!note) {
    return <NotFoundView />;
  }

  return <PublicNoteView note={note} />;
}
```

---

## Utility Components

### CopyButton

**Purpose**: Reusable button to copy text to clipboard

**Props**:
```typescript
interface CopyButtonProps {
  text: string;
  children?: React.ReactNode;
  onCopy?: () => void;
}
```

**Behavior**:
- Copies text to clipboard on click
- Shows toast notification "Copied!"
- Icon changes briefly to checkmark
- Calls optional onCopy callback

---

### ShareStatusBadge

**Purpose**: Visual indicator of share status

**Props**:
```typescript
interface ShareStatusBadgeProps {
  isActive: boolean;
}
```

**Render**:
```tsx
<Badge variant={isActive ? "success" : "secondary"}>
  {isActive ? "Active" : "Revoked"}
</Badge>
```

---

## State Management

Components use Convex React hooks for real-time data:

```typescript
// In ShareDialog
const shareData = useQuery(api.sharedNotes.getShareByNoteId, { noteId });
const createShare = useMutation(api.sharedNotes.createShareLink);
const revokeShare = useMutation(api.sharedNotes.revokeShareLink);

// In ShareList
const myShares = useQuery(api.sharedNotes.getMySharedNotes);
```

No additional state management library needed (Zustand, Redux) - Convex handles reactivity.

---

## Toast Notifications

Use existing toast library (sonner) for user feedback:

```typescript
import { toast } from "sonner";

// Success
toast.success("Link copied to clipboard!");

// Error
toast.error("Failed to create share link. Please try again.");

// Info
toast.info("Share link has been revoked.");
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- Keyboard navigation support (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus indicators visible
- Color contrast meets 4.5:1 ratio
- Toast announcements for screen readers

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)
- ShareButton: renders, handles click, shows states
- ShareDialog: opens/closes, creates share, revokes share
- ShareList: displays items, handles actions
- PublicNoteView: renders content correctly

### Integration Tests
- Full share flow: click button → create link → copy → access public page
- Revocation flow: revoke link → verify inaccessible

### E2E Tests (Playwright - optional)
- User creates share link and accesses in new browser
- User revokes link and verifies inaccessible

---

## Performance Optimization

- Lazy load ShareDialog (only when opened)
- Memoize PublicNoteView rendering
- Use Suspense for async data fetching in Next.js
- Optimize images (use Next.js Image component if possible)

---

## Dark Mode Support

All components support dark mode via Tailwind dark: variants:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  {/* Content */}
</div>
```
