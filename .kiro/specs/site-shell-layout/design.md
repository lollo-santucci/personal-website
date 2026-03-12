# Design Document: Site Shell & Layout

## Overview

This design implements the site shell for Lorenzo Santucci's personal website — the root layout, global navigation, route structure, base styling, and responsive behavior for all classic view pages. The shell wraps every page in a consistent Header → Main → Footer structure, provides client-side active link detection and mobile hamburger menu, and renders real content from the content system (Spec 4).

The architecture splits into:
- **Server components** for layout, header shell, footer, and all page routes (content fetching at build time)
- **Client components** only where browser APIs are required: mobile menu toggle (`useState`) and active link detection (`usePathname`)
- **Tailwind v4 CSS-based config** for all styling — no `tailwind.config.ts`

All dynamic routes use `generateStaticParams` for build-time pre-rendering and `notFound()` for missing slugs.

## File Map

All files created or modified by this spec:

```
src/
├── app/
│   ├── layout.tsx                    # Modify — root layout with metadata, shell structure
│   ├── page.tsx                      # Modify — home page with intro + section links
│   ├── about/page.tsx                # Create — about page (content loader)
│   ├── contact/page.tsx              # Create — contact page (content loader)
│   ├── projects/
│   │   ├── page.tsx                  # Create — projects index
│   │   └── [slug]/page.tsx           # Create — project detail + generateStaticParams
│   ├── blog/
│   │   ├── page.tsx                  # Create — blog index
│   │   └── [slug]/page.tsx           # Create — blog detail + generateStaticParams
│   └── office/
│       ├── page.tsx                  # Create — office index (agentdex)
│       └── [slug]/page.tsx           # Create — agent profile + generateStaticParams
├── components/
│   ├── SkipToContent.tsx             # Create — skip-to-content link
│   ├── Header.tsx                    # Create — header shell (server)
│   ├── HeaderNav.tsx                 # Create — navigation + mobile menu (client)
│   └── Footer.tsx                    # Create — footer (server)
├── lib/
│   └── navigation.ts                # Create — NAV_LINKS constant + isActiveLink()
└── styles/
    └── globals.css                   # Modify — base typography, font stack, prose plugin
```

Other files:
- `package.json` — Add `@tailwindcss/typography` as a dev dependency

## Spec Context

### Dependencies
- **Spec 2** (Content Entity Types): defines `Page`, `Project`, `BlogPost`, `Agent`, `Service` interfaces
- **Spec 3** (Content Directory Templates): provides seed content files used by routes
- **Spec 4** (Content Loader): provides all `getXxx()` / `getXxxBySlug()` loaders and `renderMDX()`

### Steering Files Referenced
- `.kiro/steering/structure.md` — directory layout, import patterns (`@/` alias)
- `.kiro/steering/product.md` — classic view definition, standalone principle
- `.kiro/steering/brand.md` — tone, visual identity, single palette
- `.kiro/steering/glossary.md` — terminology (agentdex, office, classic view)
- `.kiro/steering/tech.md` — stack choices (Next.js App Router, Tailwind v4, pnpm)
- `.kiro/steering/learning.md` — Tailwind v4 CSS-based config, Next.js 16 params as Promise

## Architecture

```
┌─────────────────────────────────────────────────┐
│  RootLayout (server)                            │
│  ┌─────────────────────────────────────────────┐│
│  │  SkipToContent (server)                     ││
│  │  Header (server)                            ││
│  │  ┌─────────────────────────────────────────┐││
│  │  │  HeaderNav (client)                     │││
│  │  │  - imports NAV_LINKS, isActiveLink      │││
│  │  │    from @/lib/navigation                │││
│  │  │  - usePathname() for active links       │││
│  │  │  - useState() for mobile menu toggle    │││
│  │  └─────────────────────────────────────────┘││
│  │  <main id="main-content">                   ││
│  │    {children} ← page routes                 ││
│  │  </main>                                    ││
│  │  Footer (server)                            ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### Component Rendering Strategy

| Component | Rendering | Reason |
|---|---|---|
| `RootLayout` | Server | Static HTML shell, metadata, global styles |
| `SkipToContent` | Server | Static anchor, no interactivity |
| `Header` | Server | Renders logo link, delegates nav to client child |
| `HeaderNav` | Client (`'use client'`) | Needs `usePathname()` + `useState()` |
| `Footer` | Server | Static content, copyright year resolved at build time |
| All page routes | Server (async) | Content fetched via async loaders |

### Data Flow

```
Content files (MDX/YAML)
    ↓ content loaders (async)
