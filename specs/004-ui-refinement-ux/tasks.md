# Tasks: UI/UX Refinement & Polish

**Input**: Design documents from `/specs/004-ui-refinement-ux/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Not requested in specification - tests are optional and excluded from this task list

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Web application using Next.js App Router:
- **App Routes**: `app/`
- **Feature Modules**: `modules/`
- **Shared Components**: `components/ui/`
- **Shared Utilities**: `modules/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational animation and UX utilities that all user stories depend on

- [ ] T001 Create animation utilities directory at modules/shared/hooks/
- [ ] T002 Create animation library directory at modules/shared/lib/
- [ ] T003 Create animation store directory at modules/shared/stores/
- [ ] T004 [P] Copy type definitions from contracts/ to project (animation-types.ts, loading-types.ts, toast-types.ts)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core animation infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 [P] Implement use-prefers-reduced-motion hook in modules/shared/hooks/use-prefers-reduced-motion.ts
- [ ] T006 [P] Create animation preferences Zustand store in modules/shared/stores/animation-store.ts with localStorage persistence
- [ ] T007 [P] Implement animation configuration constants in modules/shared/lib/animation-config.ts (durations, easing functions, presets)
- [ ] T008 Initialize animation preference provider in app/layout.tsx to detect prefers-reduced-motion and sync with store
- [ ] T009 [P] Create toast notification helper wrapper in modules/shared/lib/toast.ts with contextual auto-dismiss behavior
- [ ] T010 Configure Sonner toaster in app/layout.tsx with position bottom-right, richColors, and closeButton

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Smooth Visual Feedback for All Interactions (Priority: P1) 🎯 MVP

**Goal**: Implement immediate, clear visual feedback for all interactive elements within 100ms, including hover states, loading states, drag feedback, and toast notifications

**Independent Test**: Interact with any clickable element, hover over interactive components, and trigger state changes. Success means every interaction has visible feedback within 100ms.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Enhance global CSS focus-visible states in app/globals.css for all interactive elements (buttons, links, inputs)
- [ ] T012 [P] [US1] Add high-contrast focus ring utilities to app/globals.css using ring-2 ring-primary ring-offset-2
- [ ] T013 [P] [US1] Enhance button component in components/ui/button.tsx with hover scale-105 and active scale-97 transitions
- [ ] T014 [P] [US1] Update all Radix UI components (dialog, dropdown-menu, context-menu) in components/ui/ to include transition-all duration-150 classes
- [ ] T015 [US1] Create use-animation-state hook in modules/shared/hooks/use-animation-state.ts to conditionally apply animation classes based on store
- [ ] T016 [US1] Apply conditional animation classes to Button component using use-animation-state hook
- [ ] T017 [P] [US1] Enhance drag-and-drop visual feedback in app/globals.css with drag-over class (bg-primary/10 border-primary/30)
- [ ] T018 [P] [US1] Add draggable cursor states in app/globals.css (cursor-grab default, cursor-grabbing active)
- [ ] T019 [US1] Update FolderTreeItem component in modules/dashboard/components/folder-tree/FolderTreeItem.tsx with enhanced drag feedback
- [ ] T020 [US1] Test toast notifications: success messages auto-dismiss after 3s, error messages persist until manually dismissed
- [ ] T021 [US1] Add toast.success calls to all successful operations (save note, create folder, delete item)
- [ ] T022 [US1] Add toast.error calls to all failed operations with retry actions where applicable

**Checkpoint**: At this point, all interactive elements should have immediate visual feedback, hover states work smoothly, and toast notifications behave contextually

---

## Phase 4: User Story 2 - Polished Transitions and Animations (Priority: P1)

**Goal**: Implement smooth, purposeful animations for modals, route changes, expandable sections, and list updates with 200-300ms duration and proper easing

**Independent Test**: Navigate between views, open/close modals, expand/collapse sections, and trigger UI state changes. Success means all transitions are smooth with appropriate timing.

### Implementation for User Story 2

