# Implementation Tasks: Note Sharing

**Feature**: 005-note-sharing-feature
**Branch**: `005-note-sharing-feature`
**Generated**: 2025-10-28
**Tech Stack**: TypeScript 5.9.3, React 19.1.0, Next.js 15.5.5, Convex, Radix UI, Tailwind CSS

## Overview

This document provides a complete, dependency-ordered task list for implementing the note sharing feature. Tasks are organized by user story to enable independent, incremental delivery.

**Total Tasks**: 28
**Estimated Time**: 4.5 hours (MVP with US1-US3)

---

## Implementation Strategy

### MVP Scope (Recommended First PR)
- **User Story 1**: Share Note with Public Link (P1) - Core sharing functionality
- **User Story 3**: Clean Public Note View (P1) - Public viewing experience
- **Partial US2**: Basic share management (create, copy, revoke) without list view

### Post-MVP Increments
- **User Story 2**: Full share management with list view (P1)
- **User Story 4**: Track Share Analytics (P2)
- **User Story 5**: Share Link Customization (P3) - Future enhancement

### Parallel Execution Opportunities
- Backend (Convex) tasks and Frontend (React) tasks can run in parallel within each story
- All tasks marked [P] can be developed simultaneously with other [P] tasks in the same phase
- Different developers can work on different user stories independently after foundational phase

---

## Phase 1: Setup & Dependencies

**Goal**: Install dependencies and prepare project structure for note sharing feature.

**Tasks**:

- [X] T001 Install nanoid dependency for share ID generation: `npm install nanoid`
- [X] T002 [P] Create share utilities file at lib/shareUtils.ts with generateShareId, buildShareUrl, and validateShareId functions
- [X] T003 [P] Create TypeScript types file at modules/types/share.ts for SharedNote and ShareData interfaces
- [X] T004 [P] Create share components directory structure: components/share/

**Independent Test**: Dependencies installed, import statements work without errors.

---

## Phase 2: Foundational Backend (Blocking for All Stories)

**Goal**: Set up Convex database schema and core infrastructure for sharing.

**Prerequisites**: Phase 1 complete

**Tasks**:

- [X] T005 Update Convex schema in convex/schema.ts to add sharedNotes table with fields: shareId, noteId, userId, isActive, viewCount, lastAccessedAt, createdAt, updatedAt
- [X] T006 Add indexes to sharedNotes table: by_share_id, by_note, by_user, by_user_active
- [X] T007 Verify Convex schema deployment: `npm run dev` and check Convex dashboard for sharedNotes table

**Independent Test**: sharedNotes table exists in Convex dashboard with correct fields and indexes.

---

## Phase 3: User Story 1 - Share Note with Public Link (P1)

**Story Goal**: Users can generate a public shareable link for any note that allows anyone with the link to view the note content without authentication.

**Prerequisites**: Phase 2 complete

**Independent Test Criteria**:
1. User clicks "Share" button on a note → dialog opens
2. User clicks "Create Share Link" → unique URL is generated and displayed
3. Copy share link and paste in incognito browser → note content displays without login
4. Note title, content, and cover image visible in public view; no editing controls

### Backend Tasks (US1)

- [X] T008 [P] [US1] Create convex/sharedNotes.ts file for authenticated share functions
- [X] T009 [P] [US1] Implement createShareLink mutation in convex/sharedNotes.ts: verify ownership, check existing share, generate shareId via nanoid, create SharedNote record, return shareId and shareUrl
- [X] T010 [P] [US1] Implement getShareByNoteId query in convex/sharedNotes.ts to check if note already has active share
- [X] T011 [P] [US1] Create convex/publicShare.ts file for public (no auth) functions
- [X] T012 [P] [US1] Implement getSharedNote query in convex/publicShare.ts: lookup by shareId, validate isActive, fetch note data, increment viewCount, return public-safe fields only (title, content, blocks, contentType, coverImage)
- [X] T013 [US1] Update deleteNote mutation in convex/notes.ts to auto-revoke shares when note is deleted: query shares by noteId, set isActive=false for all

### Frontend Tasks (US1)