Page components (server)
    ↓ props / direct render
    ↓ renderMDX() for prose content
React tree → HTML
```

No Zustand involvement in this spec — the shell is purely server-rendered with a thin client layer for navigation interactivity. Zustand enters with the play view (future spec).

## Shared Navigation Module (`src/lib/navigation.ts`)

Navigation constants and logic live in a shared module, imported by both `HeaderNav` and tests.

```typescript
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/office', label: 'Office' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Determine if a nav link is active for the given pathname.
 * - Home (`/`) matches only exactly.
 * - Other links match exactly or as a prefix (e.g., `/projects/foo` activates `/projects`).
 * - Exact match takes priority over prefix match.
 */
export function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
```

This is a pure function with no side effects — ideal for property-based testing. Tests import directly from `@/lib/navigation`.

## MDX Rendering Contract

All pages that display prose content use the existing `renderMDX` function from `@/lib/content/mdx`:

```typescript
// src/lib/content/mdx.ts (already exists — Spec 4)
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { JSX } from 'react';

export async function renderMDX(source: string): Promise<JSX.Element>;
```

- **Input**: raw MDX string from a content entity's `content` field
- **Output**: `JSX.Element` (React Server Component element)
- **Custom components**: none in this spec — deferred to a future UI/design system spec
- **Prose styling**: the rendered output is wrapped in a `<div className="prose">` container by the calling page component. The `@tailwindcss/typography` plugin provides the prose styles. This plugin is not yet installed — this spec adds it:
  - Install: `pnpm add -D @tailwindcss/typography`
  - Register in `src/styles/globals.css`: `@plugin "@tailwindcss/typography";` (Tailwind v4 CSS-based plugin loading)
- **Usage pattern in page components**:

```tsx
const rendered = await renderMDX(page.content);
return (
  <article>
    <h1>{page.title}</h1>
    <div className="prose">{rendered}</div>
  </article>
);
```

Agent profile pages do NOT call `renderMDX` — the Agent type has no `content` field. Agent data is rendered directly as structured text.

## Components and Interfaces

### SkipToContent (`src/components/SkipToContent.tsx`)

Server component. First focusable element in the DOM.

- Target: `<main id="main-content">`
- Styling: `sr-only` by default, visible on `:focus` with high-contrast background
- No props needed

### Header (`src/components/Header.tsx`)

Server component shell. Renders the `<header>` landmark and logo link, then delegates navigation to `HeaderNav`.

Structure:
- `<header>` landmark element
- Logo: `<a href="/">Lorenzo Santucci</a>` — styled as site title, not an image
- `<HeaderNav />` client component for navigation links + mobile menu

### HeaderNav (`src/components/HeaderNav.tsx`)

Client component (`'use client'`). Imports `NAV_LINKS` and `isActiveLink` from `@/lib/navigation`.

Handles:
1. Active link detection via `usePathname()` + `isActiveLink()`
2. Mobile menu open/close via `useState<boolean>`
3. Keyboard operability for hamburger toggle

Active link rendering:
- Active link gets `aria-current="page"` and distinct visual style (font-weight bold + underline)

Mobile menu:
- Toggle button with `aria-label="Toggle navigation"` and `aria-expanded={isOpen}`
- Hidden on `md:` breakpoint and above (`hidden md:flex` for desktop nav, `md:hidden` for toggle)
- Menu panel: absolutely positioned below header, full-width on mobile
- Keyboard: button is natively focusable, Enter/Space toggle built-in for `<button>`

Play Mode Placeholder:
- `<span aria-disabled="true">Play Mode</span>`
- Styled with reduced opacity (`opacity-40`) and `cursor-default`
- Not a link, not focusable in tab order (no `tabIndex`)

### Footer (`src/components/Footer.tsx`)

Server component.

Structure:
- `<footer>` landmark element
- Copyright: `© {new Date().getFullYear()} Lorenzo Santucci`
- Links: GitHub and LinkedIn with placeholder hrefs (`https://github.com/lorenzosantucci`, `https://linkedin.com/in/lorenzosantucci`)
- Links open in new tab (`target="_blank" rel="noopener noreferrer"`)

