# NoteFlow Project Structure

## Modular Architecture

This project follows a **feature-based modular architecture** where code is organized by domain/feature rather than by technical type.

---

## Folder Structure

```
noteflow/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx          # References @/modules/auth
│   │   ├── register/
│   │   │   └── page.tsx          # References @/modules/auth
│   │   └── layout.tsx            # References @/modules/auth/layouts
│   │
│   ├── (dashboard)/               # Dashboard route group
│   │   ├── workspace/
│   │   │   └── page.tsx          # References @/modules/dashboard
│   │   ├── stories/
│   │   │   └── page.tsx
│   │   ├── shared/
│   │   │   └── page.tsx
│   │   ├── blog/
│   │   │   └── page.tsx
│   │   ├── note/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── folder/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── trash/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # References @/modules/dashboard/layouts
│   │
│   ├── api/                       # API routes (if needed)
│   ├── providers.tsx              # Global providers (Convex, Theme, etc.)
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/landing page
│   └── globals.css                # Global styles
│
├── modules/                       # Feature modules (main code organization)
│   │
│   ├── auth/                      # Authentication module
│   │   ├── components/            # Auth-specific components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── oauth-buttons.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   ├── views/                 # Auth page views/containers
│   │   │   ├── login-view.tsx
│   │   │   ├── register-view.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layouts/               # Auth-specific layouts
│   │   │   ├── auth-layout.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                 # Auth-specific hooks
│   │   │   ├── use-auth.ts
│   │   │   ├── use-login.ts
│   │   │   └── use-register.ts
│   │   │
│   │   ├── lib/                   # Auth utilities
│   │   │   ├── validation.ts     # Zod schemas
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/                 # Auth TypeScript types
│   │       └── index.ts
│   │
│   ├── dashboard/                 # Dashboard module
│   │   ├── components/            # Dashboard-specific components
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── sidebar-header.tsx
│   │   │   │   ├── sidebar-nav.tsx
│   │   │   │   ├── sidebar-footer.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── nav-item.tsx
│   │   │   │   ├── nav-group.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── user-menu/
│   │   │   │   ├── user-menu.tsx
│   │   │   │   ├── user-menu-trigger.tsx
│   │   │   │   ├── user-menu-content.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── writing-stats/
│   │   │   │   ├── writing-stats.tsx
│   │   │   │   ├── word-count.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── search-bar.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── views/                 # Dashboard page views
│   │   │   ├── workspace-view.tsx
│   │   │   ├── stories-view.tsx
│   │   │   ├── shared-view.tsx
│   │   │   ├── blog-view.tsx
│   │   │   ├── trash-view.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layouts/               # Dashboard layouts
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── main-content.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/                 # Dashboard hooks
│   │   │   ├── use-sidebar.ts
│   │   │   ├── use-navigation.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/                   # Dashboard utilities
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── notes/                     # Notes module
│   │   ├── components/
│   │   │   ├── note-list/
│   │   │   │   ├── note-list.tsx
│   │   │   │   ├── note-list-header.tsx
│   │   │   │   ├── note-list-filters.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── note-card/
│   │   │   │   ├── note-card.tsx
│   │   │   │   ├── note-card-header.tsx
│   │   │   │   ├── note-card-content.tsx
│   │   │   │   ├── note-card-footer.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── note-editor/
│   │   │   │   ├── note-editor.tsx
│   │   │   │   ├── editor-toolbar.tsx
│   │   │   │   ├── editor-content.tsx
│   │   │   │   ├── auto-save-indicator.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── note-menu/
│   │   │   │   ├── note-menu.tsx
│   │   │   │   ├── note-actions.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── views/
│   │   │   ├── note-detail-view.tsx
│   │   │   ├── note-editor-view.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-notes.ts
│   │   │   ├── use-note.ts
│   │   │   ├── use-create-note.ts
│   │   │   ├── use-update-note.ts
│   │   │   ├── use-delete-note.ts
│   │   │   ├── use-auto-save.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── validation.ts
│   │   │   ├── constants.ts
│   │   │   ├── utils.ts
│   │   │   └── editor-utils.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── folders/                   # Folders module
│   │   ├── components/
│   │   │   ├── folder-list/
│   │   │   │   ├── folder-list.tsx
│   │   │   │   ├── folder-list-header.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── folder-item/
│   │   │   │   ├── folder-item.tsx
│   │   │   │   ├── folder-icon.tsx
│   │   │   │   ├── folder-menu.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── folder-tree/
│   │   │   │   ├── folder-tree.tsx
│   │   │   │   ├── folder-tree-item.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── create-folder-dialog.tsx
│   │   │   ├── edit-folder-dialog.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── views/
│   │   │   ├── folder-view.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-folders.ts
│   │   │   ├── use-folder.ts
│   │   │   ├── use-create-folder.ts
│   │   │   ├── use-update-folder.ts
│   │   │   ├── use-delete-folder.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── validation.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── tags/                      # Tags module
│   │   ├── components/
│   │   │   ├── tag-list/
│   │   │   │   ├── tag-list.tsx
│   │   │   │   ├── tag-item.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── tag-input/
│   │   │   │   ├── tag-input.tsx
│   │   │   │   ├── tag-suggestions.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── tag-badge.tsx
│   │   │   ├── tag-filter.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-tags.ts
│   │   │   ├── use-create-tag.ts
│   │   │   ├── use-tag-autocomplete.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── validation.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── search/                    # Search module
│   │   ├── components/
│   │   │   ├── search-bar/
│   │   │   │   ├── search-bar.tsx
│   │   │   │   ├── search-input.tsx
│   │   │   │   ├── search-results.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── command-palette/
│   │   │   │   ├── command-palette.tsx
│   │   │   │   ├── command-item.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── search-filters.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-search.ts
│   │   │   ├── use-command-palette.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── search-utils.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── types/
│   │       └── index.ts
│   │
│   └── shared/                    # Shared/common module
│       ├── components/            # Shared components
│       │   ├── ui/                # Custom UI components (extends shadcn)
│       │   │   ├── empty-state.tsx
│       │   │   ├── loading-spinner.tsx
│       │   │   ├── error-message.tsx
│       │   │   ├── confirmation-dialog.tsx
│       │   │   └── index.ts
│       │   │
│       │   ├── layout/
│       │   │   ├── page-header.tsx
│       │   │   ├── page-content.tsx
│       │   │   └── index.ts
│       │   │
│       │   └── index.ts
│       │
│       ├── hooks/                 # Shared hooks
│       │   ├── use-media-query.ts
│       │   ├── use-debounce.ts
│       │   ├── use-local-storage.ts
│       │   └── index.ts
│       │
│       ├── lib/                   # Shared utilities
│       │   ├── utils.ts
│       │   ├── constants.ts
│       │   ├── date-utils.ts
│       │   └── format-utils.ts
│       │
│       └── types/                 # Shared types
│           ├── index.ts
│           └── common.ts
│
├── components/                    # shadcn/ui components (auto-generated)
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (other shadcn components)
│
├── convex/                        # Convex backend
│   ├── schema.ts                  # Database schema
│   ├── auth.config.ts             # Auth configuration
│   │
│   ├── users.ts                   # User queries & mutations
│   ├── notes.ts                   # Note queries & mutations
│   ├── folders.ts                 # Folder queries & mutations
│   ├── tags.ts                    # Tag queries & mutations
│   │
│   ├── _generated/                # Auto-generated by Convex
│   │   ├── api.d.ts
│   │   └── dataModel.d.ts
│   │
│   └── lib/                       # Convex utilities
│       └── utils.ts
│
├── lib/                           # Global utilities (Next.js convention)
│   └── utils.ts                   # Shared utility functions (cn, etc.)
│
├── public/                        # Static assets
│   ├── images/
│   └── icons/
│
├── styles/                        # Additional styles (if needed)
│
├── types/                         # Global TypeScript types
│   └── index.ts
│
├── middleware.ts                  # Next.js middleware (auth protection)
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
├── SETUP.md                       # Setup guide
├── PROJECT_STRUCTURE.md           # This file
└── prd.md                         # Product requirements

```

