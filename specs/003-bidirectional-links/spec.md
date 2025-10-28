# Feature Specification: Bi-Directional Links

**Feature Branch**: `003-bidirectional-links`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "Bi-directional Links - Automatic Two-Way Connections between notes with backlinks, graph view, and link suggestions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Wiki-Style Linking (Priority: P1)

Users can create links between notes using a simple `[[Note Name]]` syntax. When typing this syntax in any note, it creates a connection to the referenced note. Both notes automatically know about each other - the source note shows the link it created, and the target note automatically shows a backlink indicating which note references it.

**Why this priority**: This is the foundational feature that enables all other linking capabilities. Without basic linking, no other user stories can function. It delivers immediate value by allowing users to connect related thoughts and information.

**Independent Test**: Can be fully tested by creating a note with `[[Another Note]]`, verifying the link is clickable, and confirming that "Another Note" shows a backlink to the original note. Delivers value as a basic navigation and organization tool.

**Acceptance Scenarios**:

1. **Given** I am editing a note titled "Project Ideas", **When** I type `[[Marketing Strategy]]`, **Then** I see "Marketing Strategy" rendered as a clickable link
2. **Given** I created a link `[[Marketing Strategy]]` in "Project Ideas", **When** I navigate to the "Marketing Strategy" note, **Then** I see "Project Ideas" listed in the backlinks section
3. **Given** I type `[[New Concept]]` referencing a note that doesn't exist, **When** I click the link, **Then** a new note titled "New Concept" is created automatically
4. **Given** I have a link `[[Team Meeting]]`, **When** I click on it, **Then** I navigate to the "Team Meeting" note instantly
5. **Given** I rename "Marketing Strategy" to "Marketing Plan 2025", **When** I view notes linking to it, **Then** all links automatically update to `[[Marketing Plan 2025]]`

---

### User Story 2 - Backlinks Panel (Priority: P2)

Users can view all notes that reference the current note in a dedicated "Backlinks" panel. This panel appears in the sidebar or below the note content, showing a list of all notes that contain links to the current note. Each backlink entry shows the note title and a preview of the context where the link appears.

**Why this priority**: Backlinks are essential for knowledge discovery and understanding context. They answer "who references this?" and enable users to trace ideas backward through their notes. This is what makes the linking truly "bi-directional."

**Independent Test**: Can be tested by creating 3 notes that link to a fourth note, then verifying the fourth note displays all 3 backlinks with context previews. Delivers value as a knowledge discovery and context-building tool.

**Acceptance Scenarios**:

1. **Given** three notes contain `[[Product Launch]]`, **When** I open the "Product Launch" note, **Then** I see a backlinks panel listing all three notes
2. **Given** a note has backlinks, **When** I hover over a backlink entry, **Then** I see a preview of the surrounding text where the link appears
3. **Given** I click on a backlink entry, **When** the click completes, **Then** I navigate to that note at the specific location of the link
4. **Given** a note has no backlinks, **When** I view the backlinks panel, **Then** I see a message "No notes link to this page yet"
5. **Given** I delete a note that had a backlink to "Product Launch", **When** I view "Product Launch", **Then** the deleted note no longer appears in backlinks

---

### User Story 3 - Visual Knowledge Graph (Priority: P3)

Users can visualize their entire note collection as an interactive graph where notes are nodes and links are connections between them. The graph view provides a bird's-eye view of how knowledge is organized and connected. Users can zoom, pan, and click on nodes to navigate to specific notes. The graph uses visual cues (size, color, clustering) to highlight important or heavily-connected notes.

**Why this priority**: The graph view provides unique value for visual learners and those managing large note collections. It reveals patterns and clusters that aren't obvious from list views. However, it's not essential for basic linking functionality to work.

**Independent Test**: Can be tested by creating 10 interconnected notes and verifying the graph displays all connections accurately with proper clustering. Delivers value as a knowledge exploration and pattern discovery tool.

**Acceptance Scenarios**:

1. **Given** I have created 20 notes with various links, **When** I open the graph view, **Then** I see all notes represented as nodes with lines connecting linked notes
2. **Given** I am viewing the graph, **When** I click on a node, **Then** I navigate to that note directly
3. **Given** I hover over a node in the graph, **When** the hover is active, **Then** I see the note title and number of connections
4. **Given** I have notes with many connections (hub notes), **When** I view the graph, **Then** these hub notes appear larger or more prominent
5. **Given** I have isolated notes with no connections, **When** I view the graph, **Then** these "orphan" notes appear separate from the main cluster
6. **Given** I am viewing a large graph with 100+ notes, **When** I zoom or pan, **Then** the graph responds smoothly without lag