**Copyright year**: resolved at build time via `new Date().getFullYear()`. On a statically exported site, this means the year is frozen until the next build. This is acceptable — the site rebuilds on every content change via Vercel, so the year stays current in practice. No client-side dynamic year needed.

### Page Components

All page components are async server components that fetch content via the content loaders.

#### Home (`src/app/page.tsx`)

Semantic structure:

```tsx
<section> {/* Hero */}
  <h1>Lorenzo Santucci</h1>
  <p>Brief introduction text — full-stack developer and ML/AI engineer.</p>
</section>
<section> {/* Quick links */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <a href="/projects">Projects — card with brief description</a>
    <a href="/blog">Blog — card with brief description</a>
    <a href="/office">Office — card with brief description</a>
  </div>
</section>
```

- Hero section: `<h1>` + intro paragraph, centered, max-width constrained
- Quick links section: 3 cards in a responsive grid — single column on mobile, 3 columns on `md:` and above
- Each card: `<a>` element styled as a card with Tailwind (border, padding, hover state), containing section name + one-line description
- No content loader call — home page content is hardcoded in the component (no `content/pages/home.mdx` exists)

#### About (`src/app/about/page.tsx`)

```tsx
export default async function AboutPage() {
  const page = await getPageBySlug('about');
  const title = page?.title ?? 'About';
  // If page exists: render title + renderMDX(page.content) in prose wrapper
  // If page is null: render "About" heading with empty content area
}
```

Exports `metadata` with `title: 'About'` and `description` from page frontmatter if available.

#### Contact (`src/app/contact/page.tsx`)

Same pattern as About, using `getPageBySlug('contact')`. Falls back to "Contact" heading if no content. Note: `content/pages/contact.mdx` does not exist yet — the fallback will be exercised until it's created.

#### Projects Index (`src/app/projects/page.tsx`)

```tsx
export default async function ProjectsPage() {
  const projects = await getProjects();
  // Render list: each project shows title + description, linked to /projects/{slug}
}
```

Each project rendered as a list item with title (as link) and description paragraph.

#### Project Detail (`src/app/projects/[slug]/page.tsx`)

- Receives the slug from route params
- Calls `getProjectBySlug(slug)` — if null, triggers 404 via `notFound()`
- Renders project title + MDX content in prose wrapper
- Exports `generateStaticParams` using `getProjects()` to return all known slugs
- Exports `generateMetadata` for per-page title and description

#### Blog Index (`src/app/blog/page.tsx`)

Lists all posts with title, date (formatted), and excerpt. Each linked to `/blog/{slug}`.

#### Blog Detail (`src/app/blog/[slug]/page.tsx`)

Same pattern as Project Detail. Uses `getBlogPosts` / `getBlogPostBySlug`. Renders title, formatted date, and MDX content in prose wrapper.

#### Office Index (`src/app/office/page.tsx`)

Lists all agents with name and role. Each linked to `/office/{slug}`.

#### Office Detail (`src/app/office/[slug]/page.tsx`)

Uses `getAgents` / `getAgentBySlug`. Renders name, role, personality paragraph, and capabilities as a `<ul>` list. No `renderMDX` call — Agent has no `content` field.

## Metadata Configuration

Root layout metadata (Next.js `Metadata` object):

```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const defaultDescription = 'Freelance full-stack developer and ML/AI engineer';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Lorenzo Santucci',
    template: '%s — Lorenzo Santucci',
  },
  description: defaultDescription,
  openGraph: {
    type: 'website',
    siteName: 'Lorenzo Santucci',
    title: { default: 'Lorenzo Santucci', template: '%s — Lorenzo Santucci' },
    description: defaultDescription,
  },
  alternates: { canonical: '/' },
};
```

Child pages use the following metadata policy:
- **Static routes** (home, about, contact, index pages): export a static `metadata` object with `title` and optionally `description`
- **Dynamic routes** (`[slug]` pages): export an async `generateMetadata()` function that reads the entity and returns `title`, `description`, and `alternates.canonical`

The `template` pattern ensures consistent `"Page — Lorenzo Santucci"` format.

### Content Types Consumed

This spec consumes these content types (all defined in Spec 2, loaded via Spec 4):

