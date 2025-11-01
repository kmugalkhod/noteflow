# UI Consistency Guidelines: Drawing Feature

**Purpose**: Ensure the drawing feature visually integrates with Noteflow's existing note editor design.

**Last Updated**: 2025-10-31

---

## Design Principles

1. **Minimalism First**: Prioritize essential tools; hide advanced features
2. **Familiar Patterns**: Reuse existing component styles and interactions
3. **Semantic Tokens**: Use Tailwind semantic classes over hardcoded colors
4. **Consistent Feedback**: Match existing save indicators and loading states

---

## Color Palette (Tailwind Classes)

### Backgrounds
```css
/* Canvas background - matches note editor */
bg-[#fafafa] dark:bg-[#1a1a1a]

/* UI chrome (toolbars, sidebars, menus) */
bg-white dark:bg-gray-900

/* Muted backgrounds */
bg-muted/30       /* skeleton loaders */
bg-background/80  /* toast overlays with transparency */
```

### Borders
```css
border-gray-200 dark:border-gray-700  /* default borders */
border-border                          /* semantic border token */
border-blue-500                        /* active/selected states */
```

### Text
```css
text-foreground              /* primary text (semantic) */
text-muted-foreground        /* secondary/label text */
text-blue-600 dark:text-blue-400  /* active states */
text-green-600 dark:text-green-400  /* success states */
```

### Interactive States
```css
/* Default button */
hover:bg-gray-100 dark:hover:bg-gray-800
text-gray-700 dark:text-gray-300

/* Active/Selected button */
bg-blue-100 dark:bg-blue-900/30
text-blue-600 dark:text-blue-400
border-blue-500

/* Hover scale effect */
hover:scale-105 transition-all
```

---

## Typography Scale

### Labels & Metadata
```css
text-xs font-medium text-muted-foreground
/* Example: "Stroke", "Background", "Font size" */
```

### Button Text
```css
text-sm font-medium text-foreground
/* Example: "Export", "Clear", "Reset" */
```

### Tool Shortcuts
```css
text-xs text-gray-500
/* Example: "(V)", "(Cmd+Z)" */
```

### Font Family
Inherit from note editor (no custom font stacks):
```css
/* Use default - inherits system font */
className="..." /* no font-family override */
```

---

## Component Sizing

### Toolbar Buttons
```css
h-9 w-9 p-0 rounded-md
/* 36x36px clickable area */
```

### Property Sidebar
```css
w-56  /* 224px / 14rem */
/* Fixed width, left-aligned */
```

### Save Indicator
```css
px-3 py-1.5 rounded-full
/* Compact pill shape */
```

### Canvas Container
```css
max-w-4xl mx-auto
/* Match note editor's content width constraint */
```

---

## Layout Patterns

### Toolbar Layout (Top Center)
```tsx
<div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4">
  <div>{/* Left: Hamburger menu */}</div>
  <div>{/* Center: Main toolbar */}</div>
  <div>{/* Right: Action buttons */}</div>
</div>
```

### Property Sidebar (Left Fixed)
```tsx
<div className="fixed left-4 top-24 bottom-24 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
  {/* Sidebar content */}
</div>
```

### Save Indicator (Bottom Right)
```tsx
<div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm">
  {isSaving ? <Loader2 /> : <Check />}
  <span>{isSaving ? "Saving..." : "Saved"}</span>
</div>
```

---

## Animation & Transitions

### Standard Transition
```css
transition-all duration-200
/* Use for buttons, sidebars, hover states */
```

### Fade In (Component Mount)
```css
animate-fade-in
/* Applied to main containers on load */
```

### Slide Up (Toast/Notification)
```css
animate-slide-up
/* Applied to save indicators */
```

### Scale on Hover
```css
hover:scale-105
/* Applied to color swatches, tool buttons */
```

---

## Icon Usage

### Source: lucide-react
All icons should come from `lucide-react` package for consistency with note editor.

### Standard Size
```tsx
<IconName className="h-4 w-4" />
/* 16x16px for toolbar buttons */
```

### Loading Spinner
```tsx
<Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
/* Smaller for inline indicators */
```

### Success Check
```tsx
<Check className="w-3 h-3 text-green-500 animate-scale-in" />
```

---

## Spacing System

### Padding Conventions
```css
p-1   /* 4px - tight spacing (toolbar groups) */
p-4   /* 16px - standard padding (sidebars, menus) */
px-8 py-12  /* main content areas (match note editor) */
```

### Gap Spacing
```css
gap-1  /* 4px - toolbar buttons */
gap-2  /* 8px - action button groups */
gap-6  /* 24px - sidebar sections */
space-y-6  /* vertical spacing in forms */
```

### Border Radius
```css
rounded-md   /* 6px - buttons, inputs */
rounded-lg   /* 8px - toolbars, sidebars, canvas */
rounded-full /* pills - save indicators, tags */
```

---

## Shadow Hierarchy