---

### User Story 4 - Smart Link Suggestions (Priority: P4)

As users type in their notes, the system analyzes the content and suggests relevant existing notes to link to. When users type keywords or phrases that match titles or content of other notes, a suggestion dropdown appears offering to create links automatically. This reduces manual linking effort and helps users discover connections they might have missed.

**Why this priority**: Link suggestions enhance the linking experience but aren't required for the core functionality. They add intelligence and convenience but users can function perfectly well with manual linking. This is a polish feature that improves adoption and usability.

**Independent Test**: Can be tested by typing content that matches existing note titles and verifying relevant suggestions appear within 500ms. Delivers value as a productivity enhancement and connection discovery tool.

**Acceptance Scenarios**:

1. **Given** I am typing in a note, **When** I type words that match an existing note title "Machine Learning Basics", **Then** I see a suggestion dropdown offering to link to that note
2. **Given** I see a link suggestion, **When** I press Enter or click on it, **Then** the text is automatically wrapped with `[[Machine Learning Basics]]`
3. **Given** I am typing content similar to another note, **When** the similarity threshold is met, **Then** I see suggestions for related notes even if the title doesn't match exactly
4. **Given** I dismiss a suggestion, **When** I continue typing, **Then** the same suggestion doesn't reappear in the current session
5. **Given** I have created a new note, **When** I start typing content, **Then** suggestions appear based on semantic similarity to existing notes

---

### User Story 5 - Orphan Note Detection (Priority: P5)

Users can identify "orphan" notes - notes that have no incoming or outgoing links to any other notes. The system provides a view or filter showing all orphaned notes, helping users identify isolated information that should be integrated into their knowledge network. This encourages better organization and ensures no valuable information is lost in isolation.

**Why this priority**: Orphan detection is a cleanup and maintenance feature that helps with long-term knowledge management. While valuable for mature users with large note collections, it's not critical for daily use or initial adoption. New users with few notes won't benefit from this yet.

**Independent Test**: Can be tested by creating 5 notes where 2 have no links, then verifying the orphan view correctly identifies and displays only those 2 notes. Delivers value as a knowledge maintenance and organization tool.

**Acceptance Scenarios**:

1. **Given** I have 50 notes where 10 have no links, **When** I access the "Orphan Notes" view, **Then** I see exactly those 10 isolated notes listed
2. **Given** I am viewing an orphan note, **When** I create a link from it to another note, **Then** it is removed from the orphan list immediately
3. **Given** I am viewing the orphan notes list, **When** I click on an orphan note, **Then** I navigate to that note to add connections
4. **Given** I have no orphan notes, **When** I view the orphan notes list, **Then** I see a success message "All notes are connected! 🎉"
5. **Given** I am viewing a note, **When** I check its status, **Then** I see a visual indicator if it's an orphan (e.g., icon or badge)

---

### Edge Cases

- What happens when a user creates a link to a note with special characters like `[[Note: Plan & Design]]`?
- How does the system handle circular references where Note A → Note B → Note C → Note A?
- What happens when a user creates multiple links to the same note within one note (duplicates)?
- How does the system handle deleted notes that have existing links pointing to them?
- What happens when two users simultaneously rename the same linked note in a collaborative environment?
- How does the system perform when displaying backlinks for extremely popular "hub" notes with 500+ incoming links?
- What happens when a user tries to create a link with an empty name `[[]]`?
- How does the system handle very long note titles in links `[[This is an extremely long note title that might cause display issues]]`?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse `[[Note Title]]` syntax in note content and render it as a clickable link
- **FR-002**: System MUST create bidirectional relationship records when a link is created (source → target, target ← source)
- **FR-003**: System MUST automatically create a new note when clicking a link to a non-existent note
- **FR-004**: System MUST display a backlinks panel showing all notes that link to the current note
- **FR-005**: System MUST update all links automatically when a note is renamed
- **FR-006**: System MUST remove broken links when the target note is permanently deleted
- **FR-007**: System MUST provide a visual graph view showing all notes and their connections
- **FR-008**: System MUST allow navigation to notes by clicking on links or graph nodes
- **FR-009**: System MUST suggest relevant notes to link while user is typing based on title matching
- **FR-010**: System MUST identify and display orphan notes (notes with zero connections)
- **FR-011**: System MUST show link context (surrounding text) in backlinks panel
- **FR-012**: System MUST support case-insensitive note title matching for links (e.g., `[[project plan]]` matches "Project Plan")
- **FR-013**: System MUST highlight unlinked mentions - note titles that appear in text but aren't linked
- **FR-014**: System MUST allow users to convert plain text into a link with a keyboard shortcut or button
- **FR-015**: System MUST maintain link integrity when notes are moved between folders

