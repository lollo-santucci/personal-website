# Design Document: Agentdex Shell

## Overview

The Agentdex Shell adds the classic view's agent directory — a browsable listing at `/agentdex` with individual agent profile pages at `/agentdex/{slug}`. This replaces the current stub at `/office` with a fully designed section that follows the established card-based listing pattern (Projects, Blog) while introducing agent-specific elements: status badges for agent statuses, short description extraction from personality, portrait images, and a chat placeholder button for future functionality.

The spec also renames the navigation entry from "Office" → "Agentdex" and adds a second seed agent so the listing exercises multi-item behavior.

### Key Design Decisions

1. **StatusBadge extension**: The existing `StatusBadge` component is extended with a union type to support both project statuses and agent statuses, rather than creating a parallel component.
2. **AgentCard as link wrapper**: The entire card is an `<a>` element (via `Link`), matching the clickable-card pattern. The agent name inside provides accessible link text.
3. **Short description extraction**: A pure utility function `getShortDescription(personality)` extracts text up to the first `\n`. This is testable independently of UI.
4. **Chat placeholder**: A `<button>` element with `aria-disabled="true"` (not the native `disabled` attribute), as specified in the requirements. This keeps the element focusable for screen readers while communicating the disabled state. The button has no `onClick` handler and prevents interaction via CSS (`pointer-events: none`).
5. **Portrait images**: `object-cover` with fixed aspect ratio container for consistent card dimensions. Omitted entirely when absent — no placeholder image.
6. **Meta descriptions**: Readable sentences, not raw field values. Index page gets a static sentence. Profile pages use the pattern `"{Agent Name} — an AI agent specializing in {role}."`.
7. **Sorting**: `localeCompare(other.name, undefined, { sensitivity: 'base' })` for case-insensitive, locale-aware alphabetical ordering. Using `undefined` as locale defers to the runtime's default locale rather than hardcoding `'en'` — appropriate since the project context is Italian and agent names may include accented characters.

## Architecture

### Route Structure

```
src/app/
├── agentdex/
│   ├── page.tsx          # Index page (server component)
│   └── [slug]/
│       └── page.tsx      # Profile page (server component)
```

The existing `src/app/office/` directory and its contents are deleted. No redirect — `/office` returns 404 naturally.

### Data Flow

```
content/agents/*.yaml
        ↓
  Content Loader (getAgents, getAgentBySlug)
        ↓
  Server Components (sort, extract short description)
        ↓
  React Components (AgentCard, StatusBadge, ChatPlaceholder)
```

All pages are server components. No client-side state, no Zustand interaction. The Agentdex is a pure content-reading section.

### Component Hierarchy

