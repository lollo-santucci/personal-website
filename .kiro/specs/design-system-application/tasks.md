# Implementation Plan: Design System Application

## Overview

Apply the Spec 8 design system foundations to every classic view page. Work proceeds in dependency order: data model extensions → utility functions → shared layout components → page-level components → page redesigns → deprecation cleanup → polish. Each task builds on the previous, ending with full wiring and build verification.

## Tasks

- [x] 1. Extend Agent data model and update seed content
  - [x] 1.1 Extend the Agent interface with new required and optional fields
    - Add `index` (number), `mission` (string), `bestFor` (string[]), `toneOfVoice` (object with `warm`, `direct`, `playful`, `formal`, `calm` as 1–5 numbers), `greeting` (optional string) to `src/lib/types/agent.ts`
    - _Requirements: 17.1, 17.2_

  - [x] 1.2 Update agent content loader validation
    - In `src/lib/content/agents.ts`, add `'index'`, `'mission'`, `'bestFor'`, `'toneOfVoice'` to `VALIDATION.requiredFields` and `'bestFor'` to `VALIDATION.arrayFields`
    - _Requirements: 17.4_

  - [x] 1.3 Update existing agent YAML files with extended fields
    - Update `content/agents/sales-agent.yaml` and `content/agents/code-review-agent.yaml` with `index`, `mission`, `bestFor`, `toneOfVoice` values
    - At least one agent must have a `greeting` field
    - _Requirements: 17.3, 18.1, 18.2_

  - [x] 1.4 Create Lorenzo agent YAML file
    - Create `content/agents/lorenzo-santucci.yaml` with all Agent_Extended_Fields populated (agent 001, used by about page sidebar)
    - _Requirements: 17.3, 18.1_

  - [x] 1.5 Ensure at least one project has an `image` field pointing to an existing asset
    - Update a project YAML in `content/projects/` to include an `image` field referencing a file in `public/assets/`
    - _Requirements: 18.3_

  - [x] 1.6 Write property test for agent loader required field validation
    - **Property 7: Agent loader rejects data missing required fields**
    - **Validates: Requirements 17.4**

  - [x] 1.7 Update seed validation tests for new agent fields
    - Update `src/__tests__/content/seed-validation.test.ts` to verify all agent files include the new required fields, no TODO markers, no lorem ipsum, no empty required fields
    - **Unit Test Check 8: No TODO or lorem ipsum in seed content**
    - **Validates: Requirements 18.4, 18.5**

- [x] 2. Add utility functions and sort helper
  - [x] 2.1 Add date and read-time utility functions to `src/lib/format.ts`
    - Implement `formatDateDDMMYYYY(isoDate: string): string` — formats ISO date as DD.MM.YYYY
    - Implement `isRecentPost(isoDate: string, thresholdDays?: number): boolean` — true if date within threshold (default 30) of now
    - Implement `calculateReadTime(content: string, wordsPerMinute?: number): number` — estimated minutes, rounded up, minimum 1
    - Implement `formatAgentIndex(index: number): string` — zero-padded 3-digit string
    - _Requirements: 9.3, 10.4, 11.3_

  - [x] 2.2 Add `sortAgentsByIndex` to `src/lib/content/agent-utils.ts`
    - Returns agents sorted by `index` ascending, does not mutate input
    - _Requirements: 11.4_

  - [x] 2.3 Write property tests for format utility functions
    - **Property 1: Date formatting round trip produces DD.MM.YYYY**
    - **Property 2: Read time is always a positive integer**
    - **Property 3: Agent index formatting produces zero-padded 3-digit string**
    - **Property 12: isRecentPost threshold check**
    - **Validates: Requirements 9.3, 10.4, 11.3**

  - [x] 2.4 Write property test for agent sort order
    - **Property 4: Agent sort by index is monotonically non-decreasing**
    - **Validates: Requirements 11.4**

