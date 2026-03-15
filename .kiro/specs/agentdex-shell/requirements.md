# Requirements Document

## Introduction

This spec builds the Agentdex — the classic view's agent directory. Content pages are complete (Spec 6). The Agentdex is the final content section of the classic view: a browsable listing of Lorenzo's AI agents with individual profile pages.

The Agentdex is a classic view concept. The play view equivalent is the Office (ufficio) — a world location where the player physically meets agents. Both share the same Agent entities from the content system but present them differently: the Agentdex is a directory, the Office is a place you walk into.

This spec covers the shell only: listing, profiles, and a chat placeholder. Chat functionality (Vercel AI SDK, API routes, streaming) is deferred to the Agent Platform phase (Phase 8). After this spec, the classic view's page structure is complete and the site is fully navigable.

## Glossary

- **Agentdex**: The classic view's agent directory — a browsable index of all Agent entities with individual profile pages. Not "agent list", "agent directory", or "Office" (see below).
- **Office**: The play view's agent hub — a world location (ufficio) where the player meets agents as characters. Shares Agent entities with the Agentdex but is a separate concept.
- **Agent**: An entity with triple nature: content profile (Agentdex), world character (play view), and software entity (chat/tools). Not "bot" or "chatbot".
- **Agent_Status**: One of `active`, `coming-soon`, or `experimental` — defined in the Agent interface (Spec 2).
- **Content_System**: The content directory (`content/`) plus the content loader layer. Single source of truth for all displayable text.
- **Content_Loader**: The typed async functions from `src/lib/content/` that return validated, branded entities from the content directory.
- **Chat_Placeholder**: A visible but non-functional UI element on agent profile pages indicating that chat will be available in a future phase. Semantically a `<button>` element with `aria-disabled="true"` (not the native `disabled` attribute, to remain focusable for assistive technology). Signals future capability without implementing it.
- **Structural_Label**: A hardcoded UI string that describes page structure or navigation (e.g., "Agentdex", "Back to Agentdex", "Start Chat", "Coming Soon", section headings, empty state messages) as opposed to content text loaded from the Content_System. Structural labels are the only acceptable hardcoded strings in page components, alongside fallback titles for missing content entities.
- **Static_Generation**: Build-time rendering via `generateStaticParams` that pre-renders all known dynamic route paths.
- **Short_Description**: The text extracted from an agent's `personality` field up to the first newline character (`\n`). If `personality` contains no newline, the entire string is used. Used in listing cards only — the profile page shows the full `personality` text.

## Dependencies

- Agent interface (Spec 2): `Agent` type with required fields `name`, `slug`, `role`, `personality`, `capabilities`, `status`. Optional fields: `portrait`, `world`, `software`.
- Agent content loader (Spec 4): `getAgents()` returns all Agent entities; `getAgentBySlug(slug)` returns a single Agent or null.
- Site shell (Spec 5): Root layout with title template `%s | Lorenzo Santucci`, header with navigation, footer, route file structure.
- Navigation config (Spec 5): Currently defines an "Office" link at `/office` — this spec renames it to "Agentdex" at `/agentdex`.
- Status badge component (Spec 6): Renders a visually distinct label for entity statuses. Agent statuses (`active`, `coming-soon`, `experimental`) SHALL be supported by the same component.
- Existing card components (Spec 6): Project and blog post card components establish the visual pattern for entity listing cards. The agent card follows the same structural conventions.
- Seed content (Spec 3/4): One agent (`sales-agent.yaml`) currently exists. This spec adds at least one more to make the listing meaningful.

## Requirements

### Requirement 1: Route and Navigation Rename

**User Story:** As a visitor, I want the navigation to say "Agentdex" and link to `/agentdex`, so that the terminology is consistent with the site's glossary and the section's purpose is clear.

#### Acceptance Criteria

1. WHEN a visitor clicks the navigation link formerly labeled "Office", THE site SHALL navigate to `/agentdex` with the label "Agentdex".
2. THE route `/office` SHALL no longer serve content. Requests to `/office` or `/office/{slug}` SHALL return a 404 response.
3. THE navigation active state SHALL highlight the "Agentdex" link when the visitor is on `/agentdex` or any `/agentdex/{slug}` sub-route.
4. ALL source-code references to `/office` SHALL be updated to `/agentdex` across: route directories, navigation configuration, test files, and any other source files that reference the `/office` path.

### Requirement 2: Agentdex Index Page

**User Story:** As a visitor, I want to browse all of Lorenzo's AI agents in a directory format, so that I can understand what agents exist and what they do.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/agentdex`, THE page SHALL display a heading and brief introductory text explaining what the Agentdex is — Lorenzo's AI agents, what they do, and what they're for. The introductory text is a Structural_Label.
2. THE page SHALL list all Agent entities returned by the Content_Loader, sorted alphabetically by agent `name` (case-insensitive, locale-aware).
3. EACH agent in the listing SHALL display: the agent's name, role, status as a visually distinct badge, and the agent's Short_Description (see Glossary).
4. IF an agent has a `portrait` field, THE listing entry SHALL display the portrait image with an `alt` attribute containing the agent's name. Portrait images SHALL render with consistent card dimensions regardless of source aspect ratio. IF `portrait` is absent, THE listing entry SHALL omit the image area entirely — no broken image, no placeholder.
5. EACH agent listing entry SHALL link to `/agentdex/{slug}` for the corresponding agent.
6. THE listing SHALL use a responsive grid layout that adapts from single-column on small screens to multi-column on larger screens. Exact breakpoints and column counts are design decisions.
7. WHEN no agents exist in the Content_System, THE page SHALL display an empty state message — no crash, no broken layout.

