# Tasks: Enhanced Trash Functionality

**Input**: Design documents from `.specify/memory/002-enhanced-trash-functionality/`
**Prerequisites**: plan.md, spec.md

**Tests**: Not required for this feature (UI and backend behavior validation)

**Organization**: Tasks are grouped by user story to enable independent implementation and validation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare database schema and shared utilities for all trash enhancements

- [X] T001 [P] Create trash utilities module in modules/trash/utils/expirationHelpers.ts
- [X] T002 [P] Create restore helpers in modules/trash/utils/restoreHelpers.ts
- [X] T003 [P] Create audit log types in convex/types/audit.ts

---

## Phase 2: Foundational (Database Schema Updates)

**Purpose**: Update database schema to support new trash features - BLOCKS all user stories

**⚠️ CRITICAL**: These schema changes must complete before any user story implementation

- [X] T004 Update notes schema with deletedFromFolderId and deletedFromPath fields in convex/schema.ts
- [X] T005 [P] Update folders schema with soft-delete fields (isDeleted, deletedAt, deletedFromParentId) in convex/schema.ts
- [X] T006 [P] Add database indexes for trash queries (by_deleted_date, by_deleted_folder) in convex/schema.ts
- [X] T007 [P] Create trashAuditLog table schema in convex/schema.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic 30-Day Trash Expiration (Priority: P1) 🎯 MVP

**Goal**: Automatically permanently delete notes and folders from trash after 30 days, with visible countdown

**Independent Test**:
- Delete a note → verify it shows days remaining in trash
- Manually run cleanup mutation → verify expired items are deleted
- Check audit log → verify deletions are logged

### Implementation for User Story 1

- [X] T008 [P] [US1] Create trash constants file with retention period in modules/trash/utils/constants.ts
- [X] T009 [P] [US1] Implement expiration calculation helpers in modules/trash/utils/expirationHelpers.ts
- [X] T010 [US1] Create ExpirationBadge component in modules/trash/components/expiration-badge.tsx
- [X] T011 [P] [US1] Create scheduled cleanup mutation in convex/trash.ts (cleanupExpiredTrash)
- [X] T012 [P] [US1] Create cron job configuration in convex/cron.ts
- [X] T013 [US1] Update getDeletedNotes query to include expiration metadata in convex/trash.ts
- [X] T014 [US1] Integrate ExpirationBadge into TrashNoteCard in modules/notes/components/trash-note-card.tsx
- [X] T015 [US1] Add expiration warning styling for urgent items (< 3 days) in modules/trash/components/expiration-badge.tsx
- [X] T016 [US1] Add audit logging to cleanup mutation in convex/trash.ts

**Checkpoint**: Notes auto-expire after 30 days, UI shows countdown, audit trail exists

---

## Phase 4: User Story 2 - Original Location Tracking & Smart Restore (Priority: P1) 🎯 MVP

**Goal**: Track and display original folder location, restore notes to their original folders intelligently

**Independent Test**:
- Delete a note from a folder → verify trash shows "Originally in: [Folder]"
- Restore note → verify it returns to original folder
- Delete original folder → restore note → verify fallback behavior

### Implementation for User Story 2

- [X] T017 [P] [US2] Create OriginalLocationBadge component in modules/trash/components/original-location-badge.tsx
- [X] T018 [P] [US2] Implement folder path building helper in modules/trash/utils/restoreHelpers.ts
- [X] T019 [US2] Update deleteNote mutation to capture deletedFromFolderId and path in convex/notes.ts
- [X] T020 [P] [US2] Update restoreNote mutation with smart folder restoration logic in convex/notes.ts
- [X] T021 [P] [US2] Update getDeletedItems query to include original folder metadata in convex/trash.ts
- [X] T022 [US2] Integrate OriginalLocationBadge into TrashNoteCard in modules/notes/components/trash-note-card.tsx
- [X] T023 [US2] Add fallback notification when original folder is missing in modules/notes/components/trash-note-card.tsx
- [X] T024 [US2] Update DeleteNoteDialog to show original location before deletion in modules/notes/components/delete-note-dialog.tsx

