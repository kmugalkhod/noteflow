# Feature Specification: Enhanced Trash Functionality

## Overview

Enhance NoteFlow's existing trash system to provide a complete, production-ready soft-delete solution with automatic expiration, bulk operations, and improved user experience. The current implementation has solid foundations but lacks critical enterprise features like auto-purge, original location tracking, and bulk management.

---

## User Stories

### User Story 1: Automatic 30-Day Trash Expiration (Priority: P1) 🎯 MVP

**As a** NoteFlow user
**I want** notes in trash to be automatically permanently deleted after 30 days
**So that** I don't have to manually clean up old trash and storage is managed automatically

**Context:**
- Currently, trash shows "30 days" message but doesn't enforce it
- No scheduled cleanup mechanism exists
- Users expect Notion-like behavior where trash auto-cleans

**Acceptance Criteria:**

1. **30-Day Retention Policy**
   - Notes deleted more than 30 days ago are automatically permanently deleted
   - Scheduled job runs daily to check and cleanup expired trash
   - Database query efficiently identifies expired notes

2. **Time-to-Expiration Display**
   - Each trash card shows "X days remaining" countdown
   - Visual indication when expiration is imminent (< 3 days)
   - Shows exact expiration date on hover

3. **Background Cleanup Job**
   - Convex scheduled function runs daily at midnight UTC
   - Permanently deletes notes where `deletedAt < (now - 30 days)`
   - Logs cleanup actions for audit trail
   - Handles tag cleanup and orphaned relationships

4. **User Notifications**
   - Toast notification when note is auto-deleted (if user is active)
   - Optional: Email digest of auto-deleted notes before expiration

**Test Scenarios:**

```gherkin
Scenario: Note auto-expires after 30 days
  Given I deleted a note 31 days ago
  When the daily cleanup job runs
  Then the note is permanently deleted from database
  And the trash count updates
  And tags are cleaned up

Scenario: Trash card shows days remaining
  Given I have a note deleted 25 days ago
  When I view trash
  Then I see "5 days remaining" on the card
  And it shows warning color (< 7 days)

Scenario: Can restore before expiration
  Given I have a note deleted 29 days ago
  When I restore it
  Then it returns to my notes list
  And expiration is cancelled
```

**Out of Scope:**
- User-configurable retention periods (fixed at 30 days)
- Trash size quotas
- Pausing auto-deletion

---

### User Story 2: Original Location Tracking & Smart Restore (Priority: P1) 🎯 MVP

**As a** NoteFlow user
**I want** deleted notes to remember their original folder location
**So that** when I restore them, they return to where they belonged

**Context:**
- Currently, notes restore to "root" (no folder)
- Users lose organizational context
- Need to manually re-organize restored notes

**Acceptance Criteria:**

1. **Track Original Location**
   - Add `deletedFromFolderId` field to notes schema
   - Capture original folder when note is soft-deleted
   - Store original parent path for nested folders

2. **Display Original Location**
   - Trash cards show "Originally in: [Folder Name]"
   - Show full path for nested folders (e.g., "Work > Projects > Q1")
   - Handle case where original folder was also deleted

3. **Smart Restore Logic**
   - Restore to original folder if it still exists
   - If original folder was deleted:
     - Option 1: Restore folder hierarchy first (recommended)
     - Option 2: Restore to root with notification
   - User can choose different destination before restore (optional)

4. **Folder Hierarchy Restoration**
   - When restoring note from deleted folder:
     - Restore parent folder first (if also in trash)
     - Restore note to original location
     - Handle multi-level nesting

**Test Scenarios:**

```gherkin
Scenario: Restore to existing original folder
  Given I deleted a note from "Work Projects" folder
  When I restore it
  Then it returns to "Work Projects"
  And folder is selected automatically

Scenario: Original folder was also deleted
  Given I deleted "Personal" folder (with notes)
  And "Personal" is in trash
  When I restore a note from "Personal"
  Then I see option to restore "Personal" first
  And note returns to "Personal" after folder restore

Scenario: View original location in trash
  Given I have deleted notes from different folders
  When I view trash
  Then each card shows "Originally in: [Folder]"
  And I can filter by original folder
```

**Out of Scope:**
- Restoring to different folder (v2 feature)
- Batch restore with location preservation
- Undo folder structure changes

---

### User Story 3: Bulk Trash Management (Priority: P2)

**As a** NoteFlow user
**I want** to select multiple items in trash and perform bulk actions
**So that** I can efficiently manage large amounts of deleted content

**Context:**
- Currently must restore/delete one note at a time
- Tedious when cleaning up or restoring multiple notes
- Users expect modern multi-select UX

**Acceptance Criteria:**

1. **Multi-Select UI**
   - Checkbox on each trash card
   - "Select All" checkbox in toolbar
   - Visual indication of selected items (border, background)
   - Selection count display (e.g., "5 items selected")

