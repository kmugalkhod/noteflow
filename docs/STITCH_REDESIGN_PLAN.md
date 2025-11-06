# NoteFlow → Stitch Aesthetic Redesign Plan

**Date**: November 4, 2025
**Goal**: Redesign NoteFlow to match Stitch app aesthetic while maintaining ALL existing features

---

## 🎯 Design Analysis: Stitch vs Current NoteFlow

### Current NoteFlow Structure
```
┌─────────────┬──────────────┬─────────────────┐
│  Folder     │  Notes List  │   Editor        │
│  Sidebar    │  (vertical)  │   (content)     │
│  235px      │  300px       │   Flexible      │
└─────────────┴──────────────┴─────────────────┘
```

### Stitch Structure (Target)
```
┌─────────────┬──────────────┬─────────────────┐
│  Sidebar    │  All Notes   │   Editor        │
│  (folders+  │  (card list  │   (title +      │
│   nav)      │   + sort)    │   toolbar +     │
│             │              │   content)      │
└─────────────┴──────────────┴─────────────────┘
```

**Key Differences**:
- ✅ **Same**: Three-column layout preserved
- 🎨 **Visual**: Darker, richer colors in dark mode
- 📝 **Notes List**: Card-based with metadata preview
- 🔧 **Toolbar**: Cleaner, more compact editor toolbar
- 🎨 **Typography**: More refined spacing and hierarchy

---

## 🎨 Visual Design Comparison

### Colors (Dark Mode)

| Element | Current | Stitch Target |
|---------|---------|---------------|
| **Sidebar** | `#454545` (medium gray) | `#1a1a1a` (very dark) |
| **Notes List** | `#242426` (dark) | `#242424` (very dark gray) |
| **Editor BG** | `#1c1c1e` (very dark) | `#2d2d2d` (medium dark) |
| **Selected Item** | `#3a3a3c` | `#3a4556` (blue-tinted dark) |
| **Text** | `#ffffff` | `#e4e4e7` (soft white) |
| **Muted Text** | `#98989d` | `#a1a1aa` (lighter gray) |

### Colors (Light Mode)

| Element | Current | Stitch Target |
|---------|---------|---------------|
| **Sidebar** | `#f2f2f7` (light gray) | `#fafafa` (off-white) |
| **Notes List** | `#ffffff` (white) | `#ffffff` (white) |
| **Editor BG** | `#ffffff` (white) | `#ffffff` (white) |
| **Selected Item** | `#e0e0e5` | `#e5e7eb` (light gray) |
| **Text** | `#000000` | `#18181b` (near-black) |
| **Muted Text** | `#6e6e73` | `#71717a` (gray) |

---

## 📐 Component Redesign Breakdown

### 1. Sidebar (Left Column)

**Current Features** (MUST PRESERVE):
- ✅ Workspace header
- ✅ Search bar
- ✅ Uncategorized, Favorites, Trash, Drawing navigation
- ✅ Folder tree with expand/collapse
- ✅ Create folder button
- ✅ User menu + theme toggle footer

**Stitch-Style Changes**:
- **Search**: Add subtle icon, cleaner input style
- **Navigation Items**: Add hover states with subtle bg change
- **Folder Items**: Tighter spacing, refined icons
- **Footer**: Match Stitch's minimal footer design
- **Typography**: Use more refined font weights

**Implementation**:
- Update `FolderSidebar.tsx`
- Adjust spacing from `py-1.5` to `py-2` for touch-friendly
- Refine hover states with smoother transitions
- Update icon sizes for visual balance

---

### 2. Notes List (Middle Column)

**Current Features** (MUST PRESERVE):
- ✅ Toolbar with new note button, delete, toggle sidebar/panel
- ✅ Note list items with title, preview, timestamp
- ✅ Favorite indicator
- ✅ Drag and drop support
- ✅ Selected state highlighting
- ✅ Empty state
- ✅ Skeleton loading

**Stitch-Style Changes**:
- **Header**: Add "All Notes" title + "Sort" dropdown (like Stitch)
- **Note Cards**:
  - Larger spacing between cards
  - Show timestamp + word count metadata
  - Cleaner preview truncation
  - Subtle border instead of shadow
- **Visual Hierarchy**: Title bold, preview light, meta gray

**Implementation**:
- Update `NotesList.tsx` - add header with "All Notes" + sort
- Update `NoteListItem.tsx` - card-based design
- Add sort dropdown component
- Update `NotesListToolbar.tsx` - simpler design

---

### 3. Editor (Right Column)

**Current Features** (MUST PRESERVE):
- ✅ All rich text editing capabilities
- ✅ Block-based editing system
- ✅ Formatting toolbar
- ✅ Cover image support
- ✅ Drawing canvas integration
- ✅ Auto-save functionality

**Stitch-Style Changes**:
- **Header**:
  - Show note title prominently
  - Add metadata row: "Last saved" + word count
  - Share/options buttons on right
- **Toolbar**:
  - Simplified icons (B, I, U, etc.)
  - Cleaner spacing
  - Subtle background
  - Group related actions
- **Content Area**: Maintain current editing experience

**Implementation**:
- Update `note-editor.tsx` - add metadata header
- Update `FormattingToolbar.tsx` - refine icon set
- Add word count display
- Preserve all block types and functionality

---

## 🔧 Implementation Strategy

