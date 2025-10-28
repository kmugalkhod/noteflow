# Data Model: UI/UX Refinement & Polish

**Date**: 2025-10-27
**Feature**: UI/UX Refinement & Polish
**Purpose**: Define state management models for animation preferences, loading states, and interaction states

## Overview

This feature is primarily frontend-focused with state management requirements for:
1. **Animation preferences** (user settings + system preferences)
2. **Loading states** (per-component/view loading indicators)
3. **Interaction states** (hover, focus, active tracking)
4. **Toast notification queue** (managed by Sonner, we define types)

No database schema changes required. State management uses:
- **Zustand** for global state (animation preferences)
- **React state** for component-local state (loading, hover)
- **CSS pseudo-classes** for interaction states (preferred)
- **Sonner** for toast notification queue

---

## State Models

### 1. Animation Preferences (Global State)

**Purpose**: Track user's animation preferences and system prefers-reduced-motion setting

**Location**: `modules/shared/stores/animation-store.ts` (Zustand)

**State Shape**:
```typescript
interface AnimationPreferencesState {
  // System preference (from prefers-reduced-motion media query)
  systemPrefersReducedMotion: boolean;

  // User override (null = use system, true = force disable, false = force enable)
  userPreference: boolean | null;

  // Computed: Should animations be enabled?
  animationsEnabled: boolean;

  // Actions
  setSystemPreference: (value: boolean) => void;
  setUserPreference: (value: boolean | null) => void;
  toggleAnimations: () => void;
}
```

**Persistence**: `localStorage` key: `noteflow:animation-preference`

**Initialization**:
```typescript
const useAnimationStore = create<AnimationPreferencesState>()(
  persist(
    (set, get) => ({
      systemPrefersReducedMotion: false,
      userPreference: null,

      // Computed property
      get animationsEnabled() {
        const { systemPrefersReducedMotion, userPreference } = get();
        if (userPreference !== null) return !userPreference;
        return !systemPrefersReducedMotion;
      },

      setSystemPreference: (value) =>
        set({ systemPrefersReducedMotion: value }),

      setUserPreference: (value) =>
        set({ userPreference: value }),

      toggleAnimations: () =>
        set((state) => ({
          userPreference: !state.animationsEnabled
        }))
    }),
    { name: 'noteflow:animation-preference' }
  )
);
```

**Usage**:
```typescript
const animationsEnabled = useAnimationStore((s) => s.animationsEnabled);
const className = cn(
  animationsEnabled && 'transition-all duration-200',
  // ... other classes
);
```

---

### 2. Loading States (Component-Local)

**Purpose**: Track loading state for async operations with skeleton loaders

**Location**: Component-local React state or custom hook

**State Shape (Component)**:
```typescript
interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

// Usage in component
const [state, setState] = useState<LoadingState<Note[]>>({
  isLoading: true,
  error: null,
  data: null
});
```

**State Shape (Global - Optional)**:
```typescript
// For tracking multiple simultaneous operations
interface LoadingStateRegistry {
  [operationId: string]: {
    isLoading: boolean;
    startTime: number;
    label: string;
  };
}

interface LoadingStore {
  operations: LoadingStateRegistry;
  startLoading: (id: string, label: string) => void;
  stopLoading: (id: string) => void;
  isAnyLoading: boolean;
}
```

**Skeleton Display Logic**:
```typescript
// Only show skeleton if loading > 200ms
const showSkeleton = isLoading && (Date.now() - loadStartTime) > 200;

return showSkeleton ? <Skeleton /> : <ActualContent />;
```

---

### 3. Interaction States (CSS-Managed)

**Purpose**: Visual states for interactive elements (hover, focus, active, disabled)

**Location**: CSS pseudo-classes (preferred), React state (when necessary)

**CSS-Based (Preferred)**:
```typescript
// Tailwind classes handle all states
className="
  hover:bg-accent hover:text-accent-foreground
  focus-visible:ring-2 focus-visible:ring-primary
  active:scale-98
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-150
"
```

**State-Based (When Necessary)**:
```typescript
// For complex interactions requiring state
interface InteractionState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isDragging: boolean;
}

const [interaction, setInteraction] = useState<InteractionState>({
  isHovered: false,
  isFocused: false,
  isPressed: false,
  isDragging: false
});

// Example: Drag and drop
<div
  onMouseEnter={() => setInteraction(s => ({ ...s, isHovered: true }))}
  onMouseLeave={() => setInteraction(s => ({ ...s, isHovered: false }))}
  onDragStart={() => setInteraction(s => ({ ...s, isDragging: true }))}
  onDragEnd={() => setInteraction(s => ({ ...s, isDragging: false }))}
  className={cn(
    'transition-all duration-150',
    interaction.isHovered && 'bg-accent',
    interaction.isDragging && 'opacity-50 cursor-grabbing'
  )}
/>
```

---

### 4. Toast Notification State (Sonner-Managed)

**Purpose**: Queue and display toast notifications with contextual behavior

**Location**: Managed by Sonner library, we define types only

**Toast Configuration Types**:
```typescript
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastConfig {
  type: ToastType;
  message: string;
  description?: string;
  duration?: number; // undefined = auto-dismiss based on type
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastBehavior {
  success: { duration: 3000, dismissible: true };
  info: { duration: 3000, dismissible: true };
  error: { duration: Infinity, dismissible: true };
  warning: { duration: Infinity, dismissible: true };
}
```