- [x] 3. Checkpoint — Data model and utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build shared layout components
  - [x] 4.1 Redesign Footer component
    - Rewrite `src/components/Footer.tsx` with copyright ("© Lorenzo Santucci {year}"), LinkedIn and GitHub icon links (new tab, `rel="noopener noreferrer"`, `aria-label` per platform), and "contact me" Button linking to `/contact`
    - Desktop: horizontal layout, items justified between. Mobile (< 768px): stacks vertically, centered
    - Social icon links must have minimum 44×44px touch target
    - Server component
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Redesign Header as client component with menu trigger
    - Rewrite `src/components/Header.tsx` as `'use client'` component
    - Left: "Lorenzo Santucci" link to `/` using `font-pixbob-bold` at logo size. Right: "MENU" button using `font-pixbob-lite` at logo size
    - MENU trigger: `aria-label="Open navigation menu"`, `aria-expanded` reflecting overlay state, keyboard operable (Enter/Space)
    - Manages menu open/close state via `useState`, passes `isOpen`/`onClose`/`triggerRef` to MenuOverlay
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Create MenuOverlay component
    - Create `src/components/MenuOverlay.tsx` as `'use client'` component
    - Props: `isOpen`, `onClose`, `triggerRef`
    - Full-viewport overlay (`fixed inset-0 z-50`, `bg-surface`) with nav links: About, Projects, Agentdex, Blog, Contact — RPG-style with pixel-art typography
    - Close control with `aria-label="Close navigation menu"`, Escape key closes
    - Focus trap: Tab/Shift+Tab cycle within overlay only. On close: focus returns to `triggerRef`
    - ARIA: `role="dialog"`, `aria-modal="true"`, `aria-label="Navigation menu"`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.4 Create Breadcrumb component
    - Create `src/components/Breadcrumb.tsx` — server component
    - Props: `items: Array<{ label: string; href: string }>`, `current: string`
    - Renders inside `<nav aria-label="Breadcrumb">`, items as links with arrow separator, current as non-linked text
    - _Requirements: 10.2, 12.2, 15.2, 23.3_

  - [x] 4.5 Create InnerPageLayout component
    - Create `src/components/InnerPageLayout.tsx` — server component
    - Props: `title`, `ctaHeadline`, `ctaBody`, `crossLinkSections`, `children`
    - Renders: Header → `<h1>` (page title, `page-title` token) → `{children}` (constrained to `max-w-content-max`, centered) → CTABanner (linking to `/contact`) → CrossLinks
    - All vertical sections separated by `section-gap` token
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 4.6 Modify root layout
    - In `src/app/layout.tsx`: remove Header import and rendering, remove `max-w-4xl` constraint from `<main>`, update title template separator from ` — ` to ` | `, keep SkipToContent + Footer + font loading + `<main id="main-content">`
    - _Requirements: 1.1, 2.6, 22.2_

- [x] 5. Build page-level components
  - [x] 5.1 Create LandingMenu component
    - Create `src/components/LandingMenu.tsx` — server component
    - `<nav>` with `<ul>`: "New Game" (disabled, `aria-disabled="true"`, `tabIndex={-1}`, visually muted), "> About", "> Projects", "> Agentdex", "> Blog" — each with RPGSelector prefix, `font-pixbob-regular`
    - Focus_Treatment on interactive items, keyboard navigable
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 5.2 Create ChatSection component
    - Create `src/components/ChatSection.tsx` — server component
    - Props: `agentName`, `greeting?`
    - Greeting area: displays greeting or default "Hi! I'm {agentName}. Chat coming soon."
    - Input area: styled text input with Border_Convention, placeholder "You:", `font-pixbob-regular`
    - Send button: Button (primary) with `aria-disabled="true"`, `aria-label="Send message — coming soon"`, focusable but non-functional
    - SectionLabel "chat" (accent variant) above section
    - No API calls, no navigation, no functional behavior
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 5.3 Write property test for ChatSection greeting display
    - **Property 5: ChatSection displays greeting or default with agent name**
    - **Validates: Requirements 13.1**

  - [x] 5.4 Create new ProjectCard component (design-system-native)
    - Replace `src/components/ProjectCard.tsx` with new implementation
    - Screenshot area with `border-frame border-black` + Offset_Shadow; placeholder background if no image
    - Tech badges stacked on screenshot area using Badge component
    - Title in `font-pixbob-bold` with ArrowUpRight icon, one-line description
    - Entire card links to `/projects/{slug}`
    - Server component
    - _Requirements: 14.3, 14.4, 14.5_

  - [x] 5.5 Write property test for ProjectCard link
    - **Property 6: Project card links to correct slug path**
    - **Validates: Requirements 14.5**

  - [x] 5.6 Create ProjectMetadataPanel component
    - Create `src/components/ProjectMetadataPanel.tsx` — server component
    - Props: `integrations?`, `stack`, `metrics?`, `liveUrl?`
    - Sections: Integrations (SectionLabel dark), Tech Stack (SectionLabel accent), Stats (SectionLabel dark) — each with RPGSelector prefix items
    - Launch button: Button (primary) linking to live URL, full width. Omitted if no `liveUrl`
    - _Requirements: 15.5, 15.6_