| Type | Loader | Fields Used | MDX Rendering |
|---|---|---|---|
| `Page` | `getPageBySlug(slug)` | `title`, `content`, `description?` | Yes — `renderMDX(page.content)` |
| `Project` | `getProjects()`, `getProjectBySlug(slug)` | `title`, `slug`, `description`, `content` | Yes — `renderMDX(project.content)` |
| `BlogPost` | `getBlogPosts()`, `getBlogPostBySlug(slug)` | `title`, `slug`, `excerpt`, `date`, `content` | Yes — `renderMDX(post.content)` |
| `Agent` | `getAgents()`, `getAgentBySlug(slug)` | `name`, `slug`, `role`, `personality`, `capabilities` | No — structured data only |


## Correctness Properties

### Property 1: Active link detection correctness

*For any* navigation link href and any URL pathname, `isActiveLink(href, pathname)` should return `true` if and only if: (a) `href === '/'` and `pathname === '/'`, or (b) `href !== '/'` and (`pathname === href` or `pathname` starts with `href + '/'`). In all other cases it should return `false`.

**Validates: Requirements 3.3, 3.4, 3.5**

### Property 2: Exactly one active link per pathname

*For any* pathname that matches at least one NAV_LINKS entry, exactly one link in the rendered navigation should have `aria-current="page"`. *For any* pathname that matches no NAV_LINKS entry, zero links should have `aria-current="page"`.

**Validates: Requirements 3.1, 3.2**

### Property 3: Index pages display all required fields

*For any* non-empty array of projects, the projects index should render every project's `title` and `description`. *For any* non-empty array of blog posts, the blog index should render every post's `title`, `date`, and `excerpt`. *For any* non-empty array of agents, the office index should render every agent's `name` and `role`.

**Validates: Requirements 6.2, 7.2, 8.2**

### Property 4: generateStaticParams covers all known slugs

*For any* content type with a dynamic route (projects, blog, office), `generateStaticParams()` should return a params object for every slug returned by the corresponding list loader, and no additional slugs.

**Validates: Requirements 6.4, 7.4, 8.4**

### Property 5: Unknown slug produces 404

*For any* slug not present in the content system, the detail page should call `notFound()`.

**Validates: Requirements 6.5, 7.5, 8.5**

### Property 6: Title template produces correct format

*For any* page that exports a title string via metadata, the resolved document title should match the pattern `"{pageTitle} — Lorenzo Santucci"`. The home page should resolve to `"Lorenzo Santucci"`.

**Validates: Requirements 12.1**

### Property 7: Meta description fallback

*For any* page, the resolved meta description should equal the content's `description` field if present, or the site-level default `"Freelance full-stack developer and ML/AI engineer"` otherwise.

**Validates: Requirements 12.2**

### Structural Accessibility Invariants

These are verified via unit tests (not PBT — they are structural checks on a fixed DOM, not randomized input):

1. **Skip-to-content link**: The first focusable element in the DOM is an `<a>` targeting `#main-content`. It is visually hidden by default and visible on keyboard focus.
2. **Semantic landmarks**: The layout contains exactly one `<header>`, one `<main id="main-content">`, and one `<footer>`, in that order.
3. **Nav landmark**: The navigation is wrapped in a `<nav>` element with an accessible label (e.g., `aria-label="Main navigation"`).
4. **Visible focus indicators**: All interactive elements (links, buttons, toggle) have a visible `:focus` or `:focus-visible` style that differs from the default state.
5. **Hamburger toggle accessibility**: The toggle button has `aria-label="Toggle navigation"` and `aria-expanded` reflecting the current menu state.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 2.6, 2.7**


## Error Handling

### Missing Content (Static Pages)

When `getPageBySlug('about')` or `getPageBySlug('contact')` returns `null`, the page renders a heading derived from the route name (e.g., "About", "Contact") with an empty content area. No error page, no crash.

```tsx
const page = await getPageBySlug('about');
const title = page?.title ?? 'About';
// Render title; if page exists, render content; otherwise empty
```

### Missing Content (Dynamic Routes)

When a by-slug loader returns `null`, the page calls `notFound()` from `next/navigation`, which triggers Next.js's built-in 404 handling.

### Empty Content Lists

When a list loader returns an empty array, the index page renders normally with no list items. No special empty-state UI in this spec.

### Content Loader Errors

Content loaders return `[]` for missing/empty directories and `null` for missing slugs (per Spec 4). They do not throw on missing content. If a loader throws due to a malformed file, the error propagates to Next.js's default error boundary (no custom error boundary in this spec).