- [ ] T023 [P] [US2] Add modal animation keyframes to app/globals.css (scaleIn, scaleOut with fade)
- [ ] T024 [P] [US2] Add slide animation keyframes to app/globals.css (slideUp, slideDown with fade)
- [ ] T025 [P] [US2] Update Dialog component in components/ui/dialog.tsx with animate-scale-in and animate-scale-out classes
- [ ] T026 [P] [US2] Update DropdownMenu component in components/ui/dropdown-menu.tsx with animate-slide-down on open
- [ ] T027 [P] [US2] Update ContextMenu component in components/ui/context-menu.tsx with animate-scale-in on open
- [ ] T028 [US2] Implement smooth height transitions for collapsible sections using transition-height duration-300 ease-in-out
- [ ] T029 [US2] Update FolderTree component in modules/dashboard/components/folder-tree/FolderTree.tsx with smooth expand/collapse animations
- [ ] T030 [P] [US2] Add list item animation utilities to app/globals.css (animate-fade-in for entering, animate-fade-out for leaving)
- [ ] T031 [US2] Apply list animations to NotesList component in modules/dashboard/components/notes-list/NotesList.tsx
- [ ] T032 [US2] Ensure all route transitions in app/ preserve scroll position and animate content changes smoothly
- [ ] T033 [US2] Add page transition effects to app/layout.tsx using Tailwind transition utilities
- [ ] T034 [US2] Test that prefers-reduced-motion disables all animations and transitions fall back to instant state changes

**Checkpoint**: All modals, dropdowns, expandable sections, and list updates should animate smoothly with consistent timing and easing

---

## Phase 5: User Story 3 - Optimized Loading States and Content Placeholders (Priority: P2)

**Goal**: Implement skeleton loaders and meaningful loading states to prevent blank screens and layout shifts during data fetching

**Independent Test**: Simulate slow network conditions and observe loading behavior. Success means users never see blank screens or content jumping around as data loads.

### Implementation for User Story 3

- [ ] T035 [P] [US3] Enhance Skeleton component in components/ui/skeleton.tsx with shimmer animation and predefined patterns
- [ ] T036 [P] [US3] Create SkeletonText component (multiple lines) in components/ui/skeleton.tsx
- [ ] T037 [P] [US3] Create SkeletonCard component (card layout) in components/ui/skeleton.tsx
- [ ] T038 [P] [US3] Create SkeletonAvatar component (circular, sizes sm/md/lg) in components/ui/skeleton.tsx
- [ ] T039 [US3] Create use-loading-state hook in modules/shared/hooks/use-loading-state.ts with 200ms skeleton threshold
- [ ] T040 [US3] Add skeleton loaders to NotesList component in modules/dashboard/components/notes-list/NotesList.tsx
- [ ] T041 [US3] Add skeleton loaders to FolderTree component in modules/dashboard/components/folder-tree/FolderTree.tsx
- [ ] T042 [US3] Add skeleton loaders to NoteEditor component in modules/notes/components/note-editor/note-editor.tsx
- [ ] T043 [P] [US3] Add image placeholder with proper aspect ratio to prevent layout shift in any image-loading components
- [ ] T044 [US3] Implement error state with retry button for failed data fetches in all list components
- [ ] T045 [US3] Test that skeleton loaders only display after 200ms delay to avoid flashing on fast loads
- [ ] T046 [US3] Verify zero layout shifts (CLS < 0.1) during loading using Chrome DevTools Performance

**Checkpoint**: All data-heavy views should show skeleton loaders during loading, and no layout shifts should occur when content loads

---

## Phase 6: User Story 4 - Enhanced Keyboard Navigation and Shortcuts (Priority: P2)

**Goal**: Implement comprehensive keyboard navigation with arrow keys, Tab, Enter, and Escape, plus visible focus indicators for all interactive elements

**Independent Test**: Navigate the entire application using only keyboard (Tab, Enter, arrow keys, shortcuts). Success means all interactive elements are reachable and actionable via keyboard.

### Implementation for User Story 4

