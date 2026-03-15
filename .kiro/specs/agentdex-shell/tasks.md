# Implementation Plan: Agentdex Shell

## Overview

Replace the `/office` stub with the Agentdex — a browsable agent directory at `/agentdex` with profile pages at `/agentdex/{slug}`. Extends StatusBadge for agent statuses, creates AgentCard and ChatPlaceholder components, adds agent utility functions, creates a second seed agent, and updates navigation. All pages are server components reading from the existing content loader.

## Tasks

- [x] 1. Route rename and navigation update
  - [x] 1.1 Update navigation config: rename "Office" → "Agentdex", `/office` → `/agentdex` in `src/lib/navigation.ts`
    - Change the label and href in `NAV_LINKS`
    - _Requirements: 1.1, 1.4, 6.1_

  - [x] 1.2 Update navigation tests in `src/__tests__/lib/navigation.test.ts`
    - Replace all `/office` and "Office" references with `/agentdex` and "Agentdex"
    - _Requirements: 1.4_

  - [x] 1.3 Delete old office route files and tests
    - Delete `src/app/office/page.tsx`, `src/app/office/[slug]/page.tsx`, and the `src/app/office/` directory
    - Delete `src/__tests__/app/office/page.test.tsx`, `src/__tests__/app/office/[slug]/page.test.tsx`, and the `src/__tests__/app/office/` directory
    - _Requirements: 1.2, 1.4_

