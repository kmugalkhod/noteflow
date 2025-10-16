# Notes App - Product Requirements Document

## 1. Project Overview

### 1.1 Product Name
**NotesFlow** (or your preferred name)

### 1.2 Executive Summary
A modern, collaborative notes application that allows users to create, organize, and manage their notes efficiently with real-time collaboration capabilities. The app leverages Convex as the backend for real-time sync, making it easy to add collaborative features in the future.

### 1.3 Project Goals
- Build a functional MVP within 3-4 weeks
- Provide fast and intuitive note-taking experience
- Support real-time sync across devices
- Enable easy collaboration features in future phases
- Support multiple organization methods (folders, tags, search)
- Ensure responsive design for all devices
- Maintain clean, maintainable codebase

---

## 2. Target Users

### 2.1 Primary Users
- Students organizing class notes and study materials
- Professionals managing work-related documentation
- Personal users for journaling and task tracking
- Teams collaborating on shared documents and notes
- Remote workers needing quick note capture across devices

### 2.2 User Needs
- Quick note creation without friction
- Easy retrieval through search and organization
- Real-time sync across multiple devices
- Ability to collaborate with others (future)
- Clean, distraction-free interface
- Data persistence and reliability
- Secure personal data storage

---

## 3. Feature Requirements

### 3.1 MVP Features (Phase 1)

#### 3.1.1 User Authentication
- **Registration**
  - Email and password signup
  - Social auth (Google, GitHub) via Convex Auth
  - Email verification
  - Password requirements (min 8 characters)
  - Account creation with default folder

- **Login/Logout**
  - Secure authentication with Convex Auth
  - "Remember me" functionality
  - Session management
  - Multi-device login support

- **Password Management**
  - Forgot password flow
  - Email-based password reset
  - Change password in settings

#### 3.1.2 Core Note Operations
- **Create Note**
  - Click "New Note" button to create blank note
  - Auto-focus on title field
  - Support plain text and markdown
  - Real-time auto-save (Convex handles sync)
  - Instant sync across devices
  
- **Edit Note**
  - Click on any note to open editor
  - In-place editing of title and content
  - Real-time sync indicator
  - Optimistic UI updates
  - Character/word count display
  - Last modified timestamp

- **Delete Note**
  - Delete button with confirmation dialog
  - Soft delete (move to trash for 30 days)
  - Permanent delete from trash
  - Restore from trash option

- **View Notes**
  - List/grid view toggle
  - Show note preview (first 100 characters)
  - Display note metadata (date, title, folder, tags)
  - Real-time updates when notes change
  - Infinite scroll with Convex pagination

#### 3.1.3 Organization
- **Search**
  - Real-time search across all notes
  - Search in both title and content
  - Full-text search using Convex search indexes
  - Instant results as you type
  - Highlight matching text
  - Search results ranked by relevance

- **Folders/Categories**
  - Create custom folders
  - Assign notes to folders
  - Default "All Notes" and "Uncategorized" folders
  - Folder navigation in sidebar
  - Rename and delete folders
  - Folder color customization
  - Real-time folder updates

- **Tags**
  - Add multiple tags per note
  - Tag autocomplete from existing tags
  - Filter notes by tag
  - Tag management (rename, delete)
  - Tag cloud view
  - Real-time tag updates

- **Sort & Filter**
  - Sort by: Date Created, Date Modified, Title (A-Z)
  - Filter by folder and/or tags
  - Multiple filter combinations
  - Clear filters button
  - Save filter preferences per user

#### 3.1.4 User Interface
- **Responsive Layout**
  - Desktop: Sidebar + main content area
  - Mobile: Collapsible menu
  - Tablet: Adaptive layout
  - Touch-friendly interactions

- **Theme Support**
  - Light mode (default)
  - Dark mode toggle
  - Save preference in Convex per user
  - System preference detection

- **Navigation**
  - Sidebar with folders and tags
  - Top bar with search and actions
  - Breadcrumb navigation
  - Quick note switcher (Cmd/Ctrl + K)

