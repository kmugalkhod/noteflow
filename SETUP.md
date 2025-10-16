# NoteFlow Setup Guide

## Step-by-Step Implementation Plan

### Phase 1: Dependencies & Configuration

#### 1.1 Install Core Dependencies
```bash
npm install convex @convex-dev/auth lucide-react react-hook-form @hookform/resolvers zod date-fns
```

#### 1.2 Initialize Convex
```bash
npx convex dev
```
This will:
- Create `convex/` folder
- Generate Convex configuration files
- Provide a deployment URL (add to `.env.local`)

#### 1.3 Install shadcn/ui
```bash
npx shadcn@latest init
```
Choose:
- Style: **Default**
- Base color: **Slate** (we'll customize to purple/lavender)
- CSS variables: **Yes**

#### 1.4 Install shadcn/ui Components
```bash
npx shadcn@latest add button input card avatar dropdown-menu separator dialog command scroll-area badge tooltip form label textarea checkbox
```

---

### Phase 2: Convex Backend Setup

#### 2.1 Convex Schema (`convex/schema.ts`)
Define tables:
- `users`: User profiles and preferences
- `notes`: Note content and metadata
- `folders`: Folder organization
- `tags`: Tag definitions
- `noteTags`: Many-to-many relationship

#### 2.2 Convex Functions

**Files to create:**
- `convex/notes.ts` - Note CRUD operations
- `convex/folders.ts` - Folder management
- `convex/tags.ts` - Tag management
- `convex/users.ts` - User preferences
- `convex/auth.config.ts` - Authentication setup

---

### Phase 3: Project Structure

#### 3.1 Create Route Groups

**Auth Routes (`app/(auth)/`):**
- `login/page.tsx` - Login page
- `register/page.tsx` - Registration page
- `layout.tsx` - Auth layout (centered, minimal)

**Dashboard Routes (`app/(dashboard)/`):**
- `workspace/page.tsx` - Main workspace (home)
- `stories/page.tsx` - All notes list
- `shared/page.tsx` - Shared notes
- `blog/page.tsx` - Blog posts
- `note/[id]/page.tsx` - Note editor
- `folder/[id]/page.tsx` - Folder view
- `trash/page.tsx` - Deleted notes
- `layout.tsx` - Dashboard layout (sidebar + content)

#### 3.2 Create Component Structure

**Auth Components (`components/auth/`):**
- `login-form.tsx` - Login form with validation
- `register-form.tsx` - Registration form
- `oauth-buttons.tsx` - Google/GitHub OAuth

**Dashboard Components (`components/dashboard/`):**
- `sidebar.tsx` - Main navigation sidebar
- `folder-list.tsx` - Folder list with expand/collapse
- `folder-item.tsx` - Individual folder item
- `note-list.tsx` - Grid/list of notes
- `note-card.tsx` - Note preview card
- `note-editor.tsx` - Rich text editor
- `search-bar.tsx` - Search with command palette
- `user-menu.tsx` - User profile dropdown
- `writing-stats.tsx` - Word count widget
- `theme-toggle.tsx` - Light/dark mode
- `empty-state.tsx` - Empty state UI

**Shared Components (`components/shared/`):**
- `loading-spinner.tsx` - Loading indicator
- `error-boundary.tsx` - Error handling

---

### Phase 4: Configuration Files

#### 4.1 Environment Variables (`.env.local`)
```env
CONVEX_DEPLOYMENT=dev:your-deployment-url
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

#### 4.2 Middleware (`middleware.ts`)
- Protect dashboard routes
- Redirect unauthenticated users to login
- Handle auth callbacks

#### 4.3 Convex Provider (`app/providers.tsx`)
- Wrap app with ConvexClientProvider
- Configure authentication

---

### Phase 5: Styling & Theme

#### 5.1 Tailwind Configuration (`tailwind.config.ts`)
Add custom colors matching design:
```js
colors: {
  // Purple/Lavender theme from design
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
  }
}
```

#### 5.2 Global Styles (`app/globals.css`)
- CSS variables for shadcn theming
- Custom utility classes
- Typography styles

---

### Phase 6: Core Features Implementation

#### 6.1 Authentication Flow
1. User visits app → redirected to `/login`
2. Login/register with email/password or OAuth
3. Session stored in Convex
4. Redirect to `/workspace`

#### 6.2 Note Management
1. Create note → mutation with optimistic update
2. Edit note → auto-save with debounce (500ms)
3. Delete note → soft delete (moved to trash)
4. Restore note → move from trash back

#### 6.3 Folder Organization
1. Create folder → mutation
2. Assign notes to folder
3. Nested folder support (optional)
4. Drag & drop (future enhancement)

#### 6.4 Tag System
1. Create tags on-the-fly
2. Add/remove tags from notes
3. Filter notes by tags
4. Tag autocomplete

#### 6.5 Search Functionality
1. Full-text search using Convex search indexes
2. Search by title, content, tags
3. Command palette (Cmd/Ctrl + K)
4. Keyboard navigation

---

### Phase 7: UI Components (Based on Design)

#### 7.1 Sidebar Layout
- **Logo area**: "noteflow" branding
- **New story button**: Primary CTA
- **Navigation**:
  - 🏠 Workspace
  - 📄 All stories
  - 👥 Shared
  - 📝 Blog
- **Favorites section**: (empty state initially)
- **Folders section**: Expandable list with "+"
- **Writing stats**: Word count widget
- **User menu**: Avatar + dropdown

#### 7.2 Main Content Area
- **Empty state** (when no note selected):
  - Hero text: "Your new home for writing"
  - Subheading
  - Search bar: "/search for what to add"
  - Content blocks menu
- **Note editor** (when note selected):
  - Title input (large, bold)
  - Content area (auto-resize)
  - Toolbar (formatting options)
  - Auto-save indicator

---

### Phase 8: Real-time Features

#### 8.1 Convex Queries (Real-time)
- `useQuery(api.notes.getNotes)` - Auto-updates when data changes
- `useQuery(api.folders.getFolders)` - Live folder list
- `useQuery(api.tags.getTags)` - Live tag list

#### 8.2 Convex Mutations (Optimistic Updates)
- `useMutation(api.notes.create)` - Create note
- `useMutation(api.notes.update)` - Update note
- `useMutation(api.notes.delete)` - Delete note

#### 8.3 Auto-save Implementation
```tsx
const debouncedUpdate = useMemo(
  () => debounce((id, data) => updateNote({ id, ...data }), 500),
  []
);
```

---

### Phase 9: Testing & Deployment

#### 9.1 Local Testing
```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev server
```

#### 9.2 Production Deployment
```bash
npx convex deploy    # Deploy Convex backend
vercel deploy        # Deploy frontend to Vercel
```

#### 9.3 Environment Setup
- Add production Convex URL to Vercel
- Configure OAuth providers in Convex dashboard
- Set up custom domain (optional)

---

## Implementation Order (Priority)

### Sprint 1: Foundation (Days 1-3)
- [x] Next.js 15 setup
- [ ] Install dependencies
- [ ] Initialize Convex
- [ ] Setup shadcn/ui
- [ ] Define Convex schema
- [ ] Create basic Convex functions

### Sprint 2: Authentication (Days 4-5)
- [ ] Setup Convex Auth
- [ ] Create auth pages & forms
- [ ] Configure middleware
- [ ] Setup providers

### Sprint 3: Core Layout (Days 6-8)
- [ ] Create dashboard layout
- [ ] Build sidebar component
- [ ] Create navigation structure
- [ ] Setup route groups

### Sprint 4: Note Features (Days 9-12)
- [ ] Note list & card components
- [ ] Note editor with auto-save
- [ ] Folder management
- [ ] Tag system

### Sprint 5: Polish (Days 13-15)
- [ ] Search functionality
- [ ] Theme customization
- [ ] Responsive design
- [ ] Testing & bug fixes

---

## Key Design Patterns

### 1. File Naming Convention
- Components: PascalCase (e.g., `NoteCard.tsx`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Convex functions: camelCase (e.g., `getNotes`)

### 2. Component Structure
```tsx
// Pattern for all components
import { Component } from "@/components/ui/component"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function MyComponent() {
  const data = useQuery(api.module.query)
  const mutation = useMutation(api.module.mutation)

  return <div>...</div>
}
```

### 3. Convex Function Pattern
```ts
// Query pattern
export const getData = query({
  args: { id: v.id("table") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  }
})

// Mutation pattern
export const updateData = mutation({
  args: { id: v.id("table"), data: v.object({...}) },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, args.data)
  }
})
```

---

## Next Steps

Start with **Phase 2: Convex Backend Setup** by creating:
1. `convex/schema.ts` - Database schema
2. `convex/notes.ts` - Note functions
3. `convex/folders.ts` - Folder functions
4. `convex/tags.ts` - Tag functions
5. `convex/auth.config.ts` - Auth setup

Then proceed to **Phase 3: Project Structure** to set up routes and components.
