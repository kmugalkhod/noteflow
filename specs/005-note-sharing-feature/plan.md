# Implementation Plan: Note Sharing

**Branch**: `005-note-sharing-feature` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-note-sharing-feature/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable users to create and share notes publicly via unique, non-guessable links. Anyone with the link can view note content in a clean, read-only format without authentication. Users can manage their shared links, track basic analytics (view count, last accessed), and revoke access at any time.

## Technical Context

**Language/Version**: TypeScript 5.9.3, React 19.1.0, Next.js 15.5.5
**Primary Dependencies**: Convex (backend), Next.js App Router, Clerk (auth), Radix UI, Tailwind CSS
**Storage**: Convex database (existing schema with notes, users tables)
**Testing**: NEEDS CLARIFICATION (testing framework needs to be determined)
**Target Platform**: Web application (responsive desktop, tablet, mobile browsers)
**Project Type**: Web application (Next.js frontend + Convex backend)
**Performance Goals**: Share link generation <500ms, public view page load <2s on 3G, revocation <100ms
**Constraints**: Public share view must not expose user data, handle 1000 concurrent views, SEO-optimized
**Scale/Scope**: Feature adds 2 new Convex tables (sharedNotes, shareViews), 1 public route, 3-4 UI components, ~5-7 Convex functions

**Additional Context**:
- Existing Convex schema has `notes` table with full note data (title, content, blocks, coverImage)
- Clerk handles authentication for app users, but share view is public (no auth)
- Share links need unique, random IDs (NEEDS CLARIFICATION: ID generation strategy - crypto.randomUUID vs nanoid?)
- Public route structure (NEEDS CLARIFICATION: `/share/[shareId]` vs `/s/[shareId]` for cleaner URLs?)
- Image handling in shared notes (NEEDS CLARIFICATION: are coverImages already publicly accessible or need proxy?)
- SEO meta tags generation (NEEDS CLARIFICATION: use Next.js metadata API or custom head tags?)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is currently a template. Applying general best practices for this check.

### Security & Privacy
- ✅ **PASS**: Public share view does not expose user personal information (email, user ID, private notes)
- ✅ **PASS**: Share links use non-guessable, cryptographically secure random IDs
- ✅ **PASS**: Revocation is immediate and complete (no cached access post-revocation)
- ⚠️ **REVIEW**: Need to ensure Convex auth bypassing for public queries is properly secured

### Data Integrity
- ✅ **PASS**: Shared notes are read-only views; no data modification from public access
- ✅ **PASS**: Deleting/trashing a note automatically revokes share access
- ✅ **PASS**: Analytics tracking does not impact note data integrity

### Performance & Scalability
- ✅ **PASS**: Public share route is optimized (minimal data fetching, no auth overhead)
- ✅ **PASS**: Share link generation is lightweight (<500ms target)
- ⚠️ **REVIEW**: Need to verify Convex can handle 1000 concurrent public reads without rate limiting

### User Experience
- ✅ **PASS**: Share flow is simple (click share → copy link → done)
- ✅ **PASS**: Public view is clean, responsive, and distraction-free
- ✅ **PASS**: Error states are user-friendly (revoked/invalid links show helpful messages)

### Maintainability
- ✅ **PASS**: Feature follows existing patterns (Convex schema, Next.js routes, UI components)
- ✅ **PASS**: Minimal new dependencies (can use built-in crypto or nanoid if needed)
- ⚠️ **REVIEW**: Need testing strategy to verify share functionality doesn't break existing note features

**Overall Status**: ✅ **APPROVED TO PROCEED** with research phase to resolve clarifications marked above

## Project Structure

### Documentation (this feature)

```text
specs/005-note-sharing-feature/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification (created)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a Next.js web application with Convex backend.

```text
# Frontend (Next.js App Router)
app/
├── (dashboard)/                    # Existing authenticated routes
│   └── ...
├── share/                          # NEW: Public share routes
│   └── [shareId]/
│       └── page.tsx                # Public note view page
├── api/                            # Existing API routes
└── ...

# UI Components
components/
├── share/                          # NEW: Share-related components
│   ├── ShareDialog.tsx             # Modal for creating/managing share links
│   ├── ShareButton.tsx             # Button to trigger share dialog
│   ├── ShareList.tsx               # List of user's shared notes
│   └── PublicNoteView.tsx          # Clean reader view for public access
└── ...

