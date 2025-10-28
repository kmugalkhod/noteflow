# Research: UI/UX Refinement & Polish

**Date**: 2025-10-27
**Feature**: UI/UX Refinement & Polish
**Purpose**: Research best practices, patterns, and technical approaches for implementing smooth animations, loading states, keyboard navigation, and micro-interactions

## Research Areas

### 1. Animation Performance & Best Practices

#### Decision: GPU-Accelerated CSS Animations with Tailwind

**Rationale**:
- Modern browsers can offload `transform` and `opacity` animations to the GPU/compositor thread
- Avoids main thread blocking and layout recalculation (reflow/repaint)
- Tailwind CSS v4 + tw-animate-css already provide utility classes
- React 19 concurrent features work seamlessly with CSS animations

**Key Performance Principles**:
- **Stick to Compositor-Only Properties**: `transform` (translate, scale, rotate) and `opacity`
- **Avoid**: Animating `width`, `height`, `top`, `left`, `margin`, `padding` (triggers layout)
- **Use will-change sparingly**: Only for elements actively animating, remove after
- **Respect prefers-reduced-motion**: Disable/reduce animations for accessibility

**Timing Standards**:
- **Micro-interactions**: 100-200ms (button hover, focus states)
- **Small transitions**: 200-300ms (modal open/close, dropdown expand)
- **Large transitions**: 300-500ms (page transitions, large panels)
- **Loading states**: Indefinite loop with 1-2s cycle

**Easing Functions (Cubic Bezier)**:
```css
/* Tailwind built-in */
ease-in:      cubic-bezier(0.4, 0, 1, 1)     /* Slow start */
ease-out:     cubic-bezier(0, 0, 0.2, 1)     /* Slow end - best for entering */
ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)   /* Both - best for state changes */

/* Material Design recommended */
standard:     cubic-bezier(0.4, 0, 0.2, 1)   /* General purpose */
deceleration: cubic-bezier(0, 0, 0.2, 1)     /* Elements entering screen */
acceleration: cubic-bezier(0.4, 0, 1, 1)     /* Elements leaving screen */
sharp:        cubic-bezier(0.4, 0, 0.6, 1)   /* Quick, snappy interactions */
```

**Alternatives Considered**:
- **Framer Motion**: Powerful but adds ~35KB (gzipped) - exceeds budget
- **React Spring**: Physics-based, overkill for our use case
- **GSAP**: Industry standard but commercial license + bundle size
- **Native CSS + Tailwind**: ✅ Zero bundle increase, excellent performance