```
AgentdexPage (server)
├── AgentCard (server) × N
│   ├── Portrait image (conditional)
│   └── StatusBadge
│
AgentProfilePage (server)
├── Portrait image (conditional)
├── StatusBadge
├── Personality section
├── Capabilities list
├── ChatPlaceholder
└── Back navigation link
```

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/app/agentdex/page.tsx` | Create | Agentdex index page |
| `src/app/agentdex/[slug]/page.tsx` | Create | Agent profile page |
| `src/components/AgentCard.tsx` | Create | Reusable agent listing card |
| `src/components/ChatPlaceholder.tsx` | Create | Disabled chat button for profile pages |
| `src/components/StatusBadge.tsx` | Modify | Extend type union to include agent statuses |
| `src/lib/navigation.ts` | Modify | Rename "Office" → "Agentdex", `/office` → `/agentdex` |
| `src/lib/content/agent-utils.ts` | Create | Agent utility functions (`getShortDescription`, `sortAgentsByName`) |
| `content/agents/code-review-agent.yaml` | Create | Second seed agent |
| `src/app/office/page.tsx` | Delete | Old stub |
| `src/app/office/[slug]/page.tsx` | Delete | Old stub |
| `src/__tests__/lib/navigation.test.ts` | Modify | Update `/office` → `/agentdex` references |
| `src/__tests__/lib/content/agent-utils.test.ts` | Create | Unit + PBT tests for agent utilities |
| `src/__tests__/components/AgentCard.test.tsx` | Create | AgentCard component tests |
| `src/__tests__/components/ChatPlaceholder.test.tsx` | Create | ChatPlaceholder component tests |
| `src/__tests__/components/StatusBadge.test.tsx` | Modify | Add agent status test cases |
| `src/__tests__/pages/agentdex-index.test.tsx` | Create | Agentdex index page tests |
| `src/__tests__/pages/agentdex-profile.test.tsx` | Create | Agent profile page tests |
| `src/__tests__/content/seed-validation.test.ts` | Modify | Add agent seed validation |
| `src/__tests__/app/office/` | Delete | Old office test directory (if any tests exist) |

### Files Referenced but Not Created by This Spec

- `src/lib/types/agent.ts` — Agent interface (Spec 2, unchanged)
- `src/lib/content/agents.ts` — Content loader (Spec 4, unchanged)
- `src/lib/content/index.ts` — Content barrel export (Spec 4, unchanged)
- `src/app/layout.tsx` — Root layout with title template (Spec 5, unchanged)
- `src/components/ProjectCard.tsx` — Card pattern reference (Spec 6, unchanged)

## Components and Interfaces

### StatusBadge Extension

The existing `StatusBadge` accepts `'completed' | 'in-progress' | 'ongoing'`. This spec extends the type union to also accept `'active' | 'coming-soon' | 'experimental'`.

The `STATUS_CONFIG` record gains three new entries:

| Status | Label | Colors |
|---|---|---|
| `active` | Active | `bg-emerald-100 text-emerald-800` |
| `coming-soon` | Coming Soon | `bg-purple-100 text-purple-800` |
| `experimental` | Experimental | `bg-orange-100 text-orange-800` |

The component's `Status` type becomes the union of all six values. Existing callers are unaffected — the type is widened, not changed.

### AgentCard

Accepts an `Agent` entity. Renders as a single `<Link>` wrapping the entire card (the `<article>` is inside the link). This matches the clickable-card pattern but differs from `ProjectCard` which has the link only on the title — the requirement specifies the entire card is a link.

Layout:
- Portrait image (if present): fixed-height container with `object-cover` for consistent dimensions regardless of aspect ratio. Rendered via `<img>` with `alt={agent.name}`.
- Agent name (heading level determined by context — `<h2>` when used in the index listing)
- Role text
- StatusBadge with agent status
- Short description extracted via `getShortDescription(agent.personality)`

When `portrait` is absent, the image area is omitted entirely — no placeholder, no empty space.

### ChatPlaceholder

A self-contained component rendering a `<button>` element with:
- `aria-disabled="true"` (not the HTML `disabled` attribute — `aria-disabled` keeps the element focusable for screen readers)
- Visual label: "Start Chat"
- Secondary text: "Coming Soon"
- `aria-label="Start Chat — Coming Soon"` for assistive technology
- `onClick` handler that does nothing (or is absent) — the button is inert
- Visual styling: muted/grayed appearance to communicate non-interactivity

### Agent Utility Functions (`src/lib/content/agent-utils.ts`)

```
getShortDescription(personality: string): string
```
Returns text up to the first `\n` in `personality`. If no `\n` exists, returns the full string. Pure function, no side effects.

```
sortAgentsByName(agents: Agent[]): Agent[]
```
Returns a new array sorted alphabetically by `name` using `localeCompare(other.name, undefined, { sensitivity: 'base' })`. Does not mutate the input. Pure function.

### Agentdex Index Page

Server component at `/agentdex`. Calls `getAgents()`, sorts via `sortAgentsByName`, renders a responsive grid of `AgentCard` components.

- Static metadata: `title: 'Agentdex'`, `description` as a readable sentence.
- Responsive grid: `grid-cols-1` on mobile, `md:grid-cols-2` on medium+, `lg:grid-cols-3` on large+.
- Empty state: a `<p>` with a message when no agents exist.
- Heading + introductory text explaining the Agentdex (structural label).

### Agent Profile Page

Server component at `/agentdex/[slug]`. Calls `getAgentBySlug(slug)`, returns `notFound()` if null.

- `generateStaticParams`: calls `getAgents()`, maps to slug strings.
- `generateMetadata`: returns `title: agent.name`, `description: "{Agent Name} — an AI agent specializing in {role}."`, `alternates.canonical: /agentdex/{slug}`.
- Back navigation: `<Link href="/agentdex">` with "← Back to Agentdex" text.
- Portrait image (conditional): displayed with `object-cover` and consistent dimensions.
- Name as `<h1>`, role as subtitle, StatusBadge.
- Full `personality` text (not short description — that's for cards only).
- Capabilities as `<ul>` list.
- ChatPlaceholder at the bottom.
- `world` and `software` fields are NOT displayed.

## Data Models

### Agent Entity (Existing — Spec 2)

No changes to the Agent interface. The Agentdex consumes these fields:

| Field | Type | Required | Used In |
|---|---|---|---|
| `name` | `string` | Yes | Card, profile, metadata, alt text |
| `slug` | `Slug` | Yes | Routing, links, static params |
| `role` | `string` | Yes | Card, profile, metadata |
| `personality` | `string` | Yes | Card (short desc), profile (full) |
| `capabilities` | `string[]` | Yes | Profile only |
| `status` | `'active' \| 'coming-soon' \| 'experimental'` | Yes | Card, profile (badge) |
| `portrait` | `AssetPath?` | No | Card, profile (image) |
| `world` | `object?` | No | NOT displayed |
| `software` | `object?` | No | NOT displayed |

### Content Loader Contract (Existing — Spec 4)

| Function | Signature | Behavior |
|---|---|---|
| `getAgents()` | `() => Promise<Agent[]>` | Returns all agents from `content/agents/`. Empty dir → `[]`. |
| `getAgentBySlug(slug)` | `(slug: string) => Promise<Agent \| null>` | Returns matching agent or `null`. Accepts plain string. |

### Seed Agent: Code Review Agent

Second seed agent to exercise multi-item listing and different status values.

```yaml
name: Code Review Agent
slug: code-review-agent
role: Automated code review and quality analysis
personality: |
  Meticulous, constructive, and occasionally pedantic about naming conventions.
  Reads your pull requests so your teammates don't have to argue about semicolons.
  Believes every codebase tells a story — and most of them need an editor.