- [ ] T047 [P] [US4] Create use-keyboard-nav hook in modules/shared/hooks/use-keyboard-nav.ts with arrow key handlers and focus management
- [ ] T048 [US4] Implement keyboard navigation in NotesList component using use-keyboard-nav hook (ArrowUp, ArrowDown, Enter to select)
- [ ] T049 [US4] Implement keyboard navigation in FolderTree component using use-keyboard-nav hook with expand/collapse support
- [ ] T050 [P] [US4] Add scroll-into-view behavior in use-keyboard-nav hook for focused items
- [ ] T051 [US4] Apply keyboard navigation to SearchBar component in modules/search/components/search-bar/search-bar.tsx
- [ ] T052 [P] [US4] Enhance CommandPalette component in modules/search/components/command-palette/command-palette.tsx with improved focus indicators
- [ ] T053 [US4] Add Escape key handler to all modal components (Dialog, DropdownMenu, ContextMenu) for smooth close transitions
- [ ] T054 [US4] Implement focus return to trigger element after modal close in all Dialog usages
- [ ] T055 [P] [US4] Test Tab navigation reaches all interactive elements in correct order
- [ ] T056 [P] [US4] Test arrow key navigation in lists and trees with smooth visual feedback
- [ ] T057 [US4] Verify focus indicators meet WCAG AA contrast ratio (3:1 minimum) on all backgrounds
- [ ] T058 [US4] Test keyboard shortcuts (Cmd/Ctrl+K for command palette) work from all views

**Checkpoint**: 100% of interactive elements should be keyboard-accessible with visible focus indicators, and navigation should feel smooth and predictable

---

## Phase 7: User Story 5 - Improved Typography and Visual Hierarchy (Priority: P2)

**Goal**: Establish consistent typography scale with clear hierarchy through font sizes, weights, spacing, and color contrast meeting WCAG AA standards

**Independent Test**: Show interface to new users and ask them to identify primary actions, headings, and content sections. Success means 90%+ can correctly identify hierarchy.

### Implementation for User Story 5

- [ ] T059 [P] [US5] Create typography utility variants in modules/shared/lib/typography.ts using class-variance-authority
- [ ] T060 [P] [US5] Define heading variants (h1-h6) with appropriate sizes, weights, and line heights
- [ ] T061 [P] [US5] Define text variants (xs, sm, base, lg) with color options (primary, secondary, muted)
- [ ] T062 [US5] Audit all headings in dashboard views and apply consistent text-2xl font-semibold for sections
- [ ] T063 [US5] Audit all body text and ensure text-base with appropriate line-height (leading-normal)
- [ ] T064 [US5] Audit all metadata text and apply text-sm text-muted-foreground consistently
- [ ] T065 [P] [US5] Review spacing in NotesList component and apply space-y-4 for section spacing, space-y-2 for content grouping
- [ ] T066 [P] [US5] Review spacing in FolderTree component and ensure adequate padding prevents visual crowding
- [ ] T067 [US5] Verify all text color contrast meets WCAG AA standards using browser accessibility tools
- [ ] T068 [US5] Ensure primary action buttons are visually more prominent than secondary buttons
- [ ] T069 [P] [US5] Test typography hierarchy with new users (90%+ should correctly identify sections)

**Checkpoint**: All text should have clear hierarchy, appropriate spacing, and meet accessibility color contrast standards

---

## Phase 8: User Story 6 - Responsive Interaction States (Priority: P3)

**Goal**: Ensure all interactive elements have clearly defined default, hover, focus, active, and disabled states with immediate, obvious visual changes

**Independent Test**: Systematically check each component type in all possible states. Success means every interactive element has distinct, consistent states.

### Implementation for User Story 6

- [ ] T070 [P] [US6] Audit Button component states and ensure all variants (default, hover, focus, active, disabled) are distinct
- [ ] T071 [P] [US6] Audit Input component states and ensure focus ring, validation feedback, and disabled states are clear
- [ ] T072 [P] [US6] Audit all Radix UI components for consistent state styling across the application
- [ ] T073 [US6] Update list items in NotesList with clear selected state (background color or border)
- [ ] T074 [US6] Update folder items in FolderTree with clear hover and selected states
- [ ] T075 [P] [US6] Ensure disabled state uses opacity-50 and cursor-not-allowed consistently across all components
- [ ] T076 [US6] Add active state press feedback (scale-97) to all clickable cards and list items
- [ ] T077 [P] [US6] Test form inputs show clear validation states (error border-destructive, success border-primary)
- [ ] T078 [US6] Verify interaction states work correctly on touch devices (mobile/tablet)