- [x] 6. Checkpoint — Shared and page-level components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Redesign Landing Page
  - [x] 7.1 Rewrite landing page
    - Rewrite `src/app/page.tsx`: no Header, no CTA banner, no cross-links. Footer from root layout.
    - Title: "Lorenzo Santucci" centered, `font-pixbob-bold` at page-title size. Subtitle: "FULL STACK DEVELOPER & AI ENGINEER" centered, `font-pixbob-lite`
    - Two-column layout (desktop ≥ 768px): TottiSprite left, LandingMenu right. Mobile: stacks vertically (title → subtitle → TottiSprite → LandingMenu, scrollable)
    - Desktop (≥ 1024px): fills viewport height (`min-h-screen`)
    - Static TottiSprite fallback (PixelImage of front-facing frame) until Polish task implements animation
    - Metadata: `title` is "Lorenzo Santucci" (no suffix — uses `title.default`), static description, canonical URL `/`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 22.1, 22.4_

  - [x] 7.2 Update existing landing page tests
    - Update `src/__tests__/pages/home.test.tsx` to match the new landing page structure (no Header, RPG title screen layout, LandingMenu, TottiSprite placeholder)
    - Grep `src/__tests__/` for any other references to the old landing page structure
    - _Requirements: 24.4_

- [x] 8. Redesign inner pages — content-loaded pages
  - [x] 8.1 Rewrite About page
    - Rewrite `src/app/about/page.tsx` using InnerPageLayout
    - Two-column layout (desktop ≥ 1024px): left = prose via Prose component, right = agentdex-style profile sidebar (character sprite with Pixel_Rendering, role, bestFor list, mission box, toneOfVoice StatBars, contact CTA)
    - Sidebar data from `getAgentBySlug('lorenzo-santucci')`. Fallback: sidebar renders without agent data if null
    - Mobile (< 1024px): stacks vertically — prose above, sidebar below
    - Content from Page entity slug `about`. Fallback title: "About"
    - CTA: "Have a project in mind?" / "Let's talk about how to turn it into something clear, useful and well built."
    - Cross-links: Blog + Projects
    - Metadata: `generateMetadata` with title "About", description from page entity, canonical URL
    - _Requirements: 1.1, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 22.2, 22.3, 22.4_

  - [x] 8.2 Rewrite Contact page
    - Rewrite `src/app/contact/page.tsx` using InnerPageLayout
    - Content from Page entity slug `contact`. Fallback title: "Contact"
    - Contact methods: email link, LinkedIn link (`https://linkedin.com/in/lorenzosantucci`), GitHub link (`https://github.com/lollo-santucci`). All external links: `target="_blank" rel="noopener noreferrer"`
    - Minimum 44×44px touch targets on mobile
    - CTA + cross-links (Blog + Projects)
    - Metadata: title "Contact", description from page entity, canonical URL
    - _Requirements: 1.1, 16.1, 16.2, 16.3, 16.4, 16.5, 22.2, 22.3, 22.4_