2. **Bulk Actions Toolbar**
   - Appears when items are selected
   - Actions: "Restore Selected", "Delete Selected", "Empty Trash"
   - Confirmation dialog for destructive actions
   - Shows count of selected items in action buttons

3. **Empty Trash Action**
   - Button to permanently delete ALL trash items
   - Prominent warning dialog: "Permanently delete X items?"
   - Cannot be undone message
   - Optional: Require typing "DELETE" to confirm

4. **Efficient Mutations**
   - Batch mutations for bulk restore
   - Batch mutations for bulk permanent delete
   - Progress indicator for large batches
   - Handle partial failures gracefully

**Test Scenarios:**

```gherkin
Scenario: Select multiple notes for restoration
  Given I have 10 notes in trash
  When I select 5 notes
  And click "Restore Selected"
  Then all 5 notes are restored
  And trash count decreases by 5

Scenario: Empty entire trash
  Given I have 50 notes in trash
  When I click "Empty Trash"
  And confirm the action
  Then all 50 notes are permanently deleted
  And trash is empty

Scenario: Select all notes
  Given I have 20 notes in trash
  When I click "Select All"
  Then all 20 checkboxes are checked
  And "20 items selected" is shown
```

**Out of Scope:**
- Bulk move to different folders
- Bulk tagging/categorization
- Saved selection sets

---

### User Story 4: Enhanced Trash Filters & Search (Priority: P3)

**As a** NoteFlow user
**I want** to search and filter notes in trash
**So that** I can quickly find specific deleted content to restore

**Context:**
- Large trash makes finding specific notes difficult
- No way to search deleted notes
- No filtering by deletion date or original folder

**Acceptance Criteria:**

1. **Search Within Trash**
   - Search box in trash toolbar
   - Searches title and content of deleted notes
   - Real-time filtering as user types
   - Shows match count

2. **Filter Options**
   - Filter by original folder
   - Filter by deletion date range (last 7 days, 7-14 days, 14-30 days)
   - Filter by expiration urgency (expiring soon < 7 days)
   - Combine filters (AND logic)

3. **Sort Options**
   - Sort by deletion date (newest/oldest)
   - Sort by title (A-Z)
   - Sort by original folder
   - Sort by expiration date (soonest first)

4. **Filter UI**
   - Dropdown menus for filter selection
   - Clear filters button
   - Active filter pills showing current filters
   - Filter count badge

**Test Scenarios:**

```gherkin
Scenario: Search for deleted note by title
  Given I have 100 notes in trash
  When I search for "Meeting Notes"
  Then I see only deleted notes with "Meeting" in title
  And search is case-insensitive

Scenario: Filter by original folder
  Given I deleted notes from 5 different folders
  When I filter by "Work Projects"
  Then I see only notes deleted from "Work Projects"

Scenario: Filter expiring soon
  Given I have notes deleted at various times
  When I filter by "Expiring Soon"
  Then I see only notes with < 7 days remaining
  And they are sorted by expiration (soonest first)
```

**Out of Scope:**
- Advanced search operators (AND, OR, NOT)
- Saved filter presets
- Tag-based filtering

---

### User Story 5: Undo Delete with Toast (Priority: P3)

**As a** NoteFlow user
**I want** an immediate undo option after deleting a note
**So that** I can quickly recover from accidental deletes without visiting trash

**Context:**
- Accidental deletes happen frequently
- Requires navigation to trash to restore
- Modern UX patterns offer immediate undo

**Acceptance Criteria:**

1. **Undo Toast Notification**
   - Toast appears immediately after soft delete
   - Shows: "[Note Title] moved to trash"
   - Undo button prominently displayed
   - Auto-dismisses after 10 seconds

2. **Undo Action**
   - Clicking "Undo" immediately restores note
   - Note returns to original location
   - Toast updates to "Note restored"
   - Works for both single notes and bulk deletes

3. **Toast Queue Management**
   - Multiple deletes show stacked toasts
   - Each has independent undo
   - Oldest dismisses first
   - Max 3 visible toasts at once

4. **Undo Time Window**
   - Undo available for 10 seconds
   - After timeout, must use trash view to restore
   - Toast shows countdown timer (optional)

**Test Scenarios:**

```gherkin
Scenario: Undo single note delete
  Given I am viewing a note
  When I delete it
  Then I see toast: "Note moved to trash [Undo]"
  When I click "Undo" within 10 seconds
  Then the note is restored immediately
  And I see "Note restored" confirmation

Scenario: Undo expires after 10 seconds
  Given I deleted a note
  And 11 seconds have passed
  Then the toast is dismissed
  And I cannot undo from toast
  But I can still restore from trash view

Scenario: Multiple undo toasts
  Given I delete 3 notes quickly
  Then I see 3 stacked undo toasts
  And each has independent undo button
```