**Resources**:
- [Google Web Fundamentals - Animations](https://web.dev/animations/)
- [MDN - Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions)
- [Josh Comeau - Practical Guide to Animations](https://www.joshwcomeau.com/animation/css-transitions/)

---

### 2. Loading States & Skeleton Loaders

#### Decision: Progressive Loading with Content-Matched Skeletons

**Rationale**:
- Skeleton loaders maintain layout stability (prevents CLS)
- Set user expectations during data fetching
- More sophisticated than simple spinners
- Already have `skeleton.tsx` component to extend

**Implementation Pattern**:
```tsx
// Pattern 1: Conditional rendering based on loading state
{isLoading ? <Skeleton className="h-[200px] w-full" /> : <ActualContent />}

// Pattern 2: Skeleton matches final layout
<div className="space-y-4">
  {isLoading ? (
    <>
      <Skeleton className="h-12 w-full" />  {/* Header */}
      <Skeleton className="h-32 w-full" />  {/* Content */}
      <Skeleton className="h-8 w-2/3" />    {/* Footer */}
    </>
  ) : (
    <ActualContent />
  )}
</div>
```

**Skeleton Animation**:
- Use shimmer effect (pulse from left to right)
- 2s linear infinite animation
- Gradient: muted → muted-foreground → muted
- Already defined in `globals.css` as `.animate-shimmer`

**Threshold Strategy**:
- **< 200ms load time**: No skeleton (instant display)
- **200ms - 5s**: Show skeleton loader
- **> 5s**: Show skeleton + progress indicator/message

**Alternatives Considered**:
- **Spinner only**: Too generic, causes layout shifts
- **Progress bars**: Not appropriate for unknown duration
- **Blur-up images**: Good for images specifically, but we need content skeletons
- **Skeleton loaders**: ✅ Best UX for content loading

**Resources**:
- [Building Skeleton Screens with CSS](https://css-tricks.com/building-skeleton-screens-css-custom-properties/)
- [React Suspense patterns](https://react.dev/reference/react/Suspense)
- [Cumulative Layout Shift optimization](https://web.dev/cls/)

---

### 3. Keyboard Navigation & Focus Management

#### Decision: Roving TabIndex + Visible Focus Indicators

**Rationale**:
- WCAG 2.1 AA requires visible focus indicators (3:1 contrast ratio minimum)
- Arrow key navigation expected in lists/trees
- Radix UI provides built-in keyboard support, we enhance visuals
- Focus trap for modals prevents keyboard users from escaping

**Focus Management Patterns**:

**Pattern 1: List Navigation (Arrow Keys)**:
```tsx
// Example: Note list
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') focusNext();
  if (e.key === 'ArrowUp') focusPrevious();
  if (e.key === 'Enter') selectCurrent();
}
```

**Pattern 2: Focus Trap (Modals)**:
```tsx
// Trap focus within modal
// Use Radix Dialog - already handles this
// Ensure first focusable element receives focus on open
// Restore focus to trigger on close
```

**Pattern 3: Skip Links**:
```tsx
// For accessibility - jump to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

**Focus Indicator Standards**:
```css
/* High contrast outline */
focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2

/* Dark backgrounds need offset for visibility */
focus-visible:ring-offset-background

/* Never use outline: none without replacement */
```

**Keyboard Shortcuts**:
- Use `Cmd/Ctrl + K` for command palette (already exists with `cmdk`)
- `Escape` to close modals/dropdowns (Radix handles)
- `Tab` for sequential navigation
- `Arrow keys` for list/tree navigation
- Document all shortcuts in help dialog

**Alternatives Considered**:
- **Focus-within only**: Not sufficient for non-mouse users
- **Outline-based**: Works but less visually integrated
- **Ring-based (Tailwind)**: ✅ Modern, high visibility, customizable

**Resources**:
- [WCAG 2.1 Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [Inclusive Components - Menus & Menu Buttons](https://inclusive-components.design/menus-menu-buttons/)
- [Focus Management in React](https://reactjs.org/docs/accessibility.html#focus-control)

---

### 4. Toast Notifications Strategy

#### Decision: Enhance Sonner with Contextual Behavior

**Rationale**:
- Sonner already installed and provides excellent UX
- Contextual auto-dismiss balances non-intrusive vs visible
- Success/info can auto-dismiss (3s) - user doesn't need to act
- Errors/warnings persist - user must acknowledge

**Sonner Configuration**:
```tsx
import { toast } from 'sonner'

// Success (auto-dismiss 3s)
toast.success('Note saved', { duration: 3000 })

// Error (persist until dismissed)
toast.error('Failed to save note', {
  duration: Infinity,  // Manual dismissal required
  action: { label: 'Retry', onClick: () => retryAction() }
})

// Info (auto-dismiss 3s)
toast.info('Changes synced', { duration: 3000 })

// Warning (persist until dismissed)
toast.warning('You have unsaved changes', {
  duration: Infinity
})
```

**Positioning**:
- Default: Bottom-right (non-intrusive)
- Mobile: Bottom-center (full width)

**Animation**:
- Slide up from bottom with fade-in (200ms)
- Slide down with fade-out on dismiss (150ms)
- Sonner handles this natively

**Alternatives Considered**:
- **Custom toast system**: Unnecessary, Sonner is excellent
- **React-hot-toast**: Similar but Sonner has better accessibility
- **Radix Toast**: More low-level, would require more work
- **Sonner**: ✅ Already installed, great UX, accessible

**Resources**:
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Toast notification best practices](https://www.nngroup.com/articles/toast-notifications/)

---

### 5. Micro-interactions & Delightful Details

#### Decision: Subtle CSS Transitions on User Actions

**Rationale**:
- Small details create perception of quality
- Must not slow down interface (< 200ms)
- GPU-accelerated transforms perform well
- Add personality without distraction

**Micro-interaction Patterns**:

**Hover Scale (Icons, Small Buttons)**:
```tsx
className="hover:scale-110 transition-transform duration-150"
```

**Success Pulse (Action Complete)**:
```css
@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

**Button Press (Mobile Touch)**:
```tsx
className="active:scale-97 transition-transform"
```

**Elastic Drop (Drag & Drop Complete)**:
```css
cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Elastic ease-out */
```

**Checkbox/Toggle Animation**:
- Radix components already animated
- Enhance with subtle scale on check: `scale(1.1)` → `scale(1)`

**Principles**:
- **Purposeful**: Every animation should communicate meaning
- **Fast**: 100-200ms for micro-interactions
- **Subtle**: Scale factors: 1.05-1.1 max, not jarring
- **Consistent**: Same interaction = same animation everywhere

**Alternatives Considered**:
- **No micro-interactions**: Functional but lacks polish
- **Heavy animations**: Slows interface, annoying
- **Subtle CSS transitions**: ✅ Fast, performant, delightful

**Resources**:
- [Micro-interactions in UI Design](https://www.smashingmagazine.com/2016/08/experience-design-essentials-animated-microinteractions-in-mobile-apps/)
- [Designing Interface Animation](https://rosenfeldmedia.com/books/designing-interface-animation/)

---

### 6. Accessibility - Prefers-Reduced-Motion

#### Decision: Respect System Preferences, Provide Toggle

**Rationale**:
- WCAG 2.1 Level AA requires respecting motion preferences
- Some users experience vestibular disorders from motion
- Browsers expose `prefers-reduced-motion` media query
- Must disable/simplify animations when enabled

**Implementation Pattern**:
```tsx
// Custom hook
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Usage
const prefersReducedMotion = usePrefersReducedMotion();
const transitionClass = prefersReducedMotion
  ? ''
  : 'transition-all duration-200';
```

**CSS Alternative**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Simplified Animations**:
- **Full motion**: Smooth transitions, micro-interactions, entrance animations
- **Reduced motion**:
  - Instant state changes (no animation)
  - OR very short duration (50ms) for minimal transition
  - Cross-fade only (opacity), no transforms

**User Control**:
- Optionally provide in-app toggle (Settings)
- Store preference in localStorage
- Override system preference if user explicitly sets

**Alternatives Considered**:
- **Ignore preference**: Accessibility violation, poor UX
- **Global disable only**: Too restrictive, no user control
- **Respect + Toggle**: ✅ Best of both worlds

**Resources**:
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.1 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Accessible Animation](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/)

---

### 7. Typography & Visual Hierarchy

#### Decision: Leverage Tailwind Typography Scale, Enhance Contrast

**Rationale**:
- Consistent typography improves scannability
- Clear hierarchy reduces cognitive load
- Geist Sans and Geist Mono already configured (good fonts)
- Must ensure WCAG AA compliance (4.5:1 normal, 3:1 large text)

**Typography Scale** (Tailwind defaults are good):
```
text-xs:   0.75rem  (12px) - Metadata, timestamps
text-sm:   0.875rem (14px) - Secondary text, descriptions
text-base: 1rem     (16px) - Body text (default)
text-lg:   1.125rem (18px) - Emphasized body
text-xl:   1.25rem  (20px) - Subheadings
text-2xl:  1.5rem   (24px) - Section headings
text-3xl:  1.875rem (30px) - Page headings
text-4xl:  2.25rem  (36px) - Hero headings
```

**Font Weights**:
```
font-normal: 400    - Body text
font-medium: 500    - Emphasized text
font-semibold: 600  - Headings, buttons
font-bold: 700      - Strong emphasis (use sparingly)
```

**Color Contrast** (already defined in globals.css):
```css
/* Light mode */
--foreground: #000000       /* Black on #f5f5f5 background = 18.1:1 ✓ */
--muted-foreground: #6e6e73 /* Gray text = 5.2:1 ✓ */

/* Dark mode */
--foreground: #ffffff       /* White on #1e1e1e background = 17.5:1 ✓ */
--muted-foreground: #98989d /* Gray text = 4.6:1 ✓ */
```

**Spacing for Hierarchy**:
```tsx
<div className="space-y-6">      {/* Section spacing */}
  <h2 className="text-2xl font-semibold mb-4">Heading</h2>
  <div className="space-y-2">    {/* Content grouping */}
    <p className="text-base">Body text</p>
    <p className="text-sm text-muted-foreground">Secondary info</p>
  </div>
</div>
```

**Line Height**:
```
leading-tight: 1.25   - Headings
leading-normal: 1.5   - Body text (default)
leading-relaxed: 1.75 - Long-form content
```

**Alternatives Considered**:
- **Custom typography plugin**: Unnecessary, Tailwind defaults work
- **Modular scale calculator**: Overkill for this project
- **Tailwind + semantic classes**: ✅ Flexible, maintainable

**Resources**:
- [Tailwind Typography](https://tailwindcss.com/docs/font-size)
- [Type Scale](https://type-scale.com/)
- [Practical Typography](https://practicaltypography.com/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Summary of Technical Decisions

| Area | Technology/Pattern | Rationale |
|------|-------------------|-----------|
| **Animations** | Tailwind CSS + tw-animate-css | Zero bundle increase, GPU-accelerated, sufficient for needs |
| **Loading States** | Content-matched skeleton loaders | Prevents CLS, sets expectations, better than spinners |
| **Keyboard Nav** | Roving tabindex + visible focus rings | WCAG compliance, expected UX for lists/trees |
| **Notifications** | Enhanced Sonner configuration | Already installed, contextual auto-dismiss |
| **Micro-interactions** | CSS transitions (transform, opacity) | Performant, subtle, adds polish |
| **Accessibility** | prefers-reduced-motion + toggle | WCAG compliance, user control |
| **Typography** | Tailwind scale + enhanced spacing | Consistent, accessible, clear hierarchy |

## Implementation Strategy

### Phase 1: Foundation (P1 Stories)
1. Create animation utilities and hooks (`use-prefers-reduced-motion`)
2. Establish focus indicator standards across all components
3. Implement skeleton loader patterns for data-heavy views
4. Configure Sonner for contextual auto-dismiss

### Phase 2: Enhancement (P2 Stories)
5. Enhance keyboard navigation in lists/trees
6. Improve typography scale and spacing consistency
7. Add loading states to all async operations

### Phase 3: Polish (P3 Stories)
8. Add micro-interactions to buttons, icons, toggles
9. Implement success animations for completed actions
10. Fine-tune easing and timing for smoothness

---

**Research Complete**: All technical decisions documented with rationale, alternatives considered, and resources linked. Ready for Phase 1: Design & Contracts.