---

## Module Organization Principles

### 1. **Feature-Based Modules**
Each module (`auth`, `dashboard`, `notes`, etc.) is self-contained with:
- `components/` - UI components
- `views/` - Page-level components (containers)
- `layouts/` - Layout components
- `hooks/` - Custom React hooks
- `lib/` - Utilities and helpers
- `types/` - TypeScript type definitions

### 2. **Clear Separation of Concerns**
- **Components**: Reusable UI pieces (buttons, forms, cards)
- **Views**: Page containers that compose components
- **Layouts**: Structural wrappers (sidebars, headers)
- **Hooks**: Encapsulated logic (data fetching, state management)
- **Lib**: Pure functions and utilities

### 3. **Import Paths**
Using TypeScript path aliases:
```tsx
// App router references modules
import { LoginView } from "@/modules/auth/views"
import { DashboardLayout } from "@/modules/dashboard/layouts"
import { NoteEditor } from "@/modules/notes/components"

// Modules reference shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Modules reference shared utilities
import { cn } from "@/lib/utils"
import { EmptyState } from "@/modules/shared/components"
```

### 4. **Barrel Exports**
Each folder has an `index.ts` for clean imports:
```tsx
// modules/auth/components/index.ts
export { LoginForm } from "./login-form"
export { RegisterForm } from "./register-form"
export { OAuthButtons } from "./oauth-buttons"

// Usage
import { LoginForm, RegisterForm } from "@/modules/auth/components"
```

---

## Example: How Pages Reference Modules

### Auth Pages
```tsx
// app/(auth)/login/page.tsx
import { LoginView } from "@/modules/auth/views"

export default function LoginPage() {
  return <LoginView />
}
```

```tsx
// modules/auth/views/login-view.tsx
import { LoginForm, OAuthButtons } from "@/modules/auth/components"

export function LoginView() {
  return (
    <div className="login-container">
      <h1>Login</h1>
      <LoginForm />
      <OAuthButtons />
    </div>
  )
}
```

### Dashboard Pages
```tsx
// app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/modules/dashboard/layouts"

export default function Layout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
```

```tsx
// modules/dashboard/layouts/dashboard-layout.tsx
import { Sidebar } from "@/modules/dashboard/components/sidebar"

export function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

```tsx
// app/(dashboard)/workspace/page.tsx
import { WorkspaceView } from "@/modules/dashboard/views"

export default function WorkspacePage() {
  return <WorkspaceView />
}
```

---

## Benefits of This Structure

✅ **Scalability**: Easy to add new features without affecting existing code
✅ **Maintainability**: Clear organization makes code easy to find
✅ **Reusability**: Components and hooks can be shared within modules
✅ **Testability**: Isolated modules are easier to test
✅ **Collaboration**: Team members can work on different modules independently
✅ **Type Safety**: TypeScript types are co-located with their modules

---

## Next Steps

1. Create the base module folders structure
2. Set up TypeScript path aliases in `tsconfig.json`
3. Create barrel exports (`index.ts`) for each module
4. Start building components within their respective modules
5. Reference modules from app router pages