**Checkpoint**: Original locations tracked, displayed, and used for restoration

---

## Phase 5: User Story 3 - Bulk Trash Management (Priority: P2)

**Goal**: Enable multi-select and bulk operations for efficient trash management

**Independent Test**:
- Select multiple trash items → verify selection UI appears
- Bulk restore → verify all selected items are restored
- Bulk delete → verify all selected items are permanently deleted
- Empty trash → verify all trash is cleared

### Implementation for User Story 3

- [ ] T025 [P] [US3] Create useBulkSelect hook in modules/trash/hooks/useBulkSelect.ts
- [ ] T026 [P] [US3] Create BulkActionsToolbar component in modules/trash/components/bulk-actions-toolbar.tsx
- [ ] T027 [P] [US3] Create EmptyTrashDialog component in modules/trash/components/empty-trash-dialog.tsx
- [ ] T028 [P] [US3] Implement bulkRestoreNotes mutation in convex/trash.ts
- [ ] T029 [P] [US3] Implement bulkPermanentDeleteNotes mutation in convex/trash.ts
- [ ] T030 [P] [US3] Implement emptyTrash mutation in convex/trash.ts
- [ ] T031 [US3] Add checkbox selection to TrashNoteCard in modules/notes/components/trash-note-card.tsx
- [ ] T032 [US3] Add "Select All" checkbox to TrashView toolbar in modules/dashboard/views/trash-view.tsx
- [ ] T033 [US3] Integrate BulkActionsToolbar into TrashView in modules/dashboard/views/trash-view.tsx
- [ ] T034 [US3] Add "Empty Trash" button with confirmation dialog in modules/dashboard/views/trash-view.tsx
- [ ] T035 [US3] Add progress indicators for bulk operations in modules/trash/components/bulk-actions-toolbar.tsx
- [ ] T036 [US3] Add error handling for partial bulk operation failures in modules/trash/components/bulk-actions-toolbar.tsx

**Checkpoint**: Users can select multiple items and perform bulk restore, delete, and empty trash operations

---

## Phase 6: User Story 4 - Enhanced Trash Filters & Search (Priority: P3)

**Goal**: Enable searching and filtering trash by folder, date range, and expiration urgency

**Independent Test**:
- Search for note by title → verify results filter correctly
- Filter by original folder → verify only notes from that folder show
- Filter by "expiring soon" → verify only urgent items show
- Combine filters → verify AND logic works

### Implementation for User Story 4

- [ ] T037 [P] [US4] Create useTrashFilters hook in modules/trash/hooks/useTrashFilters.ts
- [ ] T038 [P] [US4] Create useTrashSearch hook in modules/trash/hooks/useTrashSearch.ts
- [ ] T039 [P] [US4] Create TrashSearch component in modules/trash/components/trash-search.tsx
- [ ] T040 [P] [US4] Create TrashFilters component in modules/trash/components/trash-filters.tsx
- [ ] T041 [US4] Update getDeletedItems query to support folder and search filtering in convex/trash.ts
- [ ] T042 [US4] Integrate TrashSearch into TrashView toolbar in modules/dashboard/views/trash-view.tsx
- [ ] T043 [US4] Integrate TrashFilters into TrashView toolbar in modules/dashboard/views/trash-view.tsx
- [ ] T044 [US4] Add filter pills showing active filters in modules/trash/components/trash-filters.tsx
- [ ] T045 [US4] Add "Clear Filters" button in modules/trash/components/trash-filters.tsx
- [ ] T046 [US4] Add sort controls (by date, title, expiration) in modules/trash/components/trash-filters.tsx
- [ ] T047 [US4] Add result count display in modules/dashboard/views/trash-view.tsx

**Checkpoint**: Search and filtering works, users can find specific trash items quickly

---

## Phase 7: User Story 5 - Undo Delete with Toast (Priority: P3)

**Goal**: Provide immediate undo option via toast notification after deleting a note