- [x] 2. Agent utility functions and seed content
  - [x] 2.1 Create `src/lib/content/agent-utils.ts` with `getShortDescription` and `sortAgentsByName`
    - `getShortDescription(personality: string): string` — returns text up to first `\n`, or full string if no `\n`
    - `sortAgentsByName(agents: Agent[]): Agent[]` — returns new sorted array using `localeCompare(other.name, undefined, { sensitivity: 'base' })`
    - Both are pure functions, no side effects
    - _Requirements: 2.2, 2.3_

  - [x] 2.2 Write property tests for `getShortDescription` (Property 2)
    - **Property 2: Short description extraction**
    - For any string `personality`, result is substring before first `\n`; if no `\n`, full string returned; result never empty for non-empty input; result never contains `\n`
    - Use `fast-check` with minimum 100 iterations in `src/__tests__/lib/content/agent-utils.test.ts`
    - **Validates: Requirements 2.3, 4.1**

  - [x] 2.3 Write property tests for `sortAgentsByName` (Property 1)
    - **Property 1: Sort order is case-insensitive and locale-aware**
    - For any list of Agent entities with random names (mixed case, accented chars), output matches `localeCompare` with `{ sensitivity: 'base' }`
    - Use shared `agentArbitrary` generator, minimum 100 iterations in `src/__tests__/lib/content/agent-utils.test.ts`
    - **Validates: Requirements 2.2**

  - [x] 2.4 Create seed agent `content/agents/code-review-agent.yaml`
    - Status `experimental` (different from sales-agent's `coming-soon`)
    - Multi-line `personality` with `\n` to exercise Short_Description extraction
    - Distinct role and capabilities from sales-agent
    - Realistic, non-placeholder text matching brand tone
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 2.5 Update seed validation tests in `src/__tests__/content/seed-validation.test.ts`
    - Add test: at least 2 agents exist
    - Add test: at least two distinct agent statuses
    - Add test: at least one agent has multi-line personality (contains `\n`)
    - Add test: no placeholder text ("TODO", "lorem ipsum")
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 3. Extend StatusBadge for agent statuses
  - [x] 3.1 Extend `src/components/StatusBadge.tsx` to support agent statuses
    - Widen `Status` type union to include `'active' | 'coming-soon' | 'experimental'`
    - Add three new entries to `STATUS_CONFIG`: active (emerald), coming-soon (purple), experimental (orange)
    - Existing callers unaffected — type is widened, not changed
    - _Requirements: 2.3, 3.2, 4.4_

  - [x] 3.2 Add agent status test cases to `src/__tests__/components/StatusBadge.test.tsx`
    - Test all three new statuses render correct labels and color classes
    - _Requirements: 4.4_

- [x] 4. Checkpoint — Verify foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create AgentCard and ChatPlaceholder components
  - [x] 5.1 Create `src/components/AgentCard.tsx`
    - Entire card wrapped in `<Link>` to `/agentdex/{slug}` — agent name provides accessible link text
    - Renders: portrait image (conditional, `object-cover` with fixed aspect ratio), name as heading, role, StatusBadge, short description via `getShortDescription`
    - When portrait absent, image area omitted entirely
    - _Requirements: 4.1, 4.2, 4.3, 2.3, 2.4, 2.5_

  - [x] 5.2 Create `src/components/ChatPlaceholder.tsx`
    - `<button>` with `aria-disabled="true"` (NOT native `disabled`)
    - Visual label "Start Chat", secondary text "Coming Soon"
    - `aria-label="Start Chat — Coming Soon"`
    - No `onClick` handler, `pointer-events: none` via CSS
    - Muted/grayed appearance
    - _Requirements: 3.7, 3.8_

  - [x] 5.3 Write ChatPlaceholder tests in `src/__tests__/components/ChatPlaceholder.test.tsx`
    - Test: renders as `<button>` element
    - Test: has `aria-disabled="true"`, NOT native `disabled`
    - Test: has descriptive `aria-label` containing both action and unavailability
    - Test: no functional click behavior
    - _Requirements: 3.7, 3.8_

  - [x] 5.4 Write AgentCard tests in `src/__tests__/components/AgentCard.test.tsx`
    - Unit tests: renders name, role, status badge, short description, link to `/agentdex/{slug}`
    - Unit tests: portrait present → `<img>` with alt; portrait absent → no `<img>`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.5 Write property test for AgentCard (Property 3)
    - **Property 3: AgentCard renders complete content**
    - For any Agent entity (random name, role, personality, capabilities, status, optional portrait), card renders all required fields, short description (not full personality), link to `/agentdex/{slug}`, and conditional portrait
    - Use shared `agentArbitrary` generator, minimum 100 iterations in `src/__tests__/components/AgentCard.test.tsx`
    - **Validates: Requirements 2.3, 2.4, 2.5, 4.1, 4.2, 4.3**

- [x] 6. Implement Agentdex index page
  - [x] 6.1 Create `src/app/agentdex/page.tsx`
    - Server component calling `getAgents()`, sorting via `sortAgentsByName`
    - Static metadata: `title: 'Agentdex'`, `description` as a readable sentence about Lorenzo's AI agent directory
    - Heading + introductory text (structural label) explaining the Agentdex
    - Responsive grid: `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`
    - Renders `AgentCard` for each agent
    - Empty state: `<p>` with message when no agents exist, no grid rendered
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.1, 7.2_

  - [x] 6.2 Write index page tests in `src/__tests__/pages/agentdex-index.test.tsx`
    - Test: heading and intro text rendered
    - Test: agents rendered in sorted order (DOM order matches `sortAgentsByName`)
    - Test: empty state message when `getAgents()` returns `[]`
    - Test: static metadata has correct title and description
    - _Requirements: 2.1, 2.2, 2.7, 7.1, 7.2_

- [x] 7. Implement agent profile page
  - [x] 7.1 Create `src/app/agentdex/[slug]/page.tsx`
    - Server component calling `getAgentBySlug(slug)`, returns `notFound()` if null
    - `generateStaticParams`: calls `getAgents()`, maps to slug strings
    - `generateMetadata`: `title: agent.name`, `description: "{Agent Name} — an AI agent specializing in {role}."`
    - Back navigation: `<Link href="/agentdex">` with "← Back to Agentdex"
    - Portrait image (conditional, `object-cover`, consistent dimensions)
    - Name as `<h1>`, role as subtitle, StatusBadge
    - Full `personality` text (not short description)
    - Capabilities as `<ul>` list
    - ChatPlaceholder at the bottom
    - `world` and `software` fields NOT displayed
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 7.3, 7.4_

  - [x] 7.2 Write profile page tests in `src/__tests__/pages/agentdex-profile.test.tsx`
    - Test: renders agent name, role, status badge, full personality, capabilities list
    - Test: portrait present → `<img>` with alt; portrait absent → no `<img>`
    - Test: ChatPlaceholder rendered
    - Test: back navigation link to `/agentdex`
    - Test: `notFound()` called when agent is null
    - Test: `generateStaticParams` returns all agent slugs
    - _Requirements: 3.1–3.11_

  - [x] 7.3 Write property test for profile metadata (Property 5)
    - **Property 5: Profile metadata is a readable sentence**
    - For any Agent with random name and role, `generateMetadata` returns title equal to agent name and description containing both name and role as a complete sentence
    - Use `agentArbitrary` generator, minimum 100 iterations in `src/__tests__/pages/agentdex-profile.test.tsx`
    - **Validates: Requirements 7.3, 7.4**

  - [x] 7.4 Write property test for profile rendering (Property 4)
    - **Property 4: Profile page renders required fields and excludes world/software**
    - For any Agent with random fields (including optional world/software objects), page renders name, role, status, full personality, capabilities, chat placeholder; does NOT render world/software field values
    - Use `agentArbitrary` generator, minimum 100 iterations in `src/__tests__/pages/agentdex-profile.test.tsx`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Properties 3 and 4 (component/page PBT) are ambitious — monitor implementation cost and simplify if they bloat the feature
- Checkpoints ensure incremental validation
- All pages are server components — no client-side state or Zustand interaction