### Phase 1: Theme Colors ✅
**Files to Update**:
- `app/globals.css` - Update CSS variables

**Changes**:
```css
:root {
  /* Light Mode - Stitch inspired */
  --sidebar: #fafafa;
  --notes-list-bg: #ffffff;
  --editor-bg: #ffffff;
  --border: #e5e7eb;
  --muted-foreground: #71717a;
  --foreground: #18181b;
}

.dark {
  /* Dark Mode - Stitch inspired */
  --sidebar: #1a1a1a;
  --notes-list-bg: #242424;
  --editor-bg: #2d2d2d;
  --border: #3f3f46;
  --muted-foreground: #a1a1aa;
  --foreground: #e4e4e7;
  --folder-selected-bg: #3a4556; /* Blue-tinted */
}
```

---

### Phase 2: Sidebar Refinements
**Files**:
- `modules/dashboard/components/folder-sidebar/FolderSidebar.tsx`
- `modules/dashboard/components/folder-tree/FolderTreeItem.tsx`
- `modules/search/components/search-bar/search-bar.tsx`

**Changes**:
- Refine spacing (py-2 instead of py-1.5)
- Update search input styling
- Smoother transitions
- Refined typography

---

### Phase 3: Notes List Redesign
**Files**:
- `modules/dashboard/components/notes-list/NotesList.tsx`
- `modules/dashboard/components/notes-list/NoteListItem.tsx`
- `modules/dashboard/components/notes-list/NotesListToolbar.tsx`

**Changes**:
- Add "All Notes" header + sort dropdown
- Card-based note items
- Show metadata (timestamp + preview)
- Cleaner visual hierarchy

---

### Phase 4: Editor Enhancements
**Files**:
- `modules/notes/components/note-editor/note-editor.tsx`
- `modules/notes/components/rich-editor/FormattingToolbar.tsx`

**Changes**:
- Add editor header with metadata
- Refine toolbar icons and spacing
- Add word count display
- Preserve all editing functionality

---

### Phase 5: Polish & Testing
- Typography refinements
- Spacing adjustments
- Hover state polish
- Test all features:
  - ✅ Folder creation/deletion
  - ✅ Note creation/editing/deletion
  - ✅ Favorites
  - ✅ Trash
  - ✅ Drawing
  - ✅ Sharing
  - ✅ Search
  - ✅ Drag & drop
  - ✅ Theme switching

---

## 📝 Preserved Features Checklist

### Navigation ✅
- [x] Uncategorized notes view
- [x] Favorites view
- [x] Trash view
- [x] Drawing view
- [x] Folder navigation
- [x] Search functionality
- [x] Command palette (Cmd+K)

### Notes Management ✅
- [x] Create notes
- [x] Edit notes (rich text)
- [x] Delete notes (soft delete)
- [x] Favorite notes
- [x] Pin notes (if applicable)
- [x] Move notes to folders
- [x] Drag and drop

### Folders ✅
- [x] Create folders
- [x] Edit folders
- [x] Delete folders
- [x] Nested folders
- [x] Expand/collapse
- [x] Drag notes to folders

### Editor Features ✅
- [x] Block-based editing
- [x] All block types (heading, text, todo, quote, code, etc.)
- [x] Formatting (bold, italic, underline)
- [x] Links, images
- [x] Cover images
- [x] Drawing canvas integration
- [x] Auto-save

### Sharing ✅
- [x] Public sharing
- [x] Share button
- [x] Share dialog
- [x] View shared notes

### Trash ✅
- [x] View deleted items
- [x] Restore items
- [x] Permanent delete
- [x] Auto-expiration

### Theme ✅
- [x] Light mode
- [x] Dark mode
- [x] Theme toggle
- [x] Smooth transitions

### Layout ✅
- [x] Three-column layout
- [x] Resizable notes panel
- [x] Collapsible sidebar
- [x] Collapsible notes panel
- [x] Persistent state (localStorage)

---

## 🚀 Success Criteria

1. **Visual**: Matches Stitch aesthetic (colors, typography, spacing)
2. **Functional**: ALL existing features work perfectly
3. **Performance**: No degradation in performance
4. **Responsive**: Mobile/tablet layouts still work
5. **Accessible**: Keyboard navigation, screen readers, focus states
6. **Themes**: Both light and dark modes look great
7. **Smooth**: Transitions and animations feel polished

---

## 📊 Progress Tracking

- [x] Analysis complete
- [ ] Phase 1: Theme colors
- [ ] Phase 2: Sidebar refinements
- [ ] Phase 3: Notes list redesign
- [ ] Phase 4: Editor enhancements
- [ ] Phase 5: Polish & testing

---

## 🎨 Design Tokens (Stitch-inspired)

### Spacing Scale
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 12px (0.75rem)
- **lg**: 16px (1rem)
- **xl**: 24px (1.5rem)
- **2xl**: 32px (2rem)

### Typography Scale
- **xs**: 11px / 0.6875rem (metadata)
- **sm**: 13px / 0.8125rem (secondary text)
- **base**: 14px / 0.875rem (body text)
- **lg**: 16px / 1rem (headings)
- **xl**: 20px / 1.25rem (titles)
- **2xl**: 24px / 1.5rem (page headers)

### Border Radius
- **sm**: 4px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px

---

**Status**: Ready to implement 🚀