**Independent Test**:
- Delete a note → verify toast appears with undo button
- Click undo within 10 seconds → verify note is restored
- Wait 11 seconds → verify toast dismisses and undo is unavailable
- Delete multiple notes → verify multiple undo toasts appear

### Implementation for User Story 5

- [ ] T048 [P] [US5] Create UndoToast component in modules/shared/components/undo-toast.tsx
- [ ] T049 [P] [US5] Create showUndoToast helper function in modules/shared/utils/toastHelpers.ts
- [ ] T050 [US5] Update deleteNote mutation to return note data for undo in convex/notes.ts
- [ ] T051 [US5] Integrate undo toast into NotesListToolbar delete action in modules/dashboard/components/notes-list/NotesListToolbar.tsx
- [ ] T052 [US5] Integrate undo toast into NoteEditor delete action in modules/notes/components/note-editor/note-editor.tsx
- [ ] T053 [US5] Add toast queue management for multiple deletes in modules/shared/components/undo-toast.tsx
- [ ] T054 [US5] Add 10-second countdown timer to toast (optional visual) in modules/shared/components/undo-toast.tsx
- [ ] T055 [US5] Update DeleteNoteDialog to show undo availability message in modules/notes/components/delete-note-dialog.tsx

**Checkpoint**: Immediate undo available after delete, auto-dismisses after 10 seconds

---

## Phase 8: User Story 6 - Folder Soft Delete Support (Priority: P3)

**Goal**: Enable soft-delete for folders so they can be restored from trash with their child notes

**Independent Test**:
- Delete a folder with notes → verify folder and notes appear in trash
- Restore folder → verify folder and all notes are restored with hierarchy
- Let folder expire → verify folder and notes are permanently deleted together

### Implementation for User Story 6

- [ ] T056 [P] [US6] Create FolderTrashCard component in modules/folders/components/folder-trash-card.tsx
- [ ] T057 [US6] Update deleteFolder mutation to support soft-delete in convex/folders.ts
- [ ] T058 [P] [US6] Create restoreFolder mutation in convex/folders.ts
- [ ] T059 [P] [US6] Update getDeletedItems query to include deleted folders in convex/trash.ts
- [ ] T060 [US6] Update cleanupExpiredTrash to handle folder expiration in convex/trash.ts
- [ ] T061 [US6] Create DeleteFolderDialog with soft-delete option in modules/folders/components/delete-folder-dialog.tsx
- [ ] T062 [US6] Update TrashView to display folders separately from notes in modules/dashboard/views/trash-view.tsx
- [ ] T063 [US6] Add folder hierarchy preview in FolderTrashCard in modules/folders/components/folder-trash-card.tsx
- [ ] T064 [US6] Update FolderSidebar to filter out soft-deleted folders in modules/dashboard/components/folder-sidebar/FolderSidebar.tsx
- [ ] T065 [US6] Add cascade warning for folders with many notes in modules/folders/components/delete-folder-dialog.tsx

**Checkpoint**: Folders can be soft-deleted, restored, and expire along with their notes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and optimizations that affect multiple user stories

- [ ] T066 [P] Add loading skeletons for trash view in modules/dashboard/views/trash-view.tsx
- [ ] T067 [P] Implement virtual scrolling for large trash lists in modules/dashboard/views/trash-view.tsx
- [ ] T068 [P] Add error boundaries for trash components in modules/trash/components/trash-error-boundary.tsx
- [ ] T069 [P] Optimize trash queries with pagination in convex/trash.ts
- [ ] T070 [P] Add keyboard navigation for trash item selection in modules/dashboard/views/trash-view.tsx
- [ ] T071 [P] Add ARIA labels and accessibility improvements in modules/trash/components/
- [ ] T072 [P] Add mobile-responsive trash layout in modules/dashboard/views/trash-view.tsx
- [ ] T073 Add comprehensive error handling for network failures in modules/trash/
- [ ] T074 Add rate limiting for bulk operations in convex/trash.ts
- [ ] T075 Performance audit of scheduled cleanup job in convex/cron.ts
- [ ] T076 Add monitoring/logging for trash operations in convex/trash.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (different files)
  - Or sequentially in priority order (P1 → P1 → P2 → P3 → P3 → P3)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent from US1, but works best with US1 for complete UX
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent, but builds on US1/US2 UI
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent from all others
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent from all others
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 patterns but independent