### Toolbar/Sidebar
```css
shadow-md    /* Medium shadow for floating UI */
shadow-2xl   /* Deep shadow for property sidebar */
```

### Canvas
```css
shadow-lg    /* Canvas container */
```

### Toast/Indicator
```css
shadow-sm    /* Subtle shadow for notifications */
```

---

## State Management Patterns

### Loading State
Match note editor's skeleton loader:
```tsx
{isLoading && (
  <div className="h-12 bg-muted/30 rounded-md animate-pulse w-2/3" />
)}
```

### Saving State
Match note editor's save indicator:
```tsx
{isSaving && (
  <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border">
    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
    <span className="text-muted-foreground">Saving...</span>
  </div>
)}
```

### Success State
```tsx
{showSavedIndicator && (
  <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border">
    <Check className="w-3 h-3 text-green-500 animate-scale-in" />
    <span className="text-green-600 dark:text-green-400">Saved</span>
  </div>
)}
```

---

## Responsive Breakpoints

### Mobile (< 768px)
- Hide toolbars and sidebars
- Show readonly canvas only
- Display "Edit on desktop" message overlay

### Tablet (≥ 768px)
- Show simplified toolbar (essential tools only)
- Optional: Collapsed property sidebar
- Full editing capabilities

### Desktop (≥ 1024px)
- Full toolbar with all tools
- Property sidebar visible by default
- Optimal editing experience

---

## Component Checklist

Use this checklist when creating or updating drawing UI components:

- [ ] Colors use semantic Tailwind tokens (no hardcoded hex)
- [ ] Typography matches note editor scale
- [ ] Buttons are `h-9 w-9` with `rounded-md`
- [ ] Transitions use `transition-all duration-200`
- [ ] Icons are from `lucide-react` at `h-4 w-4`
- [ ] Save indicators match note editor location/style
- [ ] Spacing follows `gap-1`, `p-4`, `px-8 py-12` patterns
- [ ] Shadows use `shadow-md` / `shadow-lg` / `shadow-sm`
- [ ] Mobile responsive (hidden or readonly < 768px)
- [ ] Dark mode variants defined for all colors

---

## Anti-Patterns to Avoid

❌ **Don't**: Use hardcoded colors like `#ffffff` or `rgb(255,255,255)`
✅ **Do**: Use `bg-white dark:bg-gray-900` or semantic tokens

❌ **Don't**: Create custom font stacks or sizes
✅ **Do**: Use `text-xs`, `text-sm`, `font-medium` from Tailwind

❌ **Don't**: Position save indicators in different locations
✅ **Do**: Always use `fixed bottom-4 right-4` to match note editor

❌ **Don't**: Use different transition durations (`duration-300`, `duration-150`)
✅ **Do**: Consistently use `duration-200`

❌ **Don't**: Create bespoke button sizes
✅ **Do**: Use `h-9 w-9` for square icon buttons, match existing buttons

---

## Example: Refactoring for Consistency

### Before (Current Implementation)
```tsx
<div className="absolute top-24 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm shadow-lg">
  Saving...
</div>
```

### After (Consistent with Note Editor)
```tsx
<div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm animate-slide-up">
  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
  <span className="text-muted-foreground">Saving...</span>
</div>
```

**Changes**:
1. ✅ Position: `top-24 right-6` → `bottom-4 right-4`
2. ✅ Background: `bg-white/90` → `bg-background/80` (semantic)
3. ✅ Shape: `rounded-lg` → `rounded-full` (pill)
4. ✅ Size: `px-4 py-2` → `px-3 py-1.5` (more compact)
5. ✅ Border: `border-gray-200` → `border-border` (semantic)
6. ✅ Text: `text-sm` → `text-xs` (matches editor)
7. ✅ Animation: Added `animate-slide-up`

---

## Testing Checklist

Before merging drawing UI changes:

1. **Visual Comparison**
   - [ ] Place note editor and drawing UI side-by-side
   - [ ] Verify matching colors, fonts, spacing
   - [ ] Check dark mode parity

2. **Interaction Consistency**
   - [ ] Save indicators appear in same location
   - [ ] Loading states use same animation
   - [ ] Button hover effects match

3. **Responsive Behavior**
   - [ ] Test on mobile (< 768px): readonly mode works
   - [ ] Test on tablet (768px-1024px): simplified UI works
   - [ ] Test on desktop (≥ 1024px): full UI works

4. **Accessibility**
   - [ ] Color contrast meets WCAG AA (4.5:1)
   - [ ] Focus states visible on all interactive elements
   - [ ] ARIA labels present where needed

---

## References

- Note Editor Implementation: `/modules/notes/components/note-editor/note-editor.tsx`
- Tailwind Config: `/tailwind.config.ts`
- Existing UI Components: `/components/ui/`
- Drawing Components: `/components/drawing/`

---

## Maintenance

**Owner**: Frontend team
**Review Frequency**: Before each drawing feature PR
**Update Trigger**: When note editor design patterns change
