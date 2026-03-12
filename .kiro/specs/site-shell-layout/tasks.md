# Implementation Plan: Site Shell & Layout

## Overview

Build the site shell (root layout, header, footer, navigation), all classic view routes, base styling, and responsive behavior. Tasks are ordered: dependencies → shared modules → shell components → root layout → static pages → dynamic routes → tests. All content is fetched via Spec 4 loaders. Tailwind v4 CSS-based config with `@tailwindcss/typography` for prose styling.

## Tasks

- [x] 1. Install dependencies and update base styles
  - [x] 1.1 Install `@tailwindcss/typography` and update `globals.css`
    - Run `pnpm add -D @tailwindcss/typography`
    - Add `@plugin "@tailwindcss/typography";` to `src/styles/globals.css` (Tailwind v4 CSS-based plugin loading)
    - Add base typography styles: system font stack, body text 16px–18px, line-height 1.5–1.75, dark text on light background, single light palette
    - Add visible focus indicator styles for all interactive elements (`:focus-visible` outline)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 11.3_

- [x] 2. Create shared navigation module
  - [x] 2.1 Create `src/lib/navigation.ts`
    - Export `NavLink` interface with `href` and `label` fields
    - Export `NAV_LINKS` constant array with all 6 navigation links: Home `/`, About `/about`, Projects `/projects`, Blog `/blog`, Office `/office`, Contact `/contact`
    - Export `isActiveLink(href, pathname)` function: home `/` matches only exactly; other links match exactly or as prefix (`/projects/foo` activates `/projects`)
    - _Requirements: 2.2, 3.3, 3.4, 3.5_

- [x] 3. Create shell components
  - [x] 3.1 Create `src/components/SkipToContent.tsx`
    - Server component, renders `<a href="#main-content">Skip to content</a>`
    - Styled `sr-only` by default, visible on `:focus` with high-contrast background
    - Must be the first focusable element in the DOM
    - _Requirements: 11.2_

  - [x] 3.2 Create `src/components/Footer.tsx`
    - Server component with `<footer>` landmark element
    - Copyright line: `© {new Date().getFullYear()} Lorenzo Santucci`
    - GitHub and LinkedIn links with placeholder hrefs, `target="_blank" rel="noopener noreferrer"`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.3 Create `src/components/HeaderNav.tsx`
    - Client component (`'use client'`), imports `NAV_LINKS` and `isActiveLink` from `@/lib/navigation`
    - Active link detection via `usePathname()` + `isActiveLink()`, active link gets `aria-current="page"` + bold + underline
    - Mobile hamburger menu: `<button>` with `aria-label="Toggle navigation"` and `aria-expanded={isOpen}`, `useState<boolean>` for toggle
    - Desktop nav visible `md:` and above (`hidden md:flex`), hamburger toggle visible below `md:` (`md:hidden`)
    - Mobile menu panel: absolutely positioned below header, full-width
    - Play Mode Placeholder: `<span aria-disabled="true">Play Mode</span>` with `opacity-40 cursor-default`, not a link, not focusable
    - `<nav aria-label="Main navigation">` wrapping the navigation links
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 3.1, 3.2, 11.4_

  - [x] 3.4 Create `src/components/Header.tsx`
    - Server component with `<header>` landmark element
    - Logo: `<a href="/">Lorenzo Santucci</a>` styled as site title text
    - Renders `<HeaderNav />` client component
    - _Requirements: 2.1, 11.1_

- [x] 4. Update root layout
  - [x] 4.1 Modify `src/app/layout.tsx`
    - Import and render `SkipToContent`, `Header`, `Footer`
    - Structure: `<html lang="en">` → `<body>` → `SkipToContent` → `Header` → `<main id="main-content">` → `{children}` → `Footer`
    - Sticky footer pattern: body/main flex column, main `flex-grow`, full viewport height
    - Main content area: max-width between 768px–1024px, centered, responsive padding (reduced below `md:`)
    - Configure full metadata object: `metadataBase` from `NEXT_PUBLIC_SITE_URL` env var (fallback `http://localhost:3000`), title template `%s — Lorenzo Santucci` with default `Lorenzo Santucci`, default description, Open Graph config (`og:type="website"`, `og:site_name`), canonical URL
    - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4, 11.1, 12.1, 12.2, 12.3, 12.4_