### Key Entities

- **Link**: Represents a connection between two notes
  - Source Note ID (the note containing the link)
  - Target Note ID (the note being referenced)
  - Link Text (the text displayed in the link, may differ from target note title)
  - Context (surrounding text where link appears)
  - Created timestamp
  - Type (explicit [[link]] or unlinked mention)

- **Note** (enhanced): Existing note entity with additional link-related attributes
  - Outgoing Links Count (how many links this note contains)
  - Incoming Links Count (how many notes link to this)
  - Is Orphan (boolean flag for notes with zero connections)
  - Last Linked timestamp (when a link was last added/removed)

- **Graph Node**: Represents a note in the graph visualization
  - Note ID
  - Position (x, y coordinates for graph layout)
  - Connections (list of linked note IDs)
  - Visual Properties (size based on connection count, color for clusters)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a link using `[[syntax]]` in under 5 seconds from start of typing
- **SC-002**: Backlinks appear in the panel within 100 milliseconds of loading a note
- **SC-003**: Graph view loads and renders fully in under 2 seconds for collections of up to 1000 notes
- **SC-004**: Link suggestions appear within 500 milliseconds of typing matching text
- **SC-005**: System maintains 100% accuracy in bidirectional relationships (every forward link has corresponding backlink)
- **SC-006**: 80% of new users successfully create their first link within the first session
- **SC-007**: Graph view remains responsive (60 FPS) when panning and zooming with up to 500 nodes visible
- **SC-008**: Orphan note detection completes in under 1 second for collections of up to 10,000 notes
- **SC-009**: Note renaming updates all associated links in under 500 milliseconds
- **SC-010**: Users report 40% improvement in ability to find related information compared to folder-only organization
- **SC-011**: 70% of users who try graph view report it helps them understand their knowledge structure

## Scope *(mandatory)*

### In Scope

- Wiki-style `[[Note Title]]` link syntax
- Automatic bidirectional link tracking
- Backlinks panel with context preview
- Interactive visual graph view
- Link suggestions based on title matching
- Orphan note detection and display
- Automatic link updates on note rename
- Creating new notes from non-existent links
- Case-insensitive link matching
- Unlinked mention detection

### Out of Scope

- Aliases (multiple names for the same note) - future enhancement
- Block-level links (linking to specific paragraphs) - future enhancement
- External links to websites or files - different feature
- Link annotations or comments - future enhancement
- Custom graph layouts or themes - initial version uses standard force-directed layout
- Collaborative real-time link editing - depends on broader collaboration feature
- Link versioning or history - covered by note version history
- Export of graph as image - future enhancement
- Advanced graph filters (by tag, date, folder) - future enhancement

## Assumptions *(if applicable)*

1. **Note Titles are Unique**: We assume each note has a unique title within the system. If duplicates exist, the system will prompt user to select which note to link to.

2. **English Text Primary**: Initial link suggestions and matching will be optimized for English text. Multi-language support is a future enhancement.

3. **Modern Browser Support**: Graph visualization assumes modern browsers with Canvas/WebGL support for rendering.

4. **Single User Context**: Initial implementation focuses on single-user experience. Multi-user collaborative linking will be addressed when real-time collaboration is implemented.

5. **Sufficient Performance**: We assume server/database can handle the additional queries for backlink lookups and graph generation without significant performance degradation.

6. **User Understanding**: Users are familiar with wiki-style linking from other tools (Notion, Obsidian, Roam) or will learn from in-app tooltips/tutorials.

## Dependencies *(if applicable)*

- **Existing Note System**: Depends on current notes schema and CRUD operations
- **Search Infrastructure**: Link suggestions require full-text search capability across note titles and content
- **Real-time Updates**: Backlinks panel should update in real-time when links are created/deleted in other notes (depends on Convex's real-time subscription capabilities)
- **Rich Text Editor**: Must be enhanced to parse and render `[[link]]` syntax within existing block-based editor
- **Graph Visualization Library**: Need to integrate a graph visualization library (e.g., D3.js, Cytoscape.js, or vis.js)

## Open Questions

None at this time. All critical aspects of the feature are specified with reasonable defaults. The implementation team can make technical decisions about graph layout algorithms, caching strategies, and performance optimizations during the planning phase.