### Within Each User Story

- All tasks marked [P] can run in parallel (different files)
- Tasks without [P] may have minor dependencies within the story
- Backend mutations generally come before UI integration
- Components before integration into views

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks marked [P] (T005-T007) can run in parallel after T004
- Once Foundational completes, ALL user story tasks can run in parallel:
  - US1: T008-T010, T011-T012 can be done simultaneously (backend + frontend)
  - US2: T017-T018, T019-T021 can be done simultaneously (components + backend)
  - US3: T025-T030 can all be done simultaneously (6 parallel tasks)
  - US4: T037-T040 can all be done simultaneously (4 parallel tasks)
  - US5: T048-T050 can be done simultaneously (3 parallel tasks)
  - US6: T056-T059 can be done simultaneously (4 parallel tasks)
- All Polish tasks marked [P] (T066-T072, T074-T076) can run in parallel after T073

---

## Parallel Example: User Story 1 (Auto-Expiration)

```bash
# After Foundational phase completes, launch all US1 tasks together:
Task: "Create trash constants file with retention period"
Task: "Implement expiration calculation helpers"
Task: "Create ExpirationBadge component"
Task: "Create scheduled cleanup mutation"
Task: "Create cron job configuration"

# These 5 tasks work on different files and can be completed in parallel
# Then integrate together in remaining tasks (T013-T016)
```

---

## Parallel Example: User Story 3 (Bulk Operations)

```bash
# After Foundational phase completes, launch all US3 setup tasks:
Task: "Create useBulkSelect hook"
Task: "Create BulkActionsToolbar component"
Task: "Create EmptyTrashDialog component"
Task: "Implement bulkRestoreNotes mutation"
Task: "Implement bulkPermanentDeleteNotes mutation"
Task: "Implement emptyTrash mutation"

# These 6 tasks work on different files and can be completed in parallel
# Then integrate into TrashView and TrashNoteCard (T031-T036)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 - Auto-Expiration (T008-T016)
4. Complete Phase 4: User Story 2 - Original Location (T017-T024)
5. **STOP and VALIDATE**: Test auto-expiration and smart restore independently
6. Demo the enhanced trash before proceeding to P2/P3 features

### Incremental Delivery

1. Setup + Foundational → Foundation ready ✅
2. Add User Story 1 (Auto-Expiration) → Test → Demo (MVP with auto-cleanup!)
3. Add User Story 2 (Original Location) → Test → Demo (Smart restore!)
4. Add User Story 3 (Bulk Operations) → Test → Demo (Efficient management!)
5. Add User Story 4 (Filters/Search) → Test → Demo (Easy navigation!)
6. Add User Story 5 (Undo Toast) → Test → Demo (Mistake prevention!)
7. Add User Story 6 (Folder Soft-Delete) → Test → Demo (Complete trash system!)
8. Polish phase → Final refinements

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Auto-Expiration) - 9 tasks
   - Developer B: User Story 2 (Original Location) - 8 tasks
   - Developer C: User Story 3 (Bulk Operations) - 12 tasks
   - Developer D: User Story 4 (Filters/Search) - 11 tasks
   - Developer E: User Story 5 (Undo Toast) - 8 tasks
   - Developer F: User Story 6 (Folder Soft-Delete) - 10 tasks
3. All stories integrate independently without conflicts

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- Each user story should be independently completable and validatable
- Backend mutations typically come before UI integration
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **No tests required**: Functional validation is sufficient for trash enhancements
- **Schema changes are critical**: Must deploy T004-T007 before any user story work
- **Scheduled jobs**: Test cleanup job in development before production
- **Audit logging**: Optional but recommended for production monitoring

---

## Success Metrics

After implementing all user stories:

- ✅ Trash auto-cleans after 30 days (zero manual intervention)
- ✅ Notes restore to original folders (95%+ success rate)
- ✅ Bulk operations work smoothly with 100+ items
- ✅ Search/filter makes large trash navigable (< 1 second response)
- ✅ Undo prevents 90%+ accidental permanent deletes
- ✅ Folders and notes have consistent soft-delete behavior
- ✅ Performance remains excellent with 1000+ trash items
- ✅ Scheduled job runs reliably (99.9% success rate)
- ✅ Zero orphaned data (tags/relationships cleaned properly)
- ✅ Mobile-responsive trash management

---

## File Structure Summary

```
convex/
├── schema.ts                    # T004-T007 (Foundational)
├── notes.ts                     # T019-T020 (US2), T050 (US5)
├── folders.ts                   # T057-T058 (US6)
├── trash.ts                     # T011, T013, T028-T030, T041, T059-T060, T069, T074, T076 (NEW FILE)
└── cron.ts                      # T012 (US1) (NEW FILE)