# Backend (Convex)
convex/
├── schema.ts                       # MODIFY: Add sharedNotes and shareViews tables
├── sharedNotes.ts                  # NEW: Mutations & queries for share links
├── publicShare.ts                  # NEW: Public queries (no auth required)
├── notes.ts                        # MODIFY: Add share indicator to note queries
└── ...

# Utilities
lib/
├── shareUtils.ts                   # NEW: Share ID generation, validation utilities
└── ...

# Types (if using separate types file)
modules/
└── types/
    └── share.ts                    # NEW: TypeScript types for share entities
```

**Structure Decision**: Using Next.js App Router for public share route at `/share/[shareId]`. This keeps public content separate from authenticated dashboard routes. Convex functions are split into authenticated (`sharedNotes.ts`) and public (`publicShare.ts`) to clearly separate auth requirements. New UI components are organized under `components/share/` for feature isolation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Feature follows existing architectural patterns and adds minimal complexity.

---

## Post-Design Constitution Re-Evaluation

**Date**: 2025-10-28 (After Phase 1 completion)

### Review Against Original Gates

#### Security & Privacy
- ✅ **CONFIRMED**: Data model ensures no user personal data in public queries
- ✅ **CONFIRMED**: ShareId uses nanoid (16 chars) - cryptographically secure
- ✅ **CONFIRMED**: Public query (`getSharedNote`) does not call auth functions
- ✅ **CONFIRMED**: Revocation sets `isActive=false` immediately, no caching

**Status**: All security gates PASS ✅

#### Data Integrity
- ✅ **CONFIRMED**: Public share view is read-only (no mutations from public route)
- ✅ **CONFIRMED**: `deleteNote` mutation includes automatic share revocation
- ✅ **CONFIRMED**: Analytics (viewCount) uses separate field, no impact on note data

**Status**: All data integrity gates PASS ✅

#### Performance & Scalability
- ✅ **CONFIRMED**: Public route optimized (single indexed query on shareId)
- ✅ **CONFIRMED**: Share link generation uses nanoid (~1ms), well under 500ms target
- ✅ **CONFIRMED**: Convex handles 1M function calls/month (free tier sufficient for MVP)
- 📊 **MONITORING**: Need to track usage post-launch for rate limiting needs

**Status**: All performance gates PASS ✅ (with monitoring plan)

#### User Experience
- ✅ **CONFIRMED**: Share flow is 2 clicks: Share button → Create link → Copy
- ✅ **CONFIRMED**: PublicNoteView component uses clean, minimal design
- ✅ **CONFIRMED**: Error states defined: "Note not found", "Access revoked"
- ✅ **CONFIRMED**: Responsive design via Tailwind utilities

**Status**: All UX gates PASS ✅

#### Maintainability
- ✅ **CONFIRMED**: Uses existing Convex patterns (defineTable, query, mutation)
- ✅ **CONFIRMED**: Uses existing UI patterns (Radix Dialog, Tailwind, existing button components)
- ✅ **CONFIRMED**: One new dependency: nanoid (130 bytes, negligible)
- ✅ **CONFIRMED**: Testing strategy defined (Vitest + React Testing Library)

**Status**: All maintainability gates PASS ✅

### New Considerations Post-Design

#### SEO & Social Sharing
- ✅ Uses Next.js 15 Metadata API (type-safe, built-in)
- ✅ OpenGraph tags for proper social media previews
- ✅ Dynamic metadata based on note content

**Status**: PASS ✅

#### Accessibility
- ✅ Keyboard navigation supported (Radix UI provides ARIA attributes)
- ✅ Toast notifications for screen reader announcements
- ✅ Focus management in dialogs

**Status**: PASS ✅

### Final Constitution Check Result

**Overall Status**: ✅ **ALL GATES PASS**

The design follows all project principles:
- Secure by default (no auth bypass vulnerabilities)
- Data integrity maintained
- Performance targets achievable
- Excellent user experience
- Maintainable architecture
- Accessible to all users

**Approval**: ✅ **APPROVED FOR IMPLEMENTATION**

---

## Phase 2: Next Steps

This planning phase is now complete. All design artifacts have been generated:
- ✅ Feature specification (`spec.md`)
- ✅ Research decisions (`research.md`)
- ✅ Data model (`data-model.md`)
- ✅ API contracts (`contracts/`)
- ✅ Implementation guide (`quickstart.md`)
- ✅ Agent context updated (`CLAUDE.md`)

**Ready for**: `/speckit.tasks` command to generate implementation tasks