- [x] 5. Checkpoint — Shell structure
  - Ensure all tests pass, ask the user if questions arise.
  - At this point: the site shell renders on every page with header, navigation, footer, skip-to-content, responsive layout, and correct metadata.

- [x] 6. Implement static pages
  - [x] 6.1 Modify `src/app/page.tsx` — Home page
    - Remove existing `<main>` wrapper (now in layout)
    - Hero section: `<h1>Lorenzo Santucci</h1>` + intro paragraph ("Full-stack developer and ML/AI engineer")
    - Quick links section: responsive grid (1 col mobile, 3 cols `md:`) with cards linking to `/projects`, `/blog`, `/office`
    - Each card: `<a>` with border, padding, hover state, section name + one-line description
    - No content loader call — hardcoded content
    - Export static `metadata` (home page uses default title, no template)
    - _Requirements: 5.1, 12.1_

  - [x] 6.2 Create `src/app/about/page.tsx`
    - Async server component, calls `getPageBySlug('about')`
    - If page exists: render `page.title` as `<h1>` + `renderMDX(page.content)` in `<div className="prose">`
    - If page is null: render "About" heading with empty content area (no crash)
    - Export static `metadata` with `title: 'About'`, description from page frontmatter if available
    - _Requirements: 5.2, 5.4, 12.1, 12.2_

  - [x] 6.3 Create `src/app/contact/page.tsx`
    - Same pattern as About, using `getPageBySlug('contact')`
    - Falls back to "Contact" heading if no content
    - Export static `metadata` with `title: 'Contact'`
    - _Requirements: 5.3, 5.4, 12.1, 12.2_

- [x] 7. Implement project routes
  - [x] 7.1 Create `src/app/projects/page.tsx` — Projects index
    - Async server component, calls `getProjects()`
    - Render list: each project shows `title` (as link to `/projects/{slug}`) and `description`
    - Export static `metadata` with `title: 'Projects'`
    - _Requirements: 6.1, 6.2, 12.1_

  - [x] 7.2 Create `src/app/projects/[slug]/page.tsx` — Project detail
    - Async server component, receives slug from route params (`params: Promise<{ slug: string }>`)
    - Calls `getProjectBySlug(slug)` — if null, call `notFound()` from `next/navigation`
    - Renders project `title` as `<h1>` + `renderMDX(project.content)` in `<div className="prose">`
    - Export `generateStaticParams` using `getProjects()` to return all known slugs
    - Export `generateMetadata` for per-page title, description, and `alternates.canonical`
    - _Requirements: 6.3, 6.4, 6.5, 12.1, 12.2, 12.4_

- [x] 8. Implement blog routes
  - [x] 8.1 Create `src/app/blog/page.tsx` — Blog index
    - Async server component, calls `getBlogPosts()`
    - Render list: each post shows `title` (as link to `/blog/{slug}`), formatted `date`, and `excerpt`
    - Export static `metadata` with `title: 'Blog'`
    - _Requirements: 7.1, 7.2, 12.1_

  - [x] 8.2 Create `src/app/blog/[slug]/page.tsx` — Blog detail
    - Async server component, receives slug from route params (`params: Promise<{ slug: string }>`)
    - Calls `getBlogPostBySlug(slug)` — if null, call `notFound()`
    - Renders post `title`, formatted `date`, and `renderMDX(post.content)` in `<div className="prose">`
    - Export `generateStaticParams` using `getBlogPosts()` to return all known slugs
    - Export `generateMetadata` for per-page title, description, and `alternates.canonical`
    - _Requirements: 7.3, 7.4, 7.5, 12.1, 12.2, 12.4_