**Checkpoint**: All interactive elements should have five distinct states (default, hover, focus, active, disabled) that are immediately recognizable

---

## Phase 9: User Story 7 - Micro-interactions for Delight (Priority: P3)

**Goal**: Add subtle, delightful animations to common actions (success feedback, icon hover, drag-drop complete, toggle animations) without being distracting

**Independent Test**: Perform common actions and note if they feel more satisfying than basic implementation. Success is qualitative - actions should feel "nice" without being slow.

### Implementation for User Story 7

- [ ] T079 [P] [US7] Create micro-animation utilities in modules/shared/lib/animations.ts (hover, press, pulse)
- [ ] T080 [P] [US7] Add success pulse animation (@keyframes successPulse) to app/globals.css
- [ ] T081 [P] [US7] Add elastic bounce easing for drag-drop completion in app/globals.css
- [ ] T082 [US7] Apply hover scale-110 animation to all icon buttons throughout the application
- [ ] T083 [US7] Add success pulse animation to checkmark icons when actions complete successfully
- [ ] T084 [US7] Implement elastic bounce animation for dropped items in FolderTree component
- [ ] T085 [P] [US7] Add smooth toggle animations to all checkbox and switch components
- [ ] T086 [US7] Add subtle color pulse animation to newly created notes/folders to draw attention
- [ ] T087 [P] [US7] Test that micro-interactions feel satisfying without adding noticeable delay (< 200ms)
- [ ] T088 [US7] Ensure micro-interactions respect prefers-reduced-motion setting

**Checkpoint**: Common actions should feel polished and delightful with subtle animations that enhance rather than distract from functionality

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, optimization, and validation across all user stories

- [ ] T089 [P] Run Lighthouse accessibility audit and fix any WCAG AA violations
- [ ] T090 [P] Measure animation frame rates using Chrome DevTools Performance (target 60fps, minimum 30fps)
- [ ] T091 [P] Measure CLS (Cumulative Layout Shift) and ensure score < 0.1 across all views
- [ ] T092 [P] Verify bundle size increase is < 50KB (gzipped) from animation enhancements
- [ ] T093 [P] Test all features with prefers-reduced-motion enabled - animations should be disabled/reduced
- [ ] T094 [P] Test application on mobile devices - verify 44x44px touch targets and smooth interactions
- [ ] T095 Perform cross-browser testing (Chrome, Firefox, Safari, Edge) for animation consistency
- [ ] T096 [P] Code cleanup: Remove console.logs, unused imports, and commented code
- [ ] T097 [P] Refactor any duplicated animation logic into reusable utilities
- [ ] T098 Run validation against quickstart.md implementation patterns
- [ ] T099 Document animation configuration and patterns for future development
- [ ] T100 Create demo video showcasing smooth interactions, animations, and accessibility features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P2 → P3 → P3)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independent
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses same animation utilities as US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent, uses loading utilities
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent, adds keyboard nav
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent, typography audit
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Independent, state audit
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Uses animation utilities from US1/US2

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no conflicts)
- Sequential tasks build on previous work (hooks before usage, components before integration)
- Complete entire user story before moving to next priority
- Test independently before integrating with other stories

### Parallel Opportunities

#### Phase 1 (Setup)
- T004 can run in parallel with T001-T003

#### Phase 2 (Foundational)
- T005, T006, T007, T009 can all run in parallel (different files)
- T008, T010 depend on their respective dependencies but can run in parallel with each other

#### User Story 1 (Phase 3)
- T011, T012, T013, T014, T017, T018 can all run in parallel (different files)
- T021, T022 can run in parallel after T020

#### User Story 2 (Phase 4)
- T023, T024, T025, T026, T027, T030 can all run in parallel (different files)

#### User Story 3 (Phase 5)
- T035, T036, T037, T038, T043 can all run in parallel (different files or sections)

#### User Story 4 (Phase 6)
- T047, T050, T052 can run in parallel initially
- T055, T056 can run in parallel during testing