#### 3.1.5 Real-Time Sync
- **Automatic Sync**
  - Changes sync instantly across devices
  - Convex handles all real-time updates
  - No manual refresh needed
  - Optimistic updates with rollback on error
  - Offline support with automatic sync when online
  - Conflict resolution built-in

- **Data Management**
  - All data stored in Convex
  - Automatic backups
  - Data export (JSON, Markdown)
  - Data import from other apps

### 3.2 Phase 2 Features (Collaboration & Enhancement)

#### Real-Time Collaboration (Easy to add with Convex!)
- **Shared Notes**
  - Share notes with other users
  - Invite collaborators via email
  - View-only vs edit permissions
  - Remove collaborators

- **Live Collaboration**
  - See other users editing in real-time
  - Live cursors showing who's editing where
  - Live presence indicators
  - Collaborative conflict resolution
  - Activity feed showing changes

- **Comments & Mentions**
  - Add comments on notes
  - Reply to comments
  - Mention other collaborators (@username)
  - Resolve comment threads
  - Real-time comment updates

#### Rich Text Editor
- Bold, italic, underline formatting
- Headings (H1, H2, H3)
- Bullet and numbered lists
- Code blocks with syntax highlighting
- Links and inline images
- Tables
- Markdown shortcuts

#### Advanced Organization
- Nested folders (subfolders)
- Note pinning (favorites)
- Archive functionality
- Smart folders (saved searches)
- Note linking (backlinks)
- Duplicate notes

#### Additional Features
- File attachments (images, PDFs) with Convex file storage
- Color coding for notes
- Checklists/To-do items with progress tracking
- Note templates library
- Keyboard shortcuts customization
- Version history with restore
- Public sharing via link
- Export shared notes

---

## 4. Technical Requirements

### 4.1 Technology Stack

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **React**: React 18+ with Hooks & Server Components
- **Styling**: Tailwind CSS
- **State Management**: Convex React (built-in)
- **Real-time**: Convex subscriptions (useQuery)
- **Icons**: Lucide React
- **Routing**: Next.js App Router (file-based)
- **Form Management**: React Hook Form + Zod validation
- **Rich Text**: Tiptap or Lexical (Phase 2)
- **SEO**: Next.js Metadata API