**Helper Function**:
```typescript
// Wrapper around Sonner with consistent behavior
export const showToast = ({ type, message, description, action }: ToastConfig) => {
  const config = {
    description,
    duration: type === 'success' || type === 'info' ? 3000 : Infinity,
    action,
  };

  switch (type) {
    case 'success':
      return toast.success(message, config);
    case 'error':
      return toast.error(message, config);
    case 'info':
      return toast.info(message, config);
    case 'warning':
      return toast.warning(message, config);
  }
};

// Usage
showToast({
  type: 'success',
  message: 'Note saved successfully'
});

showToast({
  type: 'error',
  message: 'Failed to save note',
  action: {
    label: 'Retry',
    onClick: () => retryAction()
  }
});
```

---

### 5. Keyboard Navigation State (Component-Local)

**Purpose**: Track focus and selection for keyboard navigation in lists/trees

**Location**: Component-local React state

**State Shape**:
```typescript
interface KeyboardNavState {
  // Currently focused item index
  focusedIndex: number;

  // Selected items (for multi-select)
  selectedIds: Set<string>;

  // Navigation handlers
  focusNext: () => void;
  focusPrevious: () => void;
  selectCurrent: () => void;
  clearSelection: () => void;
}

// Example implementation
const useKeyboardNav = (items: Item[], onSelect: (item: Item) => void) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set<string>());

  const focusNext = useCallback(() => {
    setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
  }, [items.length]);

  const focusPrevious = useCallback(() => {
    setFocusedIndex((i) => Math.max(i - 1, 0));
  }, []);

  const selectCurrent = useCallback(() => {
    const item = items[focusedIndex];
    if (item) onSelect(item);
  }, [focusedIndex, items, onSelect]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    focusedIndex,
    selectedIds,
    focusNext,
    focusPrevious,
    selectCurrent,
    clearSelection
  };
};
```

**Event Handler Integration**:
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
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
    case 'Escape':
      clearSelection();
      break;
  }
};

<div onKeyDown={handleKeyDown} role="listbox" tabIndex={0}>
  {items.map((item, index) => (
    <div
      key={item.id}
      role="option"
      aria-selected={index === focusedIndex}
      className={cn(index === focusedIndex && 'ring-2 ring-primary')}
    >
      {item.name}
    </div>
  ))}
</div>
```

---

### 6. Focus Trap State (Modal/Dialog)

**Purpose**: Prevent focus from leaving modal while open

**Location**: Component-local, Radix Dialog handles this automatically

**State Shape**:
```typescript
interface FocusTrapState {
  isTrapped: boolean;
  initialFocusRef: RefObject<HTMLElement>;
  returnFocusRef: RefObject<HTMLElement>;
}

// Radix Dialog already implements this
// We just ensure proper refs are provided
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button ref={triggerRef}>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* First focusable element receives focus automatically */}
    <DialogTitle>Modal Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
    {/* Focus returns to trigger on close */}
  </DialogContent>
</Dialog>
```

---

## State Management Summary

| State Type | Storage | Scope | Persistence |
|------------|---------|-------|-------------|
| **Animation Preferences** | Zustand | Global | localStorage |
| **Loading States** | React State | Component/Hook | Ephemeral |
| **Interaction States** | CSS/React State | Component | Ephemeral |
| **Toast Queue** | Sonner | Global | Ephemeral |
| **Keyboard Navigation** | React State | Component | Ephemeral |
| **Focus Trap** | Radix Dialog | Component | Ephemeral |

---

## Validation Rules

### Animation Preferences
- `userPreference` must be `null`, `true`, or `false`
- If `null`, defer to `systemPrefersReducedMotion`
- localStorage value must be valid JSON

### Loading States
- `isLoading` and `error` cannot both be true
- `data` should be null while `isLoading` is true
- Skeleton display delayed by 200ms threshold

### Toast Notifications
- `message` is required (non-empty string)
- `duration` must be positive number or Infinity
- Error/warning toasts must allow manual dismissal

### Keyboard Navigation
- `focusedIndex` must be within `0` to `items.length - 1`
- Focus must be visible (element scrolled into view)
- Selection must be cleared when items change

---

## State Transitions

### Animation Preferences Flow
```
Initial Load
  → Detect system prefers-reduced-motion
  → Load user preference from localStorage
  → Compute animationsEnabled
  → Subscribe to media query changes
  → Update on user toggle

System preference changes
  → Update systemPrefersReducedMotion
  → Recompute animationsEnabled (if userPreference is null)

User toggles setting
  → Set userPreference (overrides system)
  → Store in localStorage
  → Recompute animationsEnabled
```

### Loading State Flow
```
Component Mount (data needed)
  → Set isLoading = true, record startTime
  → Fetch data
  → If delay > 200ms: Show skeleton
  → On success: Set data, isLoading = false
  → On error: Set error, isLoading = false
```

### Keyboard Navigation Flow
```
List mounted
  → focusedIndex = 0
  → Listen for arrow keys

ArrowDown pressed
  → focusedIndex = min(focusedIndex + 1, length - 1)
  → Scroll focused item into view
  → Apply visual focus indicator

Enter pressed
  → Get item at focusedIndex
  → Call onSelect(item)
  → Optionally update selectedIds set
```

---

## Implementation Notes

1. **Animation Store**: Initialize on app mount with media query listener
2. **Loading States**: Use custom `useAsyncData` hook to standardize pattern
3. **Interaction States**: Prefer CSS pseudo-classes, use React state only when necessary
4. **Toast Wrapper**: Create `showToast` helper to enforce consistent behavior
5. **Keyboard Nav**: Create `useKeyboardNav` hook for reusable list navigation logic
6. **Focus Management**: Trust Radix UI components for modal focus trapping

---

**Data Model Complete**: All state management requirements documented. Ready for contracts generation.