**Out of Scope:**
- Configurable undo duration
- Undo history panel
- Redo functionality

---

### User Story 6: Folder Soft Delete Support (Priority: P3)

**As a** NoteFlow user
**I want** deleted folders to go to trash (not permanently deleted)
**So that** I can recover entire folder hierarchies if deleted by mistake

**Context:**
- Currently folders are hard-deleted immediately
- Inconsistent with note soft-delete behavior
- Risk of losing entire project structures

**Acceptance Criteria:**

1. **Folder Soft Delete Schema**
   - Add `isDeleted`, `deletedAt` to folders table
   - Add `deletedFromParentId` for hierarchy restoration
   - Folder and all child notes soft-deleted together

2. **Folder in Trash View**
   - Show deleted folders in trash (grouped separately)
   - Display folder name, note count, deletion date
   - Show original parent folder location
   - Preview child notes on expand

3. **Folder Restore**
   - Restoring folder restores all child notes
   - Maintains folder hierarchy
   - Restores to original parent location
   - Option to restore folder without notes (advanced)

4. **Folder Expiration**
   - Folders follow same 30-day retention
   - When folder expires, all child notes also deleted
   - Warning shown for folders with many notes

**Test Scenarios:**

```gherkin
Scenario: Delete and restore folder with notes
  Given I have folder "Q1 Planning" with 10 notes
  When I delete the folder
  Then folder and all notes are soft-deleted
  And appear in trash
  When I restore the folder
  Then folder and all notes are restored
  And hierarchy is maintained

Scenario: Folder expires with child notes
  Given I deleted folder "Archive" with 50 notes 31 days ago
  When cleanup job runs
  Then folder and all 50 notes are permanently deleted
  And no orphaned notes remain
```

**Out of Scope:**
- Selective note restoration from deleted folder
- Merging restored folders with existing structure
- Folder version history

---

## Priority Summary

**P1 - MVP (Must Have):**
- US1: Automatic 30-Day Trash Expiration
- US2: Original Location Tracking & Smart Restore

**P2 - Important (Should Have):**
- US3: Bulk Trash Management

**P3 - Nice to Have (Could Have):**
- US4: Enhanced Trash Filters & Search
- US5: Undo Delete with Toast
- US6: Folder Soft Delete Support

---

## Success Metrics

After implementing all user stories:

- ✅ Trash automatically cleans itself after 30 days (zero manual intervention)
- ✅ Users can restore notes to original folders (preserves organization)
- ✅ Bulk actions reduce trash management time by 80%
- ✅ Search and filters make large trash navigable
- ✅ Undo reduces accidental permanent deletes to near zero
- ✅ Consistent soft-delete behavior for both notes and folders
- ✅ Zero orphaned data (tags, relationships properly cleaned)
- ✅ Performance remains excellent with 1000+ trash items

---

## Technical Constraints

- Must work within Convex scheduled functions (cron) framework
- Batch operations must handle rate limits (100 items per mutation)
- Auto-expiration must be reliable (no missed cleanups)
- Database indexes must support efficient trash queries
- UI must remain responsive with large trash (pagination/virtualization)
- Must maintain backwards compatibility with existing trash data

---

## Non-Functional Requirements

**Performance:**
- Trash view loads in < 1 second with 100 items
- Bulk operations process 100 items in < 3 seconds
- Search results appear in < 500ms

**Reliability:**
- Scheduled cleanup has 99.9% success rate
- Zero data loss (no accidental permanent deletes)
- Graceful handling of partial failures in bulk ops

**Usability:**
- All actions have clear confirmation dialogs
- Visual feedback for all state changes
- Accessible keyboard navigation
- Mobile-responsive trash management

**Security:**
- Users can only access their own trash
- Permanent deletes require additional confirmation
- Audit log for auto-expiration actions

---

## Dependencies

- Convex scheduled functions (cron jobs)
- Existing notes/folders schema
- Current trash view components
- Authentication/authorization system

---

## Open Questions

1. **Should folder expiration be independent of child notes?**
   - Current spec: folder and notes expire together
   - Alternative: notes can outlive deleted folder

2. **Should we support trash export before expiration?**
   - Users might want to backup before auto-delete
   - Consider CSV/JSON export of trash

3. **Should we notify users before auto-expiration?**
   - Email digest: "5 notes expiring in 3 days"
   - Opt-in vs opt-out notification

4. **Should restored folders merge with existing folders of same name?**
   - Current spec: restore as-is (may duplicate names)
   - Alternative: smart merge with conflict resolution

---

## Future Enhancements (Post-MVP)

- User-configurable retention periods (7, 30, 60, 90 days)
- Trash size quotas and warnings
- Advanced search with boolean operators
- Trash analytics dashboard
- Folder structure diff viewer (before/after delete)
- Bulk export from trash
- Trash recovery statistics