- [ ] T014 [P] [US1] Create ShareButton component in components/share/ShareButton.tsx with props: noteId, variant, size, disabled
- [ ] T015 [P] [US1] Create ShareDialog component in components/share/ShareDialog.tsx with states: loading, not_shared, shared, error
- [ ] T016 [P] [US1] Implement "not shared" view in ShareDialog: show "Create Share Link" button, call createShareLink mutation on click
- [ ] T017 [P] [US1] Implement "shared" view in ShareDialog: display share URL, copy button, analytics (viewCount, lastAccessedAt), revoke button
- [ ] T018 [P] [US1] Implement clipboard copy functionality in ShareDialog with toast notification "Link copied!"
- [ ] T019 [P] [US1] Create PublicNoteView component in components/share/PublicNoteView.tsx: render title, content, coverImage in clean layout with "Created with NoteFlow" footer
- [ ] T020 [US1] Create public share page at app/share/[shareId]/page.tsx with generateMetadata for SEO (title, description, OpenGraph tags)
- [ ] T021 [US1] Implement share page logic: fetch note via getSharedNote query, render PublicNoteView if found, show "Note not available" if null
- [ ] T022 [US1] Add ShareButton to note editor/viewer UI (location TBD based on existing UI patterns)

**Story Complete Test**: Create share link → copy URL → open in incognito → verify note displays correctly with no auth required.

---

## Phase 4: User Story 2 - Manage Shared Links (P1)

**Story Goal**: Users can view all their shared notes, copy existing share links, and revoke access by disabling share links.

**Prerequisites**: Phase 3 (US1) complete

**Independent Test Criteria**:
1. User views list of all their shared notes with active share links
2. User clicks "Copy Link" on a share → URL copied to clipboard
3. User clicks "Revoke Access" → confirmation dialog → share disabled
4. Accessing revoked link → "This note is no longer shared" message

### Backend Tasks (US2)

- [ ] T023 [P] [US2] Implement revokeShareLink mutation in convex/sharedNotes.ts: verify ownership, set isActive=false, update updatedAt, preserve analytics
- [ ] T024 [P] [US2] Implement getMySharedNotes query in convex/sharedNotes.ts: fetch all shares by userId, include note titles, return sorted by createdAt

### Frontend Tasks (US2)

- [ ] T025 [P] [US2] Implement revoke functionality in ShareDialog with confirmation dialog and call to revokeShareLink mutation
- [ ] T026 [P] [US2] Create ShareList component in components/share/ShareList.tsx: display all user's shares with note title, URL, viewCount, status badge, actions (copy, revoke, preview)
- [ ] T027 [US2] Add "Note not available" or "This note is no longer shared" view to app/share/[shareId]/page.tsx for revoked shares

**Story Complete Test**: Create multiple shares → view in ShareList → revoke one → verify revoked link shows error message.

---

## Phase 5: User Story 3 - Clean Public Note View (P1)

**Story Goal**: Shared notes display in a clean, distraction-free reader view optimized for consumption without application UI elements.

**Prerequisites**: Phase 3 (US1) complete

**Independent Test Criteria**:
1. Access shared note → only content, title, coverImage displayed (no sidebar, no editing tools)
2. Responsive design works on mobile, tablet, desktop
3. Rich content (headings, lists, links, images) renders correctly
4. Footer shows "Created with NoteFlow" branding

### Frontend Tasks (US3)

- [ ] T028 [P] [US3] Polish PublicNoteView component in components/share/PublicNoteView.tsx: responsive typography (18px base, 1.7 line-height), Tailwind prose classes, dark mode support, render rich text vs plain text based on contentType

**Story Complete Test**: Access share link on mobile and desktop → verify clean layout, readable typography, correct content rendering.

---

## Phase 6: User Story 4 - Track Share Analytics (P2)

**Story Goal**: Users can see basic analytics for their shared notes including view count and last accessed timestamp.

**Prerequisites**: Phase 3 (US1), Phase 4 (US2) complete

**Independent Test Criteria**:
1. View share link multiple times → viewCount increments
2. View shared notes list → each shows total views and last accessed time
3. Multiple views by same visitor → all views counted
4. Revoke share → historical analytics preserved, marked "Inactive"

### Backend Tasks (US4)

Analytics tracking is already implemented in US1 (T012 - getSharedNote increments viewCount). No additional backend tasks needed.