- [x] 9. Redesign inner pages — collection indexes
  - [x] 9.1 Rewrite Blog index page
    - Rewrite `src/app/blog/page.tsx` using InnerPageLayout
    - All posts inside CollectionContainer. Each post as CollectionRow: formatted date (DD.MM.YYYY) muted, RPGSelector prefix, title, optional "New" Badge (accent, within 30 days via `isRecentPost`), "Read" Button (secondary, linking to `/blog/{slug}`)
    - Posts sorted date-descending (existing `compareBlogPosts`). Empty state message if no posts
    - CTA: "Read something interesting?" / "Let's discuss it!". Cross-links: Agentdex + Projects
    - Metadata: title "Blog", static description, canonical URL
    - _Requirements: 1.1, 9.1, 9.2, 9.3, 9.4, 9.5, 22.2, 22.4_

  - [x] 9.2 Rewrite Agentdex index page
    - Rewrite `src/app/agentdex/page.tsx` using InnerPageLayout
    - All agents inside CollectionContainer. Each agent as CollectionRow: pixel portrait (PixelImage, front-facing frame), index number as 3 digits (muted, via `formatAgentIndex`), RPGSelector prefix, agent name, optional Badge for status, "Meet" Button (secondary, linking to `/agentdex/{slug}`)
    - Agents sorted by `index` ascending via `sortAgentsByIndex`. Empty state message if no agents
    - CTA: "Want to build an Agent?" / "Hire me!". Cross-links: Blog + Projects
    - Metadata: title "Agentdex", static description, canonical URL
    - _Requirements: 1.1, 11.1, 11.2, 11.3, 11.4, 11.5, 22.2, 22.4_

  - [x] 9.3 Rewrite Projects index page
    - Rewrite `src/app/projects/page.tsx` using InnerPageLayout
    - Two-column grid on desktop (≥ 768px), single column on mobile. Each project via new ProjectCard component
    - Empty state message if no projects
    - CTA: "Have a project in mind?" / "Let's talk about how to turn it into something clear, useful and well built.". Cross-links: Agentdex + Blog
    - Metadata: title "Projects", static description, canonical URL
    - _Requirements: 1.1, 14.1, 14.2, 14.6, 14.7, 22.2, 22.4_

- [x] 10. Redesign inner pages — entity detail pages
  - [x] 10.1 Rewrite Blog post detail page
    - Rewrite `src/app/blog/[slug]/page.tsx` using InnerPageLayout
    - Breadcrumb: "Blog" → post title. Title in page-title size
    - Metadata row: formatted date (DD.MM.YYYY), estimated read time (via `calculateReadTime`), category/tag badges
    - Body via Prose component, max width ~720px
    - `generateStaticParams` for all known slugs. `notFound()` for unknown slugs
    - `generateMetadata`: title from post title, description from `post.excerpt`, canonical URL
    - CTA + cross-links (Agentdex + Projects)
    - _Requirements: 1.1, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 22.2, 22.3, 22.4, 22.5_

  - [x] 10.2 Rewrite Agent profile page
    - Rewrite `src/app/agentdex/[slug]/page.tsx` using InnerPageLayout
    - Breadcrumb: "Agentdex" → agent name. Agent name in page-title size, index number adjacent (muted/reduced opacity)
    - Two-column (desktop ≥ 1024px): left = large character sprite (PixelImage, Pixel_Rendering), right = metadata sections (Role, Best for, Mission box, Tone of Voice StatBars)
    - Below two columns: ChatSection
    - Mobile (< 1024px): sprite above, metadata below
    - `generateStaticParams` + `notFound()` for unknown slugs
    - `generateMetadata`: title from agent name, description from `role` + `mission`, canonical URL
    - CTA: "Want to build an Agent?" / "Hire me!". Cross-links: Blog + Projects
    - _Requirements: 1.1, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 22.2, 22.3, 22.4, 22.5_

  - [x] 10.3 Rewrite Project detail page
    - Rewrite `src/app/projects/[slug]/page.tsx` using InnerPageLayout
    - Breadcrumb: "Projects" → project title
    - Hero area: screenshot with Border_Convention frame, project title in page-title size, tech badges
    - Two-column (desktop ≥ 1024px): left = prose via Prose, right = ProjectMetadataPanel
    - Mobile (< 1024px): prose above, metadata below
    - `generateStaticParams` + `notFound()` for unknown slugs
    - `generateMetadata`: title from project title, description from `project.description`, canonical URL
    - CTA + cross-links (Agentdex + Blog)
    - _Requirements: 1.1, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 22.2, 22.3, 22.4, 22.5_

