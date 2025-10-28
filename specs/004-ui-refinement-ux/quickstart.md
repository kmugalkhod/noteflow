# Quickstart Guide: UI/UX Refinement & Polish

**Date**: 2025-10-27
**Feature**: UI/UX Refinement & Polish
**Audience**: Developers implementing the UX enhancements

## Overview

This guide provides step-by-step instructions for implementing the UI/UX refinement features across the application. Follow the priorities (P1 → P2 → P3) to ensure critical improvements are delivered first.

---

## Prerequisites

- ✅ Node.js and dependencies installed (`npm install` or `yarn install`)
- ✅ Tailwind CSS v4 configured (already set up)
- ✅ tw-animate-css installed (already set up)
- ✅ Sonner toast library installed (already set up)
- ✅ Radix UI components installed (already set up)
- ✅ Zustand for state management (already set up)

---

## Phase 1: Foundation (Priority P1)

### 1.1 Create Animation Utilities

**Goal**: Set up centralized animation configuration and hooks

**Files to create**:
1. `modules/shared/hooks/use-prefers-reduced-motion.ts`
2. `modules/shared/hooks/use-animation-state.ts`
3. `modules/shared/lib/animation-config.ts`
4. `modules/shared/stores/animation-store.ts`

**Step 1: Create `use-prefers-reduced-motion.ts`**

```typescript
import { useEffect, useState } from 'react';

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    setIsLoaded(true);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return { prefersReducedMotion, isLoaded };
};
```

**Step 2: Create `animation-store.ts`** (Zustand)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnimationPreferencesState {
  systemPrefersReducedMotion: boolean;
  userPreference: boolean | null;
  animationsEnabled: boolean;
  setSystemPreference: (value: boolean) => void;
  setUserPreference: (value: boolean | null) => void;
  toggleAnimations: () => void;
}

export const useAnimationStore = create<AnimationPreferencesState>()(
  persist(
    (set, get) => ({
      systemPrefersReducedMotion: false,
      userPreference: null,

      // Computed property using getter
      get animationsEnabled() {
        const state = get();
        if (state.userPreference !== null) {
          return !state.userPreference;
        }
        return !state.systemPrefersReducedMotion;
      },

      setSystemPreference: (value) => set({ systemPrefersReducedMotion: value }),
      setUserPreference: (value) => set({ userPreference: value }),
      toggleAnimations: () => {
        const state = get();
        set({ userPreference: !state.animationsEnabled });
      },
    }),
    {
      name: 'noteflow:animation-preference',
    }
  )
);
```

**Step 3: Initialize in root layout** (`app/layout.tsx`)

```typescript
'use client';

import { useEffect } from 'react';
import { useAnimationStore } from '@/modules/shared/stores/animation-store';
import { usePrefersReducedMotion } from '@/modules/shared/hooks/use-prefers-reduced-motion';

export function AnimationPreferenceProvider({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion } = usePrefersReducedMotion();
  const setSystemPreference = useAnimationStore((s) => s.setSystemPreference);

  useEffect(() => {
    setSystemPreference(prefersReducedMotion);
  }, [prefersReducedMotion, setSystemPreference]);

  return <>{children}</>;
}
```

---

### 1.2 Enhance Focus Indicators

**Goal**: Add visible focus indicators to all interactive elements

**Update**: `app/globals.css`

```css
/* Add to @layer base (already exists, enhance it) */
@layer base {
  /* High-contrast focus indicators */
  *:focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
  }

  /* Ensure keyboard users see focus, not mouse users */
  *:focus:not(:focus-visible) {
    @apply outline-none ring-0;
  }

  /* Button focus states */
  button:focus-visible,
  [role="button"]:focus-visible {
    @apply ring-2 ring-primary ring-offset-2;
  }

  /* Link focus states */
  a:focus-visible {
    @apply ring-2 ring-primary ring-offset-2 rounded-sm;
  }

  /* Input focus states (already handled by Radix, ensure consistency) */
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    @apply ring-2 ring-primary ring-offset-0;
  }
}
```

**Test**: Tab through the application and verify all interactive elements have visible focus indicators.

---

### 1.3 Implement Skeleton Loaders

**Goal**: Add skeleton loaders to prevent layout shifts during data loading

**Update**: `components/ui/skeleton.tsx` (enhance existing)

```typescript
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
}