### Frontend Tasks (US4)

Analytics display is already implemented in US1 (T017 - ShareDialog shows viewCount and lastAccessedAt) and US2 (T026 - ShareList shows analytics). No additional frontend tasks needed.

**Story Complete Test**: Access share link 5 times → view in ShareList → verify count = 5, last accessed shows recent timestamp.

**Note**: US4 is complete through tasks in US1 and US2. This phase serves as validation/testing only.

---

## Phase 7: User Story 5 - Share Link Customization (P3)

**Story Goal**: Users can optionally customize share link settings like password protection or expiration date.

**Status**: **Out of scope for MVP**. This is a P3 story and should be implemented post-MVP if needed.

**Future Tasks** (not included in current implementation):
- Add passwordHash field to sharedNotes schema
- Add expiresAt field to sharedNotes schema
- Implement password validation in publicShare.getSharedNote
- Implement expiration check in publicShare.getSharedNote
- Add password/expiration UI to ShareDialog
- Add password input to public share page

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final polish, error handling, and production readiness.

**Prerequisites**: Phases 3-5 complete (US1, US2, US3)

**Tasks**: None currently defined. Add tasks here for:
- Performance optimization (if needed)
- Additional error handling
- Analytics/monitoring setup
- Documentation updates
- Any edge cases discovered during testing

---

## Dependency Graph

### Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational Backend) ← Blocking for all stories
    ↓
    ├─→ Phase 3 (US1: Share with Link) ← MVP Core
    │       ↓
    │   Phase 4 (US2: Manage Links) ← MVP Complete
    │       ↓
    │   Phase 5 (US3: Public View Polish) ← MVP Polish
    │       ↓
    │   Phase 6 (US4: Analytics) ← Post-MVP Enhancement
    │
    └─→ Phase 7 (US5: Customization) ← Future (P3)