#### Backend
- **Platform**: Convex (https://convex.dev)
  - Real-time database
  - Serverless functions (queries, mutations, actions)
  - Authentication (Convex Auth)
  - File storage
  - Full-text search
  - Automatic API generation
  - Real-time subscriptions
  - Optimistic updates
  - Built-in TypeScript support

#### Authentication
- **Provider**: Convex Auth
- **Methods**: Email/Password, Google OAuth, GitHub OAuth
- **Session Management**: Handled by Convex

#### Deployment
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Convex (automatically deployed)
- **Database**: Convex (managed)
- **File Storage**: Convex File Storage
- **Edge**: Vercel Edge Network for global performance

#### Development Tools
- **Framework**: Next.js 14+ with App Router
- **Package Manager**: npm or pnpm
- **Linting**: ESLint (Next.js config)
- **Formatting**: Prettier
- **Convex CLI**: For backend development
- **Convex Dashboard**: For data management
- **Dev Server**: Next.js dev server + Convex dev

### 4.2 Convex Schema

#### Schema Definition (convex/schema.ts)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    theme: v.union(v.literal("light"), v.literal("dark")),
    defaultView: v.union(v.literal("list"), v.literal("grid")),
  })
    .index("by_email", ["email"])
    .searchIndex("search_users", {
      searchField: "name",
    }),

  notes: defineTable({
    userId: v.id("users"),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    content: v.string(),
    isPinned: v.boolean(),
    color: v.optional(v.string()),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_folder", ["folderId"])
    .index("by_user_not_deleted", ["userId", "isDeleted"])
    .searchIndex("search_notes", {
      searchField: "title",
      filterFields: ["userId", "isDeleted"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "isDeleted"],
    }),

  folders: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  tags: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_name", ["userId", "name"]),

  noteTags: defineTable({
    noteId: v.id("notes"),
    tagId: v.id("tags"),
  })
    .index("by_note", ["noteId"])
    .index("by_tag", ["tagId"])
    .index("by_note_tag", ["noteId", "tagId"]),

  // Phase 2: Collaboration tables
  noteShares: defineTable({
    noteId: v.id("notes"),
    userId: v.id("users"),
    permission: v.union(v.literal("view"), v.literal("edit")),
    sharedBy: v.id("users"),
  })
    .index("by_note", ["noteId"])
    .index("by_user", ["userId"])
    .index("by_note_user", ["noteId", "userId"]),

  comments: defineTable({
    noteId: v.id("notes"),
    userId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    isResolved: v.boolean(),
  })
    .index("by_note", ["noteId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),
});
```

### 4.3 Convex Functions

#### Queries (Read Operations - Real-time)

```typescript
// convex/notes.ts

// Get all notes for current user
export const getNotes = query({
  args: {
    folderId: v.optional(v.id("folders")),
    tagId: v.optional(v.id("tags")),
    search: v.optional(v.string()),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Get single note
export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Search notes
export const searchNotes = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    // Full-text search implementation
  },
});

// Get folders
export const getFolders = query({
  handler: async (ctx) => {
    // Implementation
  },
});

// Get tags
export const getTags = query({
  handler: async (ctx) => {
    // Implementation
  },
});
```

#### Mutations (Write Operations)

```typescript
// Create note
export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Update note
export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Implementation with optimistic updates
  },
});