modules/
├── trash/                       # NEW MODULE
│   ├── components/
│   │   ├── expiration-badge.tsx           # T010, T015 (US1)
│   │   ├── original-location-badge.tsx     # T017 (US2)
│   │   ├── bulk-actions-toolbar.tsx        # T026, T035-T036 (US3)
│   │   ├── empty-trash-dialog.tsx          # T027 (US3)
│   │   ├── trash-search.tsx                # T039 (US4)
│   │   ├── trash-filters.tsx               # T040, T044-T046 (US4)
│   │   └── trash-error-boundary.tsx        # T068 (Polish)
│   ├── hooks/
│   │   ├── useBulkSelect.ts                # T025 (US3)
│   │   ├── useTrashFilters.ts              # T037 (US4)
│   │   └── useTrashSearch.ts               # T038 (US4)
│   └── utils/
│       ├── constants.ts                     # T008 (US1)
│       ├── expirationHelpers.ts            # T001, T009 (Setup + US1)
│       └── restoreHelpers.ts               # T002, T018 (Setup + US2)
│
├── notes/
│   └── components/
│       ├── trash-note-card.tsx             # T014, T022-T023, T031 (US1, US2, US3)
│       └── delete-note-dialog.tsx          # T024, T055 (US2, US5)
│
├── folders/
│   └── components/
│       ├── folder-trash-card.tsx           # T056, T063 (US6)
│       └── delete-folder-dialog.tsx        # T061, T065 (US6)
│
├── dashboard/
│   ├── views/
│   │   └── trash-view.tsx                  # T032-T034, T042-T043, T047, T062, T066-T067, T072 (US3, US4, US6, Polish)
│   └── components/
│       ├── notes-list/
│       │   └── NotesListToolbar.tsx        # T051 (US5)
│       └── folder-sidebar/
│           └── FolderSidebar.tsx           # T064 (US6)
│
└── shared/
    ├── components/
    │   └── undo-toast.tsx                  # T048, T053-T054 (US5)
    └── utils/
        └── toastHelpers.ts                 # T049 (US5)
```

---

## Migration & Deployment Notes

### Schema Migration (Foundational Phase)

- New fields are optional, so no data migration needed
- Existing trash notes will work without `deletedFromFolderId` (restore to root)
- Deploy schema changes first, then application code

### Scheduled Job Deployment

- Test cleanup job thoroughly in development
- Start with dry-run mode (logging only) in production
- Monitor first week, then enable actual deletion
- Set up alerts for job failures

### Feature Flags (Optional)

Consider feature flags for:
- Scheduled cleanup (enable after monitoring)
- Folder soft-delete (opt-in initially)
- Bulk operations (limit to admins first)

### Rollback Plan

- Schema changes are additive (safe to rollback code)
- Disable scheduled job if issues detected
- Monitor audit logs for unexpected deletions