capabilities:
  - code-review
  - static-analysis
  - style-enforcement
  - refactoring-suggestions
status: experimental
```

This agent has:
- `status: experimental` (different from sales-agent's `coming-soon`)
- Multi-line `personality` (exercises `getShortDescription` extraction — first line: "Meticulous, constructive, and occasionally pedantic about naming conventions.")
- Distinct role and capabilities from sales-agent
- Realistic, non-placeholder text matching the brand tone


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sort order is case-insensitive and locale-aware

*For any* list of Agent entities with randomly generated names (including mixed case, accented characters, and unicode), `sortAgentsByName` should return them in the same order as sorting by `name.localeCompare(other.name, undefined, { sensitivity: 'base' })`.

**Validates: Requirements 2.2**

*Rationale: PBT-friendly — `sortAgentsByName` is a pure function. Random name generation exercises case sensitivity, accented characters, and edge cases that fixed examples would miss. Minimum 100 iterations.*

### Property 2: Short description extraction

*For any* string `personality`, `getShortDescription(personality)` should return the substring before the first `\n` character. If `personality` contains no `\n`, the entire string should be returned. The result should never be empty if the input is non-empty, and should never contain a `\n` character.

**Validates: Requirements 2.3, 4.1** (Short_Description definition used in cards)

*Rationale: PBT-friendly — pure function with string input. Generators produce strings with 0, 1, or many newlines, empty strings, and strings with only newlines. Minimum 100 iterations.*

### Property 3: AgentCard renders complete content

*For any* Agent entity (with randomly generated name, role, personality, capabilities, status, and optional portrait), the AgentCard component should render: the agent's name, role, a status badge with the correct label, the short description (not full personality), and a link to `/agentdex/{slug}`. When portrait is present, an `<img>` with `alt={name}` should exist. When portrait is absent, no `<img>` element should exist.

**Validates: Requirements 2.3, 2.4, 2.5, 4.1, 4.2, 4.3**

*Rationale: PBT-friendly — component rendering with random Agent data. The generator produces agents with and without portraits, various statuses, and multi-line personalities (to verify short description extraction in context). Minimum 100 iterations.*

### Property 4: Profile page renders required fields and excludes world/software

*For any* Agent entity (with randomly generated fields including optional world and software objects), the profile page should render: the agent's name as a heading, role, status badge, full personality text, each capability as a list item, and a chat placeholder button. The rendered output should NOT contain the string values from `world` or `software` fields when present.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

*Rationale: PBT-friendly — server component rendering with random Agent data. Generators include agents with and without world/software/portrait fields. The exclusion check (world/software not rendered) is particularly valuable with random data since it catches accidental field leakage. Minimum 100 iterations.*

### Property 5: Profile metadata is a readable sentence

*For any* Agent entity with randomly generated name and role, the `generateMetadata` function should return a title equal to the agent's name and a description that is a complete sentence containing both the agent's name and role — not just the raw role value.

**Validates: Requirements 7.3, 7.4**

*Rationale: PBT-friendly — metadata generation is a pure derivation from agent fields. Random names and roles verify the template works for any content, not just seed data. Minimum 100 iterations.*

## Error Handling

### Missing Agent (404)

When `getAgentBySlug(slug)` returns `null`, the profile page calls `notFound()` from `next/navigation`, which triggers Next.js's built-in 404 handling. No custom error page is created by this spec.

### Empty Agent Directory

When `getAgents()` returns `[]`, the index page renders an empty state message. No error is thrown. The grid container is not rendered.

### Missing Portrait

When `agent.portrait` is `undefined`, the image area is omitted entirely in both card and profile contexts. No broken image icon, no placeholder. The layout adjusts naturally — cards without portraits are shorter.

### Content Loader Errors

Content loader validation errors (missing required fields, slug mismatch) are handled by the content loader layer (Spec 4). This spec does not add additional validation. If a malformed YAML file exists, the loader throws at build time — this is the intended behavior.

## Alignment with Steering

### Naming Conventions
- Component files: PascalCase (`AgentCard.tsx`, `ChatPlaceholder.tsx`), following existing project convention
- Content files: kebab-case (`code-review-agent.yaml`)
- Components: PascalCase (`AgentCard`, `ChatPlaceholder`)
- Utilities: camelCase (`getShortDescription`, `sortAgentsByName`)
- Entity slugs: kebab-case (`sales-agent`, `code-review-agent`)
- Route directories: kebab-case (`agentdex`)

### Import Patterns
- `@/` alias for `src/` imports
- Content loaded via `@/lib/content` barrel export
- Components import from `@/components/`
- Agent utilities from `@/lib/content/agent-utils`
- Types from `@/lib/types`

### File Placement
- Route pages in `src/app/agentdex/`
- Shared components in `src/components/`
- Utility functions in `src/lib/`
- Seed content in `content/agents/`
- Tests mirror source structure in `src/__tests__/`

### Server/Client Boundaries
- All Agentdex pages are server components (no `'use client'` directive)
- No client-side state — pure content reading
- No Zustand interaction — Agentdex is classic view only
- ChatPlaceholder is a server component (no client-side behavior needed — the placeholder is inert markup only)

### Testing Conventions
- Vitest as test runner
- `// @vitest-environment jsdom` for component tests
- Node environment for utility/content tests
- `fast-check` for property-based tests
- Mock `@/lib/content` and `next/link` in component/page tests
- Async server components: `const el = await Page(); render(el);`
- Test files in `src/__tests__/` mirroring source structure

