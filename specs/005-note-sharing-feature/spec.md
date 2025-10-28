# Feature Specification: Note Sharing

**Feature Branch**: `005-note-sharing-feature`
**Created**: 2025-10-28
**Status**: Draft
**Input**: User description: "you can create note and you can share standalone with world"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share Note with Public Link (Priority: P1)

Users can generate a public shareable link for any note that allows anyone with the link to view the note content without authentication.

**Why this priority**: Core functionality that enables the primary use case - sharing notes with others. Without this, the sharing feature has no value.

**Independent Test**: Can be tested by creating a note, generating a share link, and accessing it in an incognito browser window. Success means the note is viewable without login.

**Acceptance Scenarios**:

1. **Given** a user has a note open, **When** they click "Share" action, **Then** a share dialog appears with options to generate a public link
2. **Given** a user generates a share link, **When** the link is created, **Then** a unique, non-guessable URL is generated and displayed for copying
3. **Given** a share link is copied, **When** pasted in a new browser (logged out), **Then** the note content is displayed in a clean, read-only view
4. **Given** a shared note, **When** accessed via public link, **Then** note title, content, and cover image are visible but editing controls are not

---

### User Story 2 - Manage Shared Links (Priority: P1)

Users can view all their shared notes, copy existing share links, and revoke access by disabling or deleting share links.

**Why this priority**: Essential for security and control. Users must be able to manage what they've shared and revoke access when needed.

**Independent Test**: Can be tested by creating multiple share links, viewing them in a list, and testing revocation. Success means revoked links immediately return "not found" or "access revoked" page.

**Acceptance Scenarios**:

1. **Given** a user has created share links, **When** they view their shared notes, **Then** a list displays all notes with active share links
2. **Given** a shared note in the list, **When** user clicks "Copy Link", **Then** the share URL is copied to clipboard
3. **Given** a shared note in the list, **When** user clicks "Revoke Access", **Then** the share link is disabled with confirmation dialog
4. **Given** a revoked share link, **When** accessed, **Then** viewer sees "This note is no longer shared" message

---

### User Story 3 - Clean Public Note View (Priority: P1)

Shared notes display in a clean, distraction-free reader view optimized for consumption without application UI elements.

**Why this priority**: The viewing experience is critical for recipients. A cluttered or confusing view defeats the purpose of sharing.

**Independent Test**: Can be tested by accessing shared links and comparing the view to the editor. Success means recipients see only the content with minimal chrome.

**Acceptance Scenarios**:

1. **Given** a shared note is accessed, **When** the page loads, **Then** only note content, title, and cover image are displayed (no sidebar, no editing tools)
2. **Given** a shared note view, **When** displayed, **Then** responsive design ensures readability on mobile, tablet, and desktop
3. **Given** a shared note with rich content, **When** viewed, **Then** formatting (headings, lists, links, images) renders correctly
4. **Given** a shared note, **When** viewed, **Then** a subtle footer shows "Created with NoteFlow" branding with optional link to app

---

### User Story 4 - Track Share Analytics (Priority: P2)

Users can see basic analytics for their shared notes including view count and last accessed timestamp.

**Why this priority**: Helps users understand if their shared content is being consumed. Nice to have but not essential for core functionality.

**Independent Test**: Can be tested by accessing a share link multiple times and verifying the view count increments. Success means accurate, real-time view counts.

**Acceptance Scenarios**:

1. **Given** a note with an active share link, **When** someone views it, **Then** the view count increments
2. **Given** a user views their shared notes list, **When** displayed, **Then** each note shows total views and last accessed time
3. **Given** a shared note, **When** viewed multiple times by same visitor, **Then** views are counted (no unique visitor tracking for simplicity)
4. **Given** analytics data, **When** share link is revoked, **Then** historical analytics are preserved but marked as "Inactive"

---

### User Story 5 - Share Link Customization (Priority: P3)

Users can optionally customize share link settings like password protection or expiration date.

**Why this priority**: Advanced feature for users who need more control over sharing. Can be added later without blocking core functionality.

**Independent Test**: Can be tested by setting a password or expiration on a share link and verifying access rules. Success means unauthorized access is properly blocked.

**Acceptance Scenarios**:

1. **Given** a user creates a share link, **When** they enable password protection, **Then** visitors must enter password before viewing
2. **Given** a password-protected link, **When** wrong password entered, **Then** error message displayed and content not revealed
3. **Given** a user sets expiration date, **When** date passes, **Then** link becomes inactive and shows "Link expired" message
4. **Given** share settings, **When** user updates them (changes password, extends expiration), **Then** changes apply immediately to existing link