- [x] 11. Checkpoint — All pages redesigned
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Deprecate old components and update tests
  - [x] 12.1 Delete deprecated component files
    - Delete: `src/components/AgentCard.tsx`, `src/components/BlogPostCard.tsx`, `src/components/StatusBadge.tsx`, `src/components/HeaderNav.tsx`, `src/components/ChatPlaceholder.tsx`
    - Note: `src/components/ProjectCard.tsx` was replaced in-place in task 5.4, not deleted
    - Verify files are actually removed from disk after deletion
    - _Requirements: 19.1_

  - [x] 12.2 Delete or update test files for deprecated components
    - Delete: `src/__tests__/components/AgentCard.test.tsx`, `src/__tests__/components/BlogPostCard.test.tsx`, `src/__tests__/components/StatusBadge.test.tsx`, `src/__tests__/components/HeaderNav.test.tsx`, `src/__tests__/components/ChatPlaceholder.test.tsx`
    - Update `src/__tests__/components/ProjectCard.test.tsx` to test the new design-system-native ProjectCard
    - Grep `src/__tests__/` for any remaining imports of deprecated components and fix them
    - _Requirements: 19.3, 24.4_

  - [x] 12.3 Update all existing page tests for redesigned pages
    - Update tests in `src/__tests__/pages/` and `src/__tests__/app/` to match the new page structures
    - Update `src/__tests__/components/Header.test.tsx` for the redesigned Header (client component with MENU trigger)
    - Update `src/__tests__/components/Footer.test.tsx` for the redesigned Footer
    - Update `src/__tests__/app/layout.test.tsx` for root layout changes (no Header, updated title template)
    - Grep for "Office" and old navigation labels across all test files to catch stale references
    - _Requirements: 19.2, 24.4_

- [x] 13. Accessibility and responsive verification tests
  - [x] 13.1 Write unit tests for semantic landmarks and alt text
    - Verify all pages use semantic landmark elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`)
    - Verify breadcrumb `<nav>` elements have `aria-label="Breadcrumb"`
    - **Unit Test Check 10: All rendered images have non-empty alt text**
    - **Validates: Requirements 23.1, 23.2, 23.3, 23.4**

  - [x] 13.2 Write unit test for no hardcoded pixel values in page components
    - **Unit Test Check 9: No hardcoded pixel values in page components**
    - Scan `src/app/**/*.tsx` for hardcoded pixel patterns in className strings, with permitted exceptions (xl typography, SVG dimensions, PixelImage computed dimensions)
    - **Validates: Requirements 21.6**

- [x] 14. Checkpoint — Deprecation and test updates complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Polish — Totti sprite animation (R6)
  - [x] 15.1 Implement TottiSprite with animation state machine
    - Create `src/components/TottiSprite.tsx` as `'use client'` component
    - Three spritesheets: `BROWN_DOG_SITTING.png`, `BROWN_DOG_PLAYFUL.png`, `BROWN_DOG_SLEEPING.png` — CSS `background-position` sprite animation with `@keyframes` + `steps()`
    - State machine: sitting (default, tail wagging loop) → barking (random 8–15s interval, returns to sitting on complete) → sleeping (after 10s inactivity, returns to sitting on user interaction)
    - `prefers-reduced-motion: reduce` → static front-facing frame
    - Update landing page to use animated TottiSprite instead of static fallback
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 23.5_

  - [x] 15.2 Write property test for Totti state machine transitions
    - **Property 11: Totti state machine transitions**
    - Extract state machine logic as a pure function for testability
    - **Validates: Requirements 6.2**

- [x] 16. Polish — Micro-interactions (R20)
  - [x] 16.1 Add hover and focus transitions
    - Button: CSS state change on hover (background/border/color shift), ≤200ms
    - CollectionRow: CSS state change on hover, ≤200ms
    - Arrow icon links: arrow translates slightly upper-right on hover, ≤200ms
    - All transitions: `prefers-reduced-motion: reduce` → instant state changes (no animation)
    - Apply via Tailwind `transition` utilities and `motion-reduce:` variant
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 17. Final checkpoint — Build integrity
  - Verify `pnpm build` compiles without errors
  - Verify all TypeScript interfaces have proper props typing
  - Verify no dead imports or unused files from deprecated components remain
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 24.1, 24.2, 24.3, 24.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Tasks 15 and 16 are Polish tier (R6, R20) — the site is shippable without them
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Checkpoints ensure incremental validation at logical breakpoints
- When deleting files, verify removal from disk (learning log: subagent file deletion not verified)
- When updating tests, grep `src/__tests__/` for all references to changed components/labels (learning log: navigation rename missed test files)
- Component tests use `// @vitest-environment jsdom` per-file directive
- Async server component tests: call function, await result, then render (learning log)
- fast-check v4: generate date strings from integer components, not `fc.date()` (learning log)