### Environment Variable Missing

If `NEXT_PUBLIC_SITE_URL` is not set, `metadataBase` falls back to `http://localhost:3000`. Acceptable for development; production deployments must set the variable.


## Testing Strategy

### Testing Framework

- **Unit/integration tests**: Vitest + React Testing Library (`@testing-library/react`)
- **Property-based tests**: `fast-check` (already in the project)
- **Test location**: `src/__tests__/` mirroring source structure

### Unit Tests

- **Layout structure** (R1.3, R11.1): `<header>`, `<main id="main-content">`, `<footer>` in order
- **Header content** (R2.1, R2.2, R2.3): Logo link, all 6 nav links, play mode placeholder is inert span
- **Hamburger menu** (R2.6, R2.7, R2.8, R2.9): `aria-label`, `aria-expanded` state, click toggles visibility
- **Skip to content** (R11.2): Link exists, targets `#main-content`, first focusable element
- **Nav landmark** (R11.4): `<nav>` with `aria-label`
- **Footer content** (R4.1, R4.2, R4.3): Copyright text with year, links, `<footer>` element
- **Static page fallback** (R5.4): Loader returns null → page renders title without crash
- **404 on unknown slug** (R6.5, R7.5, R8.5): Loader returns null → `notFound()` called
- **Home page content** (R5.1): Heading, intro text, section link cards in grid
- **Metadata** (R12.3): Root layout metadata includes og:type, og:site_name, title template

### Property-Based Tests

| Property | Generator Strategy |
|---|---|
| P1: Active link detection | `fc.oneof(fc.constant('/'), fc.stringMatching(/^\/[a-z]+$/))` for hrefs; pathnames as exact, prefix, or unrelated |
| P2: Exactly one active link | Pathname from NAV_LINKS hrefs + sub-paths; count `aria-current` elements |
| P3: Index page fields | `fc.array(fc.record({...}))` per content type; verify all required fields in render |
| P4: generateStaticParams | `fc.array(fc.record({slug: fc.string()}))` → verify params match slugs exactly |
| P5: Unknown slug → 404 | Generate slugs not in content list → verify `notFound()` called |
| P6: Title template | `fc.string({minLength: 1})` → verify `"{title} — Lorenzo Santucci"` pattern |
| P7: Description fallback | `fc.option(fc.string())` → verify correct resolution |

Minimum 100 iterations per property.

### Test File Organization

```
src/__tests__/
├── lib/
│   └── navigation.test.ts           # PBT: isActiveLink (P1), NAV_LINKS structure
├── components/
│   ├── Header.test.tsx               # Unit: header structure, logo, nav links
│   ├── HeaderNav.test.tsx            # Unit + PBT: active links (P2), mobile menu, aria
│   ├── Footer.test.tsx               # Unit: copyright, links, landmark
│   └── SkipToContent.test.tsx        # Unit: link target, visibility
└── app/
    ├── layout.test.tsx               # Unit: metadata structure (P6, P7)
    ├── page.test.tsx                 # Unit: home page content, grid structure
    ├── about/page.test.tsx           # Unit: content rendering, fallback
    ├── contact/page.test.tsx         # Unit: content rendering, fallback
    ├── projects/
    │   ├── page.test.tsx             # Unit + PBT: index fields (P3)
    │   └── [slug]/page.test.tsx      # Unit + PBT: detail, 404 (P4, P5)
    ├── blog/
    │   ├── page.test.tsx             # Unit + PBT: index fields (P3)
    │   └── [slug]/page.test.tsx      # Unit + PBT: detail, 404 (P4, P5)
    └── office/
        ├── page.test.tsx             # Unit + PBT: index fields (P3)
        └── [slug]/page.test.tsx      # Unit + PBT: detail, 404 (P4, P5)
```

### Key Testing Decisions

1. **`isActiveLink` and `NAV_LINKS` imported from `@/lib/navigation`** — tested independently with fast-check, no DOM needed
2. **Content loaders mocked** in component tests — we test rendering logic, not file I/O
3. **`renderMDX` mocked** to return a simple `<div>` — we verify it's called with correct content, not MDX parsing
4. **Metadata tests** verify the exported metadata objects directly, not rendered `<head>` tags
5. **Minimum 100 iterations** per property test