---

### Edge Cases

- What happens when a shared note is deleted by the owner? (Show "Note no longer available")
- What happens when a shared note is moved to trash? (Shared link should stop working)
- How are very long notes handled in the public view? (Scroll with good typography and spacing)
- What if note content includes private/sensitive information user shares accidentally? (Revocation must be instant and complete)
- How do share links behave when the user's account is deleted? (All share links should be revoked)
- What happens if someone tries to generate multiple share links for same note? (Return existing link or allow multiple?)
- How are embedded images/media handled in shared notes? (Must be publicly accessible or proxied)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST generate unique, non-guessable share URLs (minimum 16 characters random string) for each shared note
- **FR-002**: System MUST allow users to create public share links from any non-deleted note
- **FR-003**: System MUST display shared notes in read-only mode without authentication requirements
- **FR-004**: System MUST provide a "Copy Link" action that copies share URL to clipboard
- **FR-005**: System MUST allow users to revoke share access, immediately invalidating the share link
- **FR-006**: System MUST display "Note not available" or similar message for invalid/revoked share links
- **FR-007**: System MUST show list of all notes with active share links in user's dashboard
- **FR-008**: System MUST render shared note content in clean, distraction-free view without app UI elements
- **FR-009**: System MUST preserve note formatting (rich text, images, headings) in public share view
- **FR-010**: System MUST show share status indicator on notes that have active share links
- **FR-011**: System MUST automatically revoke share links when note is soft-deleted (moved to trash)
- **FR-012**: System MUST track basic analytics: view count and last accessed timestamp per share link
- **FR-013**: System MUST display share analytics in the shared notes list view
- **FR-014**: System MUST make public share view responsive for mobile, tablet, and desktop viewing
- **FR-015**: System MUST include subtle branding footer on shared note views (e.g., "Created with NoteFlow")

### Non-Functional Requirements

- **NFR-001**: Share link generation MUST complete within 500ms
- **NFR-002**: Public share view page load MUST be optimized for performance (< 2s initial load)
- **NFR-003**: Share link revocation MUST take effect immediately (< 100ms)
- **NFR-004**: Public share URLs MUST be SEO-friendly with proper meta tags (title, description, og:tags)
- **NFR-005**: System MUST handle at least 1000 concurrent views of shared notes without degradation
- **NFR-006**: Share link format MUST be clean and shareable (e.g., noteflow.app/share/abc123xyz)
- **NFR-007**: Public share view MUST not expose any user personal information or app structure

### Key Entities

- **SharedNote**: Represents a note that has been shared publicly
  - `shareId`: Unique identifier for the share link (random string, indexed)
  - `noteId`: Reference to the original note
  - `userId`: Owner of the note
  - `isActive`: Boolean to enable/disable share link
  - `viewCount`: Number of times the share link has been accessed
  - `lastAccessedAt`: Timestamp of most recent view
  - `createdAt`: When share link was created
  - `updatedAt`: Last modification to share settings
  - `expiresAt`: (Optional) Expiration timestamp for advanced feature
  - `passwordHash`: (Optional) Hashed password for advanced feature

- **ShareView**: (Optional) Detailed view tracking for analytics
  - `shareId`: Reference to SharedNote
  - `viewedAt`: Timestamp of access
  - `referrer`: (Optional) Where traffic came from

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully generate share links with 100% success rate (no failures)
- **SC-002**: Share link revocation takes effect within 100ms with 100% reliability
- **SC-003**: Public share view loads within 2 seconds on 3G connection (95th percentile)
- **SC-004**: Zero exposure of private user data or app internals in public share views
- **SC-005**: 90%+ of users successfully complete share flow (create link → copy → verify in new window) without help
- **SC-006**: Analytics view count accuracy within 99% (allowing for edge cases like cache)
- **SC-007**: Mobile responsive view passes Lighthouse mobile-friendly test with score > 90
- **SC-008**: Share link format is clean enough that 95% of users feel comfortable sharing it (user testing)

## Assumptions

- Shared notes are view-only; no collaborative editing in this feature
- Share links grant access to current version of note; updates to note reflect immediately in share view
- Basic analytics (view count) is sufficient; detailed visitor analytics (location, device) out of scope
- One active share link per note (if user re-shares, use existing link or update it)
- No authentication/authorization required for public share view
- Images and media in notes are either publicly accessible URLs or will be made accessible via proxy
- Share functionality does not include social media preview customization beyond basic OG tags
- Users understand that shared notes are public to anyone with the link
- No rate limiting on share link access for v1 (can be added later if abuse detected)