- [x] 9. Implement office routes
  - [x] 9.1 Create `src/app/office/page.tsx` — Office index (agentdex)
    - Async server component, calls `getAgents()`
    - Render list: each agent shows `name` (as link to `/office/{slug}`) and `role`
    - Export static `metadata` with `title: 'Office'`
    - _Requirements: 8.1, 8.2, 12.1_

  - [x] 9.2 Create `src/app/office/[slug]/page.tsx` — Agent profile
    - Async server component, receives slug from route params (`params: Promise<{ slug: string }>`)
    - Calls `getAgentBySlug(slug)` — if null, call `notFound()`
    - Renders agent `name`, `role`, `personality` paragraph, and `capabilities` as `<ul>` list
    - No `renderMDX` call — Agent has no `content` field, structured data only
    - Export `generateStaticParams` using `getAgents()` to return all known slugs
    - Export `generateMetadata` for per-page title and description (using `role` as description)
    - _Requirements: 8.3, 8.4, 8.5, 12.1, 12.2, 12.4_

- [x] 10. Checkpoint — All routes implemented
  - Ensure all tests pass, ask the user if questions arise.
  - At this point: all classic view routes render real content, dynamic routes have `generateStaticParams`, unknown slugs return 404, metadata is correct per route.

- [x] 11. Unit tests for shell components and navigation
  - [x] 11.1 Write unit tests for `isActiveLink` and `NAV_LINKS` — `src/__tests__/lib/navigation.test.ts`
    - Test `NAV_LINKS` has exactly 6 entries with correct hrefs and labels
    - Test `isActiveLink`: exact match for `/`, prefix match for other links, no false positives
    - _Requirements: 2.2, 3.3, 3.4, 3.5_

  - [x] 11.2 Write unit tests for `SkipToContent` — `src/__tests__/components/SkipToContent.test.tsx`
    - Verify link exists targeting `#main-content`
    - Verify it is the first focusable element
    - _Requirements: 11.2_

  - [x] 11.3 Write unit tests for `Header` — `src/__tests__/components/Header.test.tsx`
    - Verify `<header>` landmark element
    - Verify logo link to `/` with text "Lorenzo Santucci"
    - _Requirements: 2.1, 11.1_

  - [x] 11.4 Write unit tests for `HeaderNav` — `src/__tests__/components/HeaderNav.test.tsx`
    - Verify all 6 nav links rendered
    - Verify Play Mode placeholder is inert `<span>` with `aria-disabled="true"`
    - Verify `<nav>` element with `aria-label="Main navigation"`
    - Verify hamburger toggle: `aria-label="Toggle navigation"`, `aria-expanded` state, click toggles visibility
    - _Requirements: 2.2, 2.3, 2.6, 2.7, 2.8, 2.9, 11.4_

  - [x] 11.5 Write unit tests for `Footer` — `src/__tests__/components/Footer.test.tsx`
    - Verify `<footer>` landmark element
    - Verify copyright text with current year and "Lorenzo Santucci"
    - Verify GitHub and LinkedIn links
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 11.6 Write unit tests for root layout metadata — `src/__tests__/app/layout.test.tsx`
    - Verify metadata object: title template, default description, og:type, og:site_name, metadataBase
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 11.7 Write unit tests for home page — `src/__tests__/app/page.test.tsx`
    - Verify heading "Lorenzo Santucci", intro text, 3 section link cards (Projects, Blog, Office)
    - _Requirements: 5.1_

