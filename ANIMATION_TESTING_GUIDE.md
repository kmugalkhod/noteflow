# Animation System Testing Guide

This guide explains how to test the animation preference system in NoteFlow.

## Overview

The animation system respects user preferences at three levels:
1. **System Preference** - OS-level `prefers-reduced-motion` setting
2. **User Override** - Manual toggle within the app
3. **Computed State** - Final animation state combining both preferences

## How to Test

### 1. Using the In-App Toggle (Easiest Method)

The animation toggle button is located in the **left sidebar footer** (bottom-left corner of the page), next to the theme toggle and UserMenu.

**Steps:**
1. Start the app: `npm run dev` (Server will run on http://localhost:3000 or another available port)
2. Log in to access the dashboard
3. Look at the **bottom of the left sidebar** (where "noteflow" branding is)
4. You'll see small icon buttons in the footer area
5. Click the **sparkles icon** (⚡) - it will be next to the sun/moon theme toggle
6. A dropdown menu will appear with three options:
   - **System Default** - Uses your OS setting
   - **Always On** - Forces animations on
   - **Always Off** - Forces animations off

**Troubleshooting:**
- If you don't see the toggle, make sure you're logged in and on the dashboard page
- Check browser console (F12) for any errors
- Try refreshing the page (Cmd+R / Ctrl+R)
- The sparkles icon should be colored blue when animations are enabled, gray when disabled

**What to observe:**
- With animations **ON**:
  - Hover over buttons = scale effect
  - Press buttons = active scale effect
  - Skeleton loaders = shimmer animation
  - Drag folders = opacity/scale feedback
  - Lists = fade-in animations
  - Modals = scale-in animation

- With animations **OFF**:
  - All animations are disabled
  - Interactions feel instant
  - No shimmer on loading states
  - No scale effects

### 2. Testing System Preference (OS-Level)

#### macOS:
```bash
# System Settings → Accessibility → Display → Reduce Motion
```

#### Windows:
```bash
# Settings → Accessibility → Visual Effects → Animation Effects (toggle off)
```

#### Linux (GNOME):
```bash
gsettings set org.gnome.desktop.interface enable-animations false
```

#### Browser DevTools Method (Works Everywhere):

1. Open Chrome/Edge DevTools (F12)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: "Emulate CSS prefers-reduced-motion"
4. Select: "Emulate CSS prefers-reduced-motion: reduce"

**Expected behavior:**
- When OS-level reduced motion is enabled, animations should be disabled by default
- You can still override using the in-app toggle
- Your preference is saved in localStorage

### 3. Testing localStorage Persistence

**Check saved preference:**
```javascript
// Open browser console (F12)
localStorage.getItem('noteflow:animation-preference')
```

**Values:**
- `null` or not set = System default
- `{"state":{"userPreference":false}}` = Always on
- `{"state":{"userPreference":true}}` = Always off

**Clear preference:**
```javascript
localStorage.removeItem('noteflow:animation-preference')
// Refresh the page
```

## Components with Animations

### Visual Feedback (Phase 3)
- ✅ **Buttons** - `components/ui/button.tsx`
  - `hover:scale-105` on hover
  - `active:scale-97` on press

- ✅ **Input Focus** - `app/globals.css`
  - Subtle border color change (no blue ring)

- ✅ **Drag & Drop** - `FolderTreeItem.tsx`
  - `opacity-50 scale-95` when dragging
  - Dashed border when drag target

### Transitions (Phase 4)
- ✅ **Modals/Dialogs** - Built-in Radix UI animations
  - Fade + zoom in/out

- ✅ **Page Transitions** - `PageTransition` component
  - Fade-in when route changes

- ✅ **List Animations** - `AnimatedList` component
  - Staggered slide-up effect

### Loading States (Phase 5)
- ✅ **Skeleton Loaders** - `skeleton-loader.tsx`
  - Shimmer animation (animated gradient)
  - Used in: NotesList, FolderTree, NoteEditor

## Animation Configuration

**File:** `modules/shared/lib/animation-config.ts`

**Durations:**
- INSTANT: 0ms
- FAST: 150ms
- NORMAL: 200ms
- SLOW: 300ms
- LOADING: 2000ms

**Easing Functions:**
- EASE_IN: `cubic-bezier(0.4, 0, 1, 1)`
- EASE_OUT: `cubic-bezier(0, 0, 0.2, 1)`
- EASE_IN_OUT: `cubic-bezier(0.4, 0, 0.2, 1)`

## Accessibility

All animations respect WCAG 2.1 AA guidelines:
- `prefers-reduced-motion` is honored globally via CSS
- Users can override system settings
- Reduced motion reduces animation duration to 0.01ms
- Essential feedback (focus, errors) is always visible

## Common Issues

### Issue: Animations not disabling
**Solution:**
1. Check browser console for errors
2. Verify localStorage is not blocked
3. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Toggle not appearing
**Solution:**
1. Check sidebar footer (bottom-left)
2. Ensure you're on a logged-in page
3. Check browser console for import errors

### Issue: Preference not persisting
**Solution:**
1. Check localStorage is enabled in browser
2. Clear cache and try again
3. Check for localStorage quota errors in console

## Technical Details

### State Management
- **Store:** Zustand with persist middleware
- **Storage Key:** `noteflow:animation-preference`
- **Hook:** `useAnimationState()`

### Helper Functions
```typescript
// Check if animations are enabled
const { animationsEnabled } = useAnimationState();

// Get animation class conditionally
const { getAnimationClass } = useAnimationState();
const className = getAnimationClass('animate-fade-in', '');

// Conditional animation class with base classes
const { conditionalAnimationClass } = useAnimationState();
const className = conditionalAnimationClass('base-class', 'animate-slide-up');
```

## Implementation Status

### ✅ Completed (P1 - MVP)
- [x] Animation preference system
- [x] Toast notifications (contextual auto-dismiss)
- [x] Visual feedback (hover, active, focus, drag)
- [x] Transitions (modals, pages, lists)
- [x] Loading states (skeletons with shimmer)
- [x] Animation toggle UI

### 🔄 In Progress (P2)
- [ ] Optimistic updates
- [ ] Keyboard navigation
- [ ] Typography improvements

### 📋 Planned (P3)
- [ ] Interaction states
- [ ] Micro-interactions
- [ ] Final polish

## Feedback

If you find any issues or have suggestions, please:
1. Test using the in-app toggle first
2. Check browser console for errors
3. Provide screenshots/videos if possible
4. Note your OS and browser version