// Predefined skeleton patterns
function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />;
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar };
```

**Usage Example**:

```typescript
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

function NotesList() {
  const { data: notes, isLoading } = useNotes();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return notes.map((note) => <NoteCard key={note.id} note={note} />);
}
```

---

### 1.4 Configure Sonner Toast Notifications

**Goal**: Set up contextual auto-dismiss behavior for toasts

**Create**: `modules/shared/lib/toast.ts`

```typescript
import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  type: ToastType;
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const TOAST_DURATIONS = {
  success: 3000,
  info: 3000,
  error: Infinity,
  warning: Infinity,
};

export function showToast({ type, message, description, action }: ToastConfig) {
  const config = {
    description,
    duration: TOAST_DURATIONS[type],
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  };

  switch (type) {
    case 'success':
      return sonnerToast.success(message, config);
    case 'error':
      return sonnerToast.error(message, config);
    case 'info':
      return sonnerToast.info(message, config);
    case 'warning':
      return sonnerToast.warning(message, config);
  }
}

// Convenience helpers
export const toast = {
  success: (message: string, description?: string) =>
    showToast({ type: 'success', message, description }),

  error: (message: string, description?: string, retry?: () => void) =>
    showToast({
      type: 'error',
      message,
      description,
      action: retry ? { label: 'Retry', onClick: retry } : undefined,
    }),

  info: (message: string, description?: string) =>
    showToast({ type: 'info', message, description }),

  warning: (message: string, description?: string) =>
    showToast({ type: 'warning', message, description }),
};
```

**Update**: `app/layout.tsx` (add Toaster if not already present)

```typescript
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          expand={false}
        />
      </body>
    </html>
  );
}
```

**Usage Example**:

```typescript
import { toast } from '@/modules/shared/lib/toast';

// Success (auto-dismisses after 3s)
await saveNote(note);
toast.success('Note saved successfully');

// Error (persists until dismissed)
try {
  await deleteNote(noteId);
} catch (error) {
  toast.error(
    'Failed to delete note',
    'Please try again',
    () => deleteNote(noteId) // Retry action
  );
}
```

---

## Phase 2: Enhancement (Priority P2)

### 2.1 Enhance Keyboard Navigation

**Goal**: Implement arrow key navigation in lists and trees

**Create**: `modules/shared/hooks/use-keyboard-nav.ts`

```typescript
import { useCallback, useState, useEffect, useRef } from 'react';

interface UseKeyboardNavOptions<T> {
  items: T[];
  onSelect?: (item: T) => void;
  loop?: boolean; // Loop to start/end
}