```

### Within-Story Dependencies

**US1 (Share with Link)**:
- Backend tasks (T008-T013) can run in parallel (all marked [P])
- Frontend tasks (T014-T019) can run in parallel (all marked [P])
- T020-T022 depend on frontend components being ready
- Backend and Frontend can be developed simultaneously

**US2 (Manage Links)**:
- Backend tasks (T023-T024) can run in parallel
- Frontend tasks (T025-T027) can run in parallel
- US2 depends on US1 backend being complete

---

## Parallel Execution Examples

### Example 1: Full Parallelization (3 developers)

**Developer A** (Backend):
- T008-T013 (US1 Convex functions)
- T023-T024 (US2 Convex functions)

**Developer B** (Frontend - Components):
- T014-T019 (US1 Share components)
- T025-T026 (US2 Share management)

**Developer C** (Frontend - Routes):
- T020-T022 (US1 Public page)
- T027 (US2 Error states)
- T028 (US3 Polish)

### Example 2: Sequential by Story (1 developer)

**Week 1 - MVP Core**:
- Day 1: Phase 1 & 2 (Setup + Foundation)
- Day 2: US1 Backend (T008-T013)
- Day 3: US1 Frontend (T014-T022)
- Day 4: US2 (T023-T027)
- Day 5: US3 + Testing (T028 + manual tests)

### Example 3: Backend-First (2 developers)

**Developer A** (Backend specialist):
- Complete all Convex work: T008-T013, T023-T024
- Then assist with integration testing

**Developer B** (Frontend specialist):
- Complete all UI work: T014-T028
- Integration happens when both streams merge

---

## Task Checklist Summary

### Phase 1: Setup (4 tasks)
- [ ] T001-T004 (All parallelizable)

### Phase 2: Foundation (3 tasks)
- [ ] T005-T007 (Sequential)

### Phase 3: US1 - Share with Link (15 tasks)
- [ ] T008-T019 (13 parallelizable)
- [ ] T020-T022 (3 sequential, depend on components)

### Phase 4: US2 - Manage Links (5 tasks)
- [ ] T023-T024 (2 parallelizable)
- [ ] T025-T027 (3 parallelizable)

### Phase 5: US3 - Public View Polish (1 task)
- [ ] T028 (1 parallelizable)

### Phase 6: US4 - Analytics (0 tasks)
- Already implemented in US1/US2

### Phase 7: US5 - Customization (0 tasks)
- Out of scope for MVP

**Total: 28 implementation tasks**

---

## Testing Checklist

Execute after completing each phase:

### US1 Testing
- [ ] Create share link for a note
- [ ] Verify unique shareId generated (16 chars)
- [ ] Copy share link to clipboard
- [ ] Open share link in incognito browser
- [ ] Verify note content displays without auth
- [ ] Verify editing controls not visible
- [ ] Test on mobile device (responsive)
- [ ] Delete note, verify share link stops working
- [ ] Try sharing already-shared note (should return existing link)

### US2 Testing
- [ ] Create multiple share links
- [ ] View all shares in ShareList
- [ ] Copy link from ShareList
- [ ] Revoke a share link
- [ ] Access revoked link → verify error message
- [ ] Verify revoked share still shows in list (marked inactive)
- [ ] Test revoke with confirmation dialog

### US3 Testing
- [ ] Access shared note on phone
- [ ] Access shared note on tablet
- [ ] Access shared note on desktop
- [ ] Verify typography is readable (18px, 1.7 line-height)
- [ ] Test dark mode
- [ ] Verify footer branding present
- [ ] Test with rich content note (headings, lists, images)
- [ ] Test with plain text note

### US4 Testing
- [ ] Access share link 5 times
- [ ] Verify viewCount = 5 in ShareList
- [ ] Verify lastAccessedAt shows recent time
- [ ] Revoke share, verify analytics preserved
- [ ] Test concurrent views (view count accuracy)

### Performance Testing
- [ ] Share link generation completes in <500ms
- [ ] Public page loads in <2s on 3G (use DevTools throttling)
- [ ] Revocation takes effect in <100ms
- [ ] Test 10 concurrent public page views (no errors)

### Security Testing
- [ ] Verify shareId is non-guessable (16 random chars)
- [ ] Verify public page doesn't expose user email
- [ ] Verify public page doesn't expose user ID
- [ ] Try accessing share for note owned by another user
- [ ] Try sharing note you don't own (should fail)
- [ ] Verify revoked share immediately inaccessible

### SEO Testing
- [ ] Share link on Discord/Slack → verify preview shows
- [ ] Check OpenGraph tags with https://www.opengraph.xyz/
- [ ] Verify title, description, image in preview
- [ ] Test Twitter card rendering

---

## Environment Setup

Before starting implementation:

1. **Environment Variables**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
   ```

2. **Convex Dashboard**:
   - Ensure you have access to Convex dashboard
   - Verify schema changes deploy correctly

3. **Development Server**:
   ```bash
   npm run dev  # Start Next.js + Convex
   ```

---

## Rollback Plan

If feature needs to be disabled:

1. Hide ShareButton from UI (comment out or feature flag)
2. Return 404 from app/share/[shareId]/page.tsx
3. Keep sharedNotes table (data preserved)
4. Keep Convex functions (no breaking changes)

To fully remove:
1. Delete components/share/ directory
2. Delete app/share/ directory
3. Delete convex/sharedNotes.ts and convex/publicShare.ts
4. Remove sharedNotes table from schema (only if data not needed)

---

## Success Criteria

Feature is complete when:

- ✅ Users can create share links in <5 seconds
- ✅ Public share page loads in <2 seconds on 3G
- ✅ Revocation is instant (<100ms)
- ✅ Mobile responsive (Lighthouse score >90)
- ✅ Zero user data exposed in public view
- ✅ SEO preview works on Discord/Slack
- ✅ All US1, US2, US3 acceptance criteria pass
- ✅ All test scenarios pass

---

## Next Steps After Implementation

1. Run `/speckit.implement` to execute tasks
2. Create PR with completed US1-US3 (MVP)
3. Manual testing using checklist above
4. Deploy to staging for user testing
5. Gather feedback before implementing US4 (Analytics) and US5 (Customization)

---

## Notes

- Tasks marked [P] are parallelizable
- Tasks marked [US#] belong to specific user story
- Follow task order within each phase for best results
- Estimated time includes implementation only (not testing/review)
- Use quickstart.md for detailed code examples

**Ready to implement!** 🚀