### Requirement 3: Agent Profile Page

**User Story:** As a visitor, I want to view a full agent profile with personality, capabilities, and status, so that I can understand what the agent does and how it works.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/agentdex/{slug}`, THE page SHALL display the matching agent's name as a heading.
2. THE page SHALL display the agent's role and status as a visually distinct badge.
3. THE page SHALL display the agent's full `personality` text (guaranteed required by Agent interface — see Dependencies).
4. THE page SHALL display the agent's `capabilities` as a list of individual items (guaranteed required, array of strings — see Dependencies).
5. IF the agent has a `portrait` field, THE page SHALL display the portrait image with an `alt` attribute containing the agent's name. IF `portrait` is absent, THE image area SHALL be omitted entirely.
6. THE page SHALL NOT display the optional `world` or `software` fields. The profile page shows the content profile only — world and software aspects are consumed by other views/phases.
7. THE page SHALL display a Chat_Placeholder: a `<button>` element with `aria-disabled="true"` labeled "Start Chat" that shows "Coming Soon" text. The native HTML `disabled` attribute SHALL NOT be used — `aria-disabled` keeps the element focusable for assistive technology while communicating the disabled state. The Chat_Placeholder SHALL NOT trigger any navigation, API call, or functional behavior.
8. THE Chat_Placeholder SHALL have a descriptive accessible label (e.g., "Start Chat — Coming Soon") so that assistive technology conveys both the action and its unavailability.
9. THE page SHALL display a navigation element linking back to `/agentdex` (e.g., "Back to Agentdex").
10. ALL known agent slugs SHALL be pre-rendered at build time via Static_Generation.
11. IF no agent matches the given slug, THEN THE page SHALL return a 404 response.

### Requirement 4: Agent Listing Card

**User Story:** As a developer, I want a reusable card component for displaying agents in listings, so that the Agentdex index (and future agent listings elsewhere) share consistent presentation.

#### Acceptance Criteria

1. A reusable agent card component SHALL accept an Agent entity and render its name, role, status as a visually distinct badge, and the agent's Short_Description.
2. IF the agent has a `portrait` field, THE card SHALL display the portrait image with an `alt` attribute containing the agent's name. IF absent, THE card SHALL omit the image area.
3. THE entire card SHALL be a link to `/agentdex/{slug}` for the corresponding agent. Since the card itself is the link, the agent's name within the card provides the accessible link text.
4. THE agent status badge SHALL use the same visual pattern (shape, sizing, font) as the existing project status badge, supporting Agent_Status values (`active`, `coming-soon`, `experimental`).

### Requirement 5: Additional Seed Agent

**User Story:** As a developer, I want at least two agent definitions in the content system, so that the Agentdex listing is meaningful and exercises multi-item display behavior.

#### Acceptance Criteria

1. THE Content_System SHALL contain at least 2 Agent entries with valid content (all required fields populated per the Agent interface).
2. At least one agent SHALL have a status other than the existing agent's status, so that the listing exercises multiple Agent_Status values.
3. THE new agent SHALL have a distinct role and capabilities set that differs from the existing sales-agent.
4. ALL seed agents SHALL contain realistic, non-placeholder text appropriate for a freelance developer's AI agent roster. No lorem ipsum, no "TODO" markers.
5. ALL seed agents SHALL pass content loader validation without errors (required fields present, slug matches filename).
6. At least one seed agent SHALL have a multi-line `personality` field (containing `\n`) to exercise the Short_Description extraction behavior.

### Requirement 6: Agentdex Integration with Site Navigation

**User Story:** As a visitor, I want the Agentdex to be seamlessly integrated into the site's navigation, so that I can reach it from anywhere and navigate back from agent profiles.

#### Acceptance Criteria

1. THE navigation header SHALL include "Agentdex" pointing to `/agentdex`, consistent with the existing navigation links.
2. THE agent profile page SHALL include a back-navigation element to `/agentdex`.
3. THE Agentdex index and agent profile pages SHALL be responsive — usable on mobile, tablet, and desktop viewports.
4. WHEN a new `.yaml` file is added to the agents content directory with valid required fields, THE agent SHALL appear on `/agentdex` automatically at the next build — no code changes required.

### Requirement 7: Agentdex Metadata

**User Story:** As a visitor (or search engine), I want the Agentdex pages to have meaningful titles and descriptions, so that the section is discoverable and shareable.

#### Acceptance Criteria

1. THE Agentdex index page SHALL have a `<title>` of `Agentdex | {Site Name}`, following the root layout's existing title template.
2. THE Agentdex index page SHALL have a meta description that is a complete, meaningful sentence describing the Agentdex as Lorenzo's directory of AI agents and what visitors can find there.
3. EACH agent profile page SHALL have a `<title>` of `{Agent Name} | {Site Name}`, following the root layout's existing title template.
4. EACH agent profile page SHALL have a meta description formatted as a readable sentence derived from the agent's `role` (e.g., for role "Sales & Lead Generation", the description could be "{Agent Name} — {role}"). The exact sentence format is a design decision, but it SHALL be more descriptive than the raw `role` value alone.