export function useKeyboardNav<T>({
  items,
  onSelect,
  loop = false,
}: UseKeyboardNavOptions<T>) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const focusNext = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev >= items.length - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [items.length, loop]);

  const focusPrevious = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev <= 0) {
        return loop ? items.length - 1 : prev;
      }
      return prev - 1;
    });
  }, [items.length, loop]);

  const selectCurrent = useCallback(() => {
    const item = items[focusedIndex];
    if (item && onSelect) {
      onSelect(item);
    }
  }, [focusedIndex, items, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusPrevious();
          break;
        case 'Enter':
          e.preventDefault();
          selectCurrent();
          break;
      }
    },
    [focusNext, focusPrevious, selectCurrent]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (containerRef.current) {
      const focusedElement = containerRef.current.children[focusedIndex] as HTMLElement;
      focusedElement?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    containerRef,
  };
}
```

**Usage Example**:

```typescript
function NotesList({ notes }: { notes: Note[] }) {
  const { focusedIndex, handleKeyDown, containerRef } = useKeyboardNav({
    items: notes,
    onSelect: (note) => navigateToNote(note.id),
    loop: true,
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      className="space-y-2 focus-visible:outline-none"
    >
      {notes.map((note, index) => (
        <div
          key={note.id}
          role="option"
          aria-selected={index === focusedIndex}
          className={cn(
            'p-3 rounded-lg transition-all duration-150',
            index === focusedIndex && 'ring-2 ring-primary bg-accent'
          )}
        >
          {note.title}
        </div>
      ))}
    </div>
  );
}
```

---

### 2.2 Typography & Visual Hierarchy

**Goal**: Ensure consistent typography scale and spacing

**Create**: `modules/shared/lib/typography.ts`

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const headingVariants = cva('font-semibold', {
  variants: {
    level: {
      1: 'text-4xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base',
    },
    spacing: {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
    },
  },
  defaultVariants: {
    level: 2,
    spacing: 'tight',
  },
});

export const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    color: {
      primary: 'text-foreground',
      secondary: 'text-muted-foreground',
      accent: 'text-primary',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'primary',
  },
});
```

**Audit existing components** and apply consistent classes:
- Headings: `text-2xl font-semibold` (section), `text-xl font-semibold` (subsection)
- Body: `text-base text-foreground`
- Metadata: `text-sm text-muted-foreground`
- Emphasis: `font-medium` or `text-primary`

---

## Phase 3: Polish (Priority P3)

### 3.1 Micro-interactions

**Goal**: Add subtle animations to buttons, icons, and interactions

**Update component classes**:

```typescript
// Button hover (all buttons)
className="hover:scale-105 transition-transform duration-150"

// Icon hover (icon buttons)
className="hover:scale-110 transition-transform duration-150"

// Active press (mobile-friendly)
className="active:scale-97 transition-transform duration-100"

// Success pulse (after action completes)
<CheckIcon className="animate-pulse" />
```

**Create**: `modules/shared/lib/animations.ts`

```typescript
export const microAnimations = {
  hover: 'hover:scale-105 transition-transform duration-150',
  hoverIcon: 'hover:scale-110 transition-transform duration-150',
  press: 'active:scale-97 transition-transform duration-100',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

// Usage
import { microAnimations } from '@/modules/shared/lib/animations';

<Button className={microAnimations.hover}>
  Click me
</Button>
```

---

## Testing Checklist

### Visual Testing
- [ ] All animations run at 60fps (use browser DevTools Performance tab)
- [ ] No layout shifts during loading (CLS score < 0.1)
- [ ] Skeleton loaders match final content layout
- [ ] Focus indicators visible on all interactive elements

### Keyboard Testing
- [ ] Tab through entire app - all elements reachable
- [ ] Arrow keys navigate lists/trees
- [ ] Enter selects items
- [ ] Escape closes modals/dropdowns
- [ ] Focus returns to trigger after modal close

### Accessibility Testing
- [ ] prefers-reduced-motion disables animations
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)
- [ ] Touch targets minimum 44x44px on mobile
- [ ] Screen reader announces focus changes

### Toast Testing
- [ ] Success/info toasts auto-dismiss after 3s
- [ ] Error/warning toasts persist until dismissed
- [ ] Action buttons in error toasts work correctly
- [ ] Multiple toasts queue properly

---

## Common Patterns

### Pattern 1: Conditional Animation Classes

```typescript
import { useAnimationStore } from '@/modules/shared/stores/animation-store';
import { cn } from '@/lib/utils';

function MyComponent() {
  const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);

  return (
    <div
      className={cn(
        animationsEnabled && 'transition-all duration-200',
        'hover:bg-accent'
      )}
    >
      Content
    </div>
  );
}
```

### Pattern 2: Loading with Skeleton

```typescript
function DataComponent() {
  const { data, isLoading } = useQuery();

  if (isLoading) {
    return <SkeletonCard />;
  }

  return <ActualContent data={data} />;
}
```

### Pattern 3: Toast on Async Action

```typescript
async function handleSave() {
  try {
    await saveNote(note);
    toast.success('Note saved');
  } catch (error) {
    toast.error('Failed to save note', undefined, () => handleSave());
  }
}
```

---

## Performance Tips

1. **Use CSS transforms** (scale, translate, rotate) instead of changing width/height
2. **Use opacity** instead of display/visibility for fade effects
3. **Add will-change: transform** to elements being animated (remove after)
4. **Debounce rapid interactions** (e.g., search input)
5. **Use React.memo** for components that animate frequently
6. **Monitor frame rate** during development (Chrome DevTools > Performance)

---

## Next Steps

After completing this quickstart:
1. Run `/speckit.tasks` to generate detailed implementation tasks
2. Implement tasks in priority order (P1 → P2 → P3)
3. Test each priority level before moving to the next
4. Run accessibility audits (Lighthouse, axe DevTools)
5. Conduct user testing for feedback on smoothness

---

**Questions?** Refer to:
- [research.md](./research.md) - Technical decisions and alternatives
- [data-model.md](./data-model.md) - State management details
- [contracts/](./contracts/) - TypeScript type definitions