- [x] 12. Unit tests for page routes
  - [x] 12.1 Write unit tests for about and contact pages — `src/__tests__/app/about/page.test.tsx`, `src/__tests__/app/contact/page.test.tsx`
    - Mock `getPageBySlug` — test content rendering and null fallback (title shown, no crash)
    - Mock `renderMDX` to return simple `<div>`
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 12.2 Write unit tests for projects routes — `src/__tests__/app/projects/page.test.tsx`, `src/__tests__/app/projects/[slug]/page.test.tsx`
    - Index: mock `getProjects()`, verify each project's title and description rendered
    - Detail: mock `getProjectBySlug()`, verify title + content rendering; mock null → verify `notFound()` called
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 12.3 Write unit tests for blog routes — `src/__tests__/app/blog/page.test.tsx`, `src/__tests__/app/blog/[slug]/page.test.tsx`
    - Index: mock `getBlogPosts()`, verify each post's title, date, and excerpt rendered
    - Detail: mock `getBlogPostBySlug()`, verify title + date + content rendering; mock null → verify `notFound()` called
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 12.4 Write unit tests for office routes — `src/__tests__/app/office/page.test.tsx`, `src/__tests__/app/office/[slug]/page.test.tsx`
    - Index: mock `getAgents()`, verify each agent's name and role rendered
    - Detail: mock `getAgentBySlug()`, verify name, role, personality, capabilities rendered; mock null → verify `notFound()` called
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 13. Property-based tests
  - [x] 13.1 Write property test for active link detection — `src/__tests__/lib/navigation.test.ts`
    - **Property 1: Active link detection correctness**
    - Generate hrefs via `fc.oneof(fc.constant('/'), fc.stringMatching(/^\/[a-z]+$/))` and pathnames as exact, prefix, or unrelated strings
    - Verify `isActiveLink` returns `true` iff: (a) href is `/` and pathname is `/`, or (b) href is not `/` and pathname equals href or starts with `href + '/'`
    - Minimum 100 iterations
    - **Validates: Requirements 3.3, 3.4, 3.5**

  - [x] 13.2 Write property test for exactly one active link — `src/__tests__/components/HeaderNav.test.tsx`
    - **Property 2: Exactly one active link per pathname**
    - Generate pathnames from NAV_LINKS hrefs + sub-paths; count elements with `aria-current="page"`
    - Verify exactly 1 active link for matching pathnames, 0 for non-matching
    - Minimum 100 iterations
    - **Validates: Requirements 3.1, 3.2**

  - [x] 13.3 Write property test for generateStaticParams coverage — `src/__tests__/app/projects/[slug]/page.test.tsx`, `src/__tests__/app/blog/[slug]/page.test.tsx`, `src/__tests__/app/office/[slug]/page.test.tsx`
    - **Property 4: generateStaticParams covers all known slugs**
    - Generate arrays of content entities with `fc.array(fc.record({slug: ...}))`, mock list loaders
    - Verify `generateStaticParams()` returns params for every slug and no extras
    - Minimum 100 iterations
    - **Validates: Requirements 6.4, 7.4, 8.4**

  - [x] 13.4 Write property test for title template — `src/__tests__/app/layout.test.tsx`
    - **Property 6: Title template produces correct format**
    - Generate page title strings via `fc.string({minLength: 1})`
    - Verify resolved title matches `"{title} — Lorenzo Santucci"` pattern; home page resolves to `"Lorenzo Santucci"`
    - Minimum 100 iterations
    - **Validates: Requirements 12.1**

  - [x] 13.5 Write property test for description fallback — `src/__tests__/app/layout.test.tsx`
    - **Property 7: Meta description fallback**
    - Generate `fc.option(fc.string())` for description field
    - Verify: if present, use content description; if absent, use default `"Freelance full-stack developer and ML/AI engineer"`
    - Minimum 100 iterations
    - **Validates: Requirements 12.2**

- [x] 14. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 12 requirements are covered by implementation tasks.
  - Verify all 7 correctness properties have corresponding PBT tasks.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Content loaders are mocked in component tests — we test rendering logic, not file I/O
- `renderMDX` is mocked to return a simple `<div>` in tests
- Tailwind v4 uses CSS-based config — no `tailwind.config.ts`
- Next.js 16 route params are `Promise<{ slug: string }>` — must be awaited
- Property tests use `fast-check` with minimum 100 iterations