// Delete note (soft delete)
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Restore note
export const restoreNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Create folder
export const createFolder = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Create/attach tag
export const addTagToNote = mutation({
  args: {
    noteId: v.id("notes"),
    tagName: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### 4.4 Next.js Project Structure

```
notesflow-app/
├── app/
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx       # Login page
│   │   ├── register/
│   │   │   └── page.tsx       # Register page
│   │   └── layout.tsx         # Auth layout (centered form)
│   │
│   ├── (dashboard)/           # Protected route group
│   │   ├── notes/
│   │   │   ├── page.tsx       # Notes list
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Note editor
│   │   ├── folders/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Folder view
│   │   ├── trash/
│   │   │   └── page.tsx       # Trash/deleted notes
│   │   └── layout.tsx         # Dashboard layout (sidebar)
│   │
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home/landing page
│   ├── providers.tsx          # Convex provider wrapper
│   └── globals.css            # Global styles + Tailwind
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── notes/
│   │   ├── NotesList.tsx
│   │   ├── NoteCard.tsx
│   │   ├── NoteEditor.tsx
│   │   └── NoteFilters.tsx
│   ├── folders/
│   │   ├── FolderList.tsx
│   │   ├── FolderForm.tsx
│   │   └── FolderItem.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── ...
│
├── convex/
│   ├── schema.ts              # Database schema
│   ├── notes.ts               # Note queries & mutations
│   ├── folders.ts             # Folder queries & mutations
│   ├── tags.ts                # Tag queries & mutations
│   ├── auth.config.ts         # Auth configuration
│   ├── http.ts                # HTTP actions (if needed)
│   └── _generated/            # Auto-generated types
│
├── lib/
│   ├── utils.ts               # Utility functions
│   ├── constants.ts           # App constants
│   └── validations.ts         # Zod schemas
│
├── hooks/
│   ├── useAuth.ts             # Auth hook
│   ├── useNotes.ts            # Notes hook
│   └── useDebounce.ts         # Utility hooks
│
├── middleware.ts              # Next.js middleware for auth
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── .env.local                 # Environment variables
```

### 4.5 Next.js App Router Patterns

#### Route Groups for Organization
```typescript
// (auth) group - no auth required
// (dashboard) group - requires authentication

// app/(dashboard)/layout.tsx - Protected layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

#### Middleware for Protected Routes
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = // Check Convex auth
  
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/notes')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/folders/:path*'],
};
```

### 4.6 Frontend Integration (Next.js + Convex)

#### Using Convex in Next.js Components

```typescript
// components/notes/NotesList.tsx
"use client"; // Client component for interactivity

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function NotesList() {
  // Real-time query - automatically updates!
  const notes = useQuery(api.notes.getNotes, {
    folderId: selectedFolder,
    search: searchTerm,
  });

  // Mutations
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  // Optimistic updates handled automatically by Convex
  const handleCreateNote = async () => {
    await createNote({
      title: "New Note",
      content: "",
    });
  };

  return (
    <div>
      {notes?.map((note) => (
        <NoteCard key={note._id} note={note} />
      ))}
    </div>
  );
}
```

#### Convex Provider Setup (Next.js)

```typescript
// app/providers.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

// app/layout.tsx
import { ConvexClientProvider } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

#### Server Components with Convex (Advanced)

```typescript
// app/(dashboard)/notes/page.tsx
// This can be a Server Component for initial SSR

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { NotesList } from "@/components/notes/NotesList";

export default async function NotesPage() {
  // Server-side data fetching for initial load
  const initialNotes = await fetchQuery(api.notes.getNotes, {});
  
  return (
    <div>
      <h1>My Notes</h1>
      {/* Client component with real-time updates */}
      <NotesList initialData={initialNotes} />
    </div>
  );
}
```

### 4.5 Performance Requirements
- Initial page load: < 2 seconds
- Real-time updates: < 100ms latency
- Search response: < 200ms
- Smooth animations (60fps)
- Support 10,000+ notes per user
- Efficient pagination with Convex
- Optimistic updates for instant UI feedback

### 4.6 Security Requirements
- Authentication via Convex Auth (OAuth + email)
- User data isolation (row-level security in queries)
- HTTPS only in production
- Environment variables for secrets
- Rate limiting via Convex
- Input validation with Zod
- XSS prevention (input sanitization)

### 4.7 Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 5. User Interface Design

### 5.1 Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header (Logo, Search, Theme, User Menu)        │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │   Main Content Area                 │
│          │                                      │
│ Folders  │   [Note Editor or Notes List]       │
│ Tags     │   • Real-time updates               │
│ Shared   │   • Sync indicator                  │
│ Trash    │   • Collaboration status            │
│ Settings │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### 5.2 Color Palette
- **Light Mode**: 
  - Background: #FFFFFF
  - Surface: #F7F7F7
  - Primary: #3B82F6 (Blue)
  - Text: #1F2937
  - Border: #E5E7EB
  - Success: #10B981 (for sync indicators)

- **Dark Mode**:
  - Background: #1F2937
  - Surface: #111827
  - Primary: #60A5FA (Light Blue)
  - Text: #F9FAFB
  - Border: #374151
  - Success: #34D399

### 5.3 Key Screens

#### Login/Registration Screen
- Clean, centered form
- Email/password or social auth buttons
- Google and GitHub OAuth options
- "Forgot password" link
- Toggle between login/register

#### Home Screen (Notes List)
- Grid or list of note cards
- Real-time updates when notes change
- Each card shows: title, preview, date, tags, folder
- Sync status indicator
- Empty state: "Create your first note"
- Floating action button for new note (mobile)

#### Note Editor
- Full-screen or split view
- Title input at top
- Content textarea/editor below
- Real-time sync indicator (✓ Saved, ↻ Syncing)
- Metadata bar (date, word count, last modified)
- Collaboration indicators (Phase 2: who's viewing/editing)
- Action buttons (delete, share)
- Auto-save with Convex (no save button needed)

#### Sidebar
- Collapsible sections
- Active state highlighting
- Real-time note counts
- Quick access to folders and tags
- Shared notes section (Phase 2)
- Trash folder with count

---

## 6. User Flows

### 6.1 Registration & First Use Flow
1. User visits app
2. Clicks "Sign Up" or social auth button
3. Creates account with email or OAuth
4. Account created, automatically logged in
5. Default "General" folder created via Convex
6. Welcome modal with quick tour
7. Redirect to empty notes list

### 6.2 Create New Note Flow
1. User clicks "New Note" button
2. Convex mutation creates note instantly
3. UI updates optimistically
4. Editor opens with focus on title
5. User types title and content
6. Changes sync in real-time to Convex
7. Sync indicator shows "✓ Saved"
8. User opens on another device - sees note immediately

### 6.3 Real-Time Sync Flow
1. User edits note on Device A
2. Convex mutation updates database
3. Convex automatically pushes update to all subscribed devices
4. Device B receives update via subscription
5. UI updates automatically (no refresh needed)
6. Sync happens in < 100ms

### 6.4 Search Flow
1. User types in search box
2. Convex search query runs automatically
3. Results display in real-time as user types
4. Full-text search across title and content
5. Results update instantly with subscriptions
6. Click result to open note

### 6.5 Collaboration Flow (Phase 2)
1. User clicks "Share" on a note
2. Enters collaborator email
3. Convex mutation creates share record
4. Collaborator receives notification
5. Both users can see note in "Shared" section
6. Live edits show in real-time with cursors
7. Comments and mentions work instantly

---

## 7. Success Metrics

### 7.1 MVP Launch Metrics
- App loads successfully on all target browsers
- Users can register and login without errors
- CRUD operations work reliably with real-time sync
- Search returns results in < 200ms
- Real-time updates work across devices
- Data persists reliably in Convex
- Responsive design works on mobile/tablet
- Zero data loss incidents
- < 100ms sync latency

### 7.2 Technical Metrics
- Convex backend uptime: 99.9%+
- Real-time update latency: < 100ms
- Query response time: < 200ms
- Failed mutations: < 0.1%
- Frontend error rate: < 0.5%
- Optimistic update success rate: > 99%

### 7.3 User Engagement Metrics (Future)
- Daily active users
- Average notes per user
- Average session duration
- Collaboration feature adoption
- User retention rate (7-day, 30-day)
- Cross-device usage rate

---

## 8. Development Phases

### Phase 1: Setup & Authentication (Week 1)
- [ ] Create Next.js project (npx create-next-app@latest)
- [ ] Create Convex project (npx convex init)
- [ ] Install Convex client and React integration
- [ ] Configure Convex Auth (email + Google/GitHub)
- [ ] Create authentication pages (/login, /register)
- [ ] Set up middleware for protected routes
- [ ] Configure Tailwind CSS (included with Next.js)
- [ ] Create app layout with sidebar
- [ ] Set up Next.js metadata for SEO

### Phase 2: Core Schema & Functions (Week 1-2)
- [ ] Define Convex schema (users, notes, folders, tags)
- [ ] Create note mutations (create, update, delete, restore)
- [ ] Create note queries (get, list, search)
- [ ] Create folder mutations and queries
- [ ] Create tag mutations and queries
- [ ] Set up search indexes in Convex
- [ ] Test all functions in Convex dashboard

### Phase 3: Frontend Core Features (Week 2)
- [ ] Notes list view with real-time updates
- [ ] Note creation with optimistic updates
- [ ] Note editor with auto-save
- [ ] Note deletion with confirmation
- [ ] Trash functionality with restore
- [ ] Loading states and error handling
- [ ] Empty states
- [ ] Sync status indicators

### Phase 4: Organization & Search (Week 3)
- [ ] Folder management (CRUD) with real-time
- [ ] Tag system (CRUD) with real-time
- [ ] Filter by folder/tags
- [ ] Sort functionality
- [ ] Full-text search implementation
- [ ] Search results with highlighting
- [ ] Note count badges (real-time)
- [ ] Drag and drop for folders (optional)

### Phase 5: Polish & Enhancement (Week 3-4)
- [ ] Theme toggle (light/dark) with Convex storage
- [ ] User settings page
- [ ] Profile management
- [ ] Keyboard shortcuts
- [ ] Responsive design refinement
- [ ] Performance optimization
- [ ] Bug fixes and testing
- [ ] Documentation

### Phase 6: Deployment (Week 4)
- [ ] Deploy Convex backend (npx convex deploy)
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Configure OAuth providers
- [ ] Test production deployment
- [ ] Set up error tracking

### Phase 7: Collaboration Features (Post-MVP)
- [ ] Share note functionality
- [ ] Permissions system (view/edit)
- [ ] Real-time collaborative editing
- [ ] Live cursors and presence
- [ ] Comments system
- [ ] Mentions and notifications
- [ ] Activity feed
- [ ] Shared notes section in sidebar

---

## 9. Environment Setup

### 9.1 Environment Variables

#### Frontend (.env.local)
```bash
# Convex
NEXT_PUBLIC_CONVEX_URL="https://your-project.convex.cloud"

# App Config
NEXT_PUBLIC_APP_NAME="NotesFlow"

# OAuth (configured in Convex Dashboard)
# Google OAuth Client ID
# GitHub OAuth Client ID
```

#### Convex Configuration (.env.local in convex folder)
```bash
# Only needed for development
# Production managed in Convex dashboard
```

### 9.2 Convex Setup Steps

1. **Install Convex CLI**
   ```bash
   npm install -g convex
   ```

2. **Initialize Convex in your project**
   ```bash
   npx convex init
   ```

3. **Set up authentication**
   ```bash
   npm install @convex-dev/auth
   npx convex import
   ```

4. **Configure OAuth providers**
   - Go to Convex Dashboard → Settings → Auth
   - Add Google OAuth (Client ID + Secret)
   - Add GitHub OAuth (Client ID + Secret)

5. **Deploy Convex**
   ```bash
   npx convex deploy
   ```

6. **Get your Convex URL**
   - Copy from dashboard
   - Add to NEXT_PUBLIC_CONVEX_URL in frontend .env.local

---

## 10. Why Convex + Next.js for This Project?

### 10.1 Convex Advantages

✅ **Real-time by Default**
- All queries automatically subscribe to updates
- No WebSocket setup needed
- Changes sync instantly across devices

✅ **Built for Collaboration**
- Live presence tracking
- Optimistic updates
- Conflict resolution built-in
- Perfect for Phase 2 collaboration features

✅ **Developer Experience**
- TypeScript end-to-end
- Automatic API generation
- Type-safe queries and mutations
- Hot reload for backend changes
- Excellent debugging tools

✅ **Simplified Backend**
- No server setup or maintenance
- No database management
- Built-in authentication
- File storage included
- Automatic scaling

✅ **Performance**
- Serverless edge deployment
- Global CDN
- Efficient caching
- Fast full-text search

### 10.2 Next.js Advantages

✅ **Better Performance**
- Server-side rendering (SSR) for fast initial loads
- Static generation for public pages
- Automatic code splitting
- Image optimization built-in
- Edge runtime support

✅ **SEO-Friendly**
- Server-rendered pages for search engines
- Metadata API for dynamic SEO
- Better social media sharing
- Improved discoverability

✅ **Developer Experience**
- File-based routing (no React Router needed)
- API routes (if needed beyond Convex)
- TypeScript support out of the box
- Fast refresh and hot reload
- Built-in Tailwind CSS support

✅ **Production Ready**
- Optimized for Vercel deployment
- Edge functions for global performance
- Built-in security best practices
- Automatic HTTPS
- Environment variable management

### 10.3 Perfect Combination Because:
- **Next.js + Convex** = Best of both worlds
- Next.js handles frontend optimization and routing
- Convex handles backend, database, and real-time
- Both deploy seamlessly (Vercel + Convex)
- TypeScript end-to-end for type safety
- Real-time sync is critical for notes
- Easy to add collaboration later
- No complex backend setup
- Focus on building features, not infrastructure

---

## 11. Constraints & Assumptions

### 11.1 Constraints
- MVP uses Convex free tier (generous limits)
- Requires internet for initial load
- Collaboration features in Phase 2
- Limited to text-based notes initially (rich text in Phase 2)

### 11.2 Assumptions
- Users have modern browsers with JavaScript enabled
- Users accept data stored in cloud (Convex)
- Target audience comfortable with web applications
- Convex free tier sufficient for MVP testing
- Users willing to create accounts

---

## 12. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Convex service downtime | High | Convex has 99.9% uptime SLA, implement retry logic |
| Real-time performance with many users | Medium | Convex scales automatically, optimize queries |
| Authentication issues | Medium | Use Convex Auth (battle-tested), have fallback |
| Free tier limits | Low | Monitor usage, upgrade plan if needed |
| Learning curve for Convex | Low | Excellent docs, simple API, Claude Code can help |
| Scope creep | Medium | Stick to MVP, collaboration in Phase 2 |

---

## 13. Out of Scope (MVP)

The following features are explicitly **NOT** included in the MVP:
- Real-time collaboration (Phase 2)
- Rich text editor (Phase 2)
- File attachments (Phase 2)
- Comments and mentions (Phase 2)
- Mobile native apps
- Advanced analytics dashboard
- Public API or webhooks
- Paid features or monetization
- Third-party integrations

---

## 14. Getting Started Guide

### 14.1 Quick Start with Claude Code

```bash
# 1. Create project
mkdir notesflow-app && cd notesflow-app

# 2. Start Claude Code
claude-code
```

### 14.2 First Prompt for Claude Code

```
Read prd.md and set up a notes app with:

1. Next.js 14+ with App Router and TypeScript
2. Tailwind CSS (configured during Next.js setup)
3. Convex backend (run: npx convex init)
4. Convex Auth for authentication

Create the schema in convex/schema.ts with:
   - users table
   - notes table with search indexes
   - folders table
   - tags table
   - noteTags junction table

Set up Next.js project structure:
   - app/ directory structure:
     - (auth)/login, (auth)/register pages
     - (dashboard)/notes, (dashboard)/folders pages
     - layout.tsx with sidebar
     - providers.tsx for Convex provider
   - components/ directory:
     - auth/ (LoginForm, RegisterForm)
     - notes/ (NotesList, NoteEditor, NoteCard)
     - folders/ (FolderList, FolderForm)
     - layout/ (Sidebar, Header)
   - convex/ directory:
     - notes.ts (queries and mutations)
     - folders.ts (queries and mutations)
     - tags.ts (queries and mutations)
     - auth.config.ts

Configure everything according to the PRD.
```

---

## 15. Appendix

### 15.1 Glossary
- **Convex**: Backend platform with real-time database and serverless functions
- **Query**: Read operation that automatically subscribes to updates
- **Mutation**: Write operation that updates database
- **Action**: Server-side function for external API calls
- **Subscription**: Real-time connection that receives updates
- **Optimistic Update**: UI updates before server confirms

### 15.2 References
- React Documentation: https://react.dev
- Convex Documentation: https://docs.convex.dev
- Convex Auth: https://labs.convex.dev/auth
- Tailwind CSS: https://tailwindcss.com
- Convex Examples: https://github.com/get-convex/convex-demos

### 15.3 Convex Resources
- Dashboard: https://dashboard.convex.dev
- Community: https://discord.gg/convex
- Tutorials: https://docs.convex.dev/tutorial
- Stack: https://stack.convex.dev

### 15.4 Document Version
- **Version**: 4.0 (Next.js + Convex Edition)
- **Last Updated**: October 16, 2025
- **Author**: Product Team
- **Status**: Ready for Development with Next.js Frontend & Convex Backend