### Existing Patterns Preserved
- Card structure follows `ProjectCard`/`BlogPostCard` conventions (border, padding, spacing)
- Index page follows `ProjectsPage`/`BlogPage` pattern (heading, grid, empty state)
- Detail page follows `ProjectDetailPage` pattern (back link, heading, metadata, static params)
- StatusBadge extended, not duplicated

## Testing Strategy

### Property-Based Tests (fast-check)

Each correctness property maps to a single `fast-check` property test. All PBT tests run minimum 100 iterations.

| Property | Test File | What It Tests |
|---|---|---|
| P1: Sort order | `src/__tests__/lib/content/agent-utils.test.ts` | `sortAgentsByName` pure function |
| P2: Short description | `src/__tests__/lib/content/agent-utils.test.ts` | `getShortDescription` pure function |
| P3: AgentCard content | `src/__tests__/components/AgentCard.test.tsx` | Component rendering with random agents |
| P4: Profile content/exclusion | `src/__tests__/pages/agentdex-profile.test.tsx` | Page rendering with random agents |
| P5: Profile metadata | `src/__tests__/pages/agentdex-profile.test.tsx` | `generateMetadata` with random agents |

### Unit / Integration Tests

| Test | Test File | What It Tests |
|---|---|---|
| Navigation rename | `src/__tests__/lib/navigation.test.ts` | NAV_LINKS contains "Agentdex" at `/agentdex`, no `/office` |
| StatusBadge agent statuses | `src/__tests__/components/StatusBadge.test.tsx` | Three new status values render correct labels/classes |
| ChatPlaceholder accessibility | `src/__tests__/components/ChatPlaceholder.test.tsx` | `aria-disabled`, `aria-label`, button element, no click behavior |
| Index page heading/intro | `src/__tests__/pages/agentdex-index.test.tsx` | Heading, intro text, grid rendering |
| Index page empty state | `src/__tests__/pages/agentdex-index.test.tsx` | Empty state message when no agents |
| Index page sort order | `src/__tests__/pages/agentdex-index.test.tsx` | DOM order matches sorted order |
| Profile page 404 | `src/__tests__/pages/agentdex-profile.test.tsx` | `notFound()` called for unknown slug |
| Profile back navigation | `src/__tests__/pages/agentdex-profile.test.tsx` | Back link to `/agentdex` |
| Seed agent count | `src/__tests__/content/seed-validation.test.ts` | ≥2 agents, distinct statuses, no placeholders |
| Seed agent multi-line personality | `src/__tests__/content/seed-validation.test.ts` | At least one agent has `\n` in personality |
| Index metadata | `src/__tests__/pages/agentdex-index.test.tsx` | Static metadata title and description |

### PBT Library

- **Library**: `fast-check` (already installed, used in navigation tests)
- **Minimum iterations**: 100 per property (`{ numRuns: 100 }`)
- **Tag format**: Comment above each test: `/** Feature: agentdex-shell, Property {N}: {title} */`

### Agent Arbitrary (Shared Generator)

A shared `agentArbitrary` generator for `fast-check` that produces valid `Agent` entities with:
- Random non-empty `name` (including mixed case, accented chars)
- Random kebab-case `slug`
- Random non-empty `role`
- Random `personality` (with and without `\n` characters)
- Random non-empty `capabilities` array (1-5 items)
- Random `status` from `['active', 'coming-soon', 'experimental']`
- Optional `portrait` (present ~50% of the time)
- Optional `world` and `software` objects (present ~30% of the time, with recognizable string values for exclusion testing)

This generator is defined in the test files that need it (or a shared test utility if multiple files use it).