#### User Story 5 (Phase 7)
- T059, T060, T061, T065, T066 can all run in parallel (different files/components)
- T069 can run in parallel with T068 during testing

#### User Story 6 (Phase 8)
- T070, T071, T072, T075, T077 can all run in parallel (different components)

#### User Story 7 (Phase 9)
- T079, T080, T081, T085, T087 can all run in parallel (different files)

#### Polish (Phase 10)
- T089, T090, T091, T092, T093, T094, T096, T097 can all run in parallel (independent validation tasks)

---

## Parallel Example: User Story 1

```bash
# Parallel Group 1 - CSS Enhancements (all different files or sections):
Task T011: "Enhance global CSS focus-visible states in app/globals.css"
Task T012: "Add high-contrast focus ring utilities to app/globals.css"
Task T013: "Enhance button component in components/ui/button.tsx"
Task T014: "Update Radix UI components in components/ui/"

# Sequential (depends on T015):
Task T015: "Create use-animation-state hook"
Task T016: "Apply conditional animation classes to Button"

# Parallel Group 2 - Additional Enhancements:
Task T017: "Enhance drag-and-drop visual feedback in app/globals.css"
Task T018: "Add draggable cursor states in app/globals.css"

# Sequential:
Task T019: "Update FolderTreeItem with enhanced drag feedback"
Task T020: "Test toast notifications"

# Parallel Group 3 - Toast Integration:
Task T021: "Add toast.success calls to successful operations"
Task T022: "Add toast.error calls to failed operations"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 - Both P1)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T022)
4. Complete Phase 4: User Story 2 (T023-T034)
5. **STOP and VALIDATE**: Test both P1 stories independently
6. Demo smooth interactions, animations, and feedback

At this point, you have a highly polished MVP with:
- Immediate visual feedback for all interactions
- Smooth transitions for modals, dropdowns, and state changes
- Contextual toast notifications
- GPU-accelerated animations with proper easing

### Incremental Delivery

1. Foundation (Phases 1-2) → Core animation infrastructure ready
2. Add P1 Stories (Phases 3-4) → Test independently → Deploy/Demo (MVP!)
3. Add P2 Stories (Phases 5-7) → Test independently → Deploy/Demo
4. Add P3 Stories (Phases 8-9) → Test independently → Deploy/Demo
5. Polish (Phase 10) → Final optimization and validation

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done, split work:
   - **Developer A**: User Story 1 (Visual Feedback)
   - **Developer B**: User Story 2 (Transitions)
   - **Developer C**: User Story 3 (Loading States)
   - **Developer D**: User Story 4 (Keyboard Nav)
3. After P1 stories (US1, US2) complete: Validate and deploy MVP
4. Continue with P2 and P3 stories in parallel

---

## Success Metrics (Track Throughout Implementation)

- **SC-001**: 90% of user interactions show visual feedback within 100ms
- **SC-002**: Zero layout shifts with CLS score < 0.1
- **SC-003**: All animations maintain minimum 30fps (target 60fps)
- **SC-004**: 100% of interactive elements keyboard-accessible
- **SC-005**: User satisfaction for "interface smoothness" increases 30%+
- **SC-006**: Task completion time reduces 15-20% due to clearer affordances
- **SC-007**: WCAG 2.1 AA compliance (focus states, keyboard nav)
- **SC-008**: 90%+ users can identify visual hierarchy without guidance

---

## Notes

- [P] tasks = different files/components, no dependencies, can run in parallel
- [Story] label maps task to specific user story (US1-US7) for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently before proceeding
- Prioritize P1 stories (US1, US2) for MVP - they provide maximum impact
- Test with prefers-reduced-motion throughout development
- Use Chrome DevTools Performance tab to monitor frame rates
- Validate accessibility with Lighthouse and axe DevTools

**Total Tasks**: 100 tasks across 10 phases (7 user stories + setup + foundation + polish)

**Estimated Timeline**:
- MVP (Phases 1-4): 3-5 days (P1 stories only)
- Full Feature (All Phases): 7-10 days
- With parallel team: 5-7 days total
