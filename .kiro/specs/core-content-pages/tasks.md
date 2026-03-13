# Implementation Plan: Core Content Pages

## Overview

Replace Spec 5 route stubs with full content-driven pages. Create shared presentational components (ProjectCard, BlogPostCard, StatusBadge, MdxContent), a date formatting utility, seed content files, and wire everything together across 7 routes. All pages are React Server Components reading from content loaders.

## Tasks

- [x] 1. Create shared utilities and presentational components
  - [x] 1.1 Create `src/lib/format.ts` with `formatDate` utility
    - Export `formatDate(isoDate: string): string` using `Intl.DateTimeFormat` with `en-US` locale and `{ year: 'numeric', month: 'long', day: 'numeric' }` options
    - Input: ISO date string (YYYY-MM-DD). Output: e.g., "July 1, 2025"
    - _Requirements: 5.5, 6.2_

  - [x] 1.2 Write property test for `formatDate` (P1)
    - **Property 1: Date formatting produces en-US long format**
    - **Validates: Requirements 5.5, 6.2**
    - Test file: `src/__tests__/lib/format.test.ts`
    - Generate random ISO dates from integer components: `fc.tuple(fc.integer({min:2000,max:2030}), fc.integer({min:1,max:12}), fc.integer({min:1,max:28}))` — do NOT use `fc.date()` (fast-check v4 gotcha)
    - Verify output matches `new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(year, month-1, day))`

  - [x] 1.3 Create `src/components/StatusBadge.tsx`
    - Accept `status: 'completed' | 'in-progress' | 'ongoing'` prop
    - Render visually distinct label per status: "Completed" (green-tinted), "In Progress" (amber-tinted), "Ongoing" (blue-tinted)
    - React Server Component — no `'use client'`
    - _Requirements: 8.3_

  - [x] 1.4 Write unit tests for StatusBadge
    - Test file: `src/__tests__/components/StatusBadge.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Parameterized test for all 3 status values — verify label text and visual distinction (CSS classes)
    - _Requirements: 8.3_

  - [x] 1.5 Create `src/components/MdxContent.tsx`
    - Accept `children` prop (JSX element from `renderMDX`)
    - Wrap in `<div className="prose">` (Tailwind typography)
    - React Server Component — no `'use client'`
    - _Requirements: 8.4, 11.1, 11.2_

  - [x] 1.6 Write property test for MdxContent (P4)
    - **Property 4: MdxContent wrapper applies prose typography classes**
    - **Validates: Requirements 8.4, 11.1**
    - Test file: `src/__tests__/components/MdxContent.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - For any React children, verify the outermost rendered element has the `prose` class

  - [x] 1.7 Create `src/components/ProjectCard.tsx`
    - Accept a `Project` entity as prop
    - Render: title as link to `/projects/{slug}`, description, stack tags as inline labels, status via `StatusBadge`
    - Import `StatusBadge` from `@/components/StatusBadge`
    - React Server Component — no `'use client'`
    - _Requirements: 8.1, 3.2, 3.3, 1.9_

  - [x] 1.8 Write property test for ProjectCard (P2)
    - **Property 2: ProjectCard renders all required fields and correct link**
    - **Validates: Requirements 8.1, 3.2, 3.3, 1.9**
    - Test file: `src/__tests__/components/ProjectCard.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Generate random valid Project entities with all required fields + random optional fields
    - Verify title, description, each stack tag, status label, and link href `/projects/{slug}` are rendered

  - [x] 1.9 Create `src/components/BlogPostCard.tsx`
    - Accept a `BlogPost` entity as prop
    - Render: title as link to `/blog/{slug}`, excerpt, formatted date via `formatDate`, tags as inline labels
    - Import `formatDate` from `@/lib/format`
    - React Server Component — no `'use client'`
    - _Requirements: 8.2, 5.2, 5.3, 1.10_

  - [x] 1.10 Write property test for BlogPostCard (P3)
    - **Property 3: BlogPostCard renders all required fields and correct link**
    - **Validates: Requirements 8.2, 5.2, 5.3, 1.10**
    - Test file: `src/__tests__/components/BlogPostCard.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Generate random valid BlogPost entities with all required fields + random optional fields
    - Verify title, excerpt, formatted date, each tag, and link href `/blog/{slug}` are rendered

- [x] 2. Checkpoint — Shared components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create seed content files
  - [x] 3.1 Create `content/pages/home.mdx`
    - Page entity with slug `home`, title, description, and value proposition content
    - Realistic text for a freelance full-stack developer and ML/AI engineer — no lorem ipsum, no TODO
    - Must pass content loader validation (required fields present, slug matches filename)
    - _Requirements: 9.3, 9.6, 9.7, 10.1_

  - [x] 3.2 Create `content/pages/contact.mdx`
    - Page entity with slug `contact`, title, description, and MDX content including email, GitHub link, LinkedIn link
    - Contact info delivered via MDX content, not hardcoded in the component
    - Must pass content loader validation
    - _Requirements: 9.5, 7.3, 9.6, 9.7_

  - [x] 3.3 Create `content/blog/ai-engineering-lessons.mdx`
    - BlogPost entity with all required fields (title, slug, excerpt, content, date, categories, tags)
    - Date must be distinct from existing `hello-world.mdx` and the other new post
    - Realistic content — no placeholder text
    - Must pass content loader validation
    - _Requirements: 9.2, 9.6, 9.7_

  - [x] 3.4 Create `content/blog/type-safe-content.mdx`
    - BlogPost entity with all required fields, distinct date from other posts
    - Realistic content — no placeholder text
    - Must pass content loader validation
    - _Requirements: 9.2, 9.6, 9.7_

  - [x] 3.5 Create `content/projects/ml-pipeline-toolkit.mdx`
    - Project entity with all required fields (title, slug, description, content, stack, categories, status, highlight)
    - `highlight: false` (the existing `personal-website.mdx` has `highlight: true`, satisfying R9.1)
    - Must pass content loader validation
    - _Requirements: 9.1, 9.6, 9.7_

- [x] 4. Implement route pages — Home and About
  - [x] 4.1 Implement home page (`src/app/page.tsx`)
    - Replace stub with async server component calling `getPageBySlug('home')`, `getProjects()`, `getBlogPosts()`
    - Sections in order: value proposition (conditional on home entity), featured projects (filtered by `highlight === true`, conditional), latest posts (first 3, conditional), CTA link to `/contact`, play mode teaser (structural, non-functional)
    - `generateMetadata` reads home page entity — title from entity if available, description from entity `description` field if present, otherwise site defaults
    - Omit sections gracefully when data is absent — no empty containers
    - _Requirements: 1.1–1.10, 10.1–10.4, 12.1–12.4_

  - [x] 4.2 Write unit tests for home page (P5, P6, P7, CTA, teaser)
    - Test file: `src/__tests__/pages/home.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders and `renderMDX`
    - Async RSC pattern: `const el = await HomePage(); render(el);`
    - **P5 (unit)**: test with 0 highlighted, 1 highlighted, all highlighted — verify featured section contains exactly highlighted projects
    - **P6 (PBT — Property 6: Home page latest section contains at most 3 posts)**: generate random post lists of varying length, verify slice logic. **Validates: Requirements 1.5, 1.6**
    - **P7 (unit)**: test with home entity present vs absent — verify title display / omission
    - CTA: verify link to `/contact` exists
    - Teaser: verify structural element exists, no interactive elements (no `<a>`, no `<button>`)
    - _Requirements: 1.1–1.10_

  - [x] 4.3 Implement about page (`src/app/about/page.tsx`)
    - Extend existing stub: call `getPageBySlug('about')`, render title as `<h1>` (fallback: "About"), render MDX content via `MdxContent`
    - `generateMetadata` reads entity — title from entity (fallback: "About"), description from entity `description` if present
    - If no entity, show fallback title with empty content area
    - _Requirements: 2.1–2.4, 12.1, 12.2, 12.4_

  - [x] 4.4 Write unit tests for about page (P7, fallback, metadata)
    - Test file: `src/__tests__/pages/about.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders and `renderMDX`
    - **P7 (unit)**: render with entity → verify entity title displayed; render without entity → verify "About" fallback
    - Metadata: verify `generateMetadata` returns correct title and description
    - _Requirements: 2.1–2.4_

- [x] 5. Implement route pages — Projects
  - [x] 5.1 Implement projects index (`src/app/projects/page.tsx`)
    - Extend existing stub: call `getProjects()`, render heading "Projects", render `ProjectCard` for each project
    - Empty state message when no projects exist
    - Projects display in loader order (order asc, title asc)
    - Static metadata: title "Projects"
    - _Requirements: 3.1–3.5, 12.1, 12.4_

  - [x] 5.2 Write unit tests for projects index (P10, empty state)
    - Test file: `src/__tests__/pages/projects-index.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders
    - **P10 (unit)**: render with known ordered list, verify DOM order matches loader order
    - Empty state: render with empty array, verify message displayed
    - _Requirements: 3.4, 3.5_

  - [x] 5.3 Implement project detail page (`src/app/projects/[slug]/page.tsx`)
    - Extend existing stub: call `getProjectBySlug(slug)`, render title as `<h1>`, `StatusBadge`, stack tags, MDX content via `MdxContent`
    - Conditional links section: only if `links` has at least one defined value (live, github, demo)
    - Conditional image: only if `image` field present
    - Back navigation link to `/projects`
    - `generateStaticParams` from `getProjects()` mapped to slug array (already exists from Spec 5)
    - `generateMetadata` with project title and description
    - `notFound()` if no project matches slug
    - _Requirements: 4.1–4.9, 12.1–12.3_

  - [x] 5.4 Write tests for project detail (P8, P9, P11, P13, 404, back nav)
    - Test file: `src/__tests__/pages/project-detail.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders and `renderMDX`
    - Async RSC pattern with params: `{ params: Promise.resolve({ slug: 'x' }) }`
    - **P8 (PBT — Property 8: Dynamic route metadata includes entity title and summary)**: generate random Project entities, verify `generateMetadata` returns project title and description. **Validates: Requirements 4.8, 12.1, 12.3**
    - **P9 (unit)**: mock `getProjects()`, verify `generateStaticParams` returns all slugs
    - **P11 (PBT — Property 11: Project detail conditionally displays optional fields)**: generate random projects with/without links/image, verify conditional rendering. **Validates: Requirements 4.4, 4.5**
    - **P13 (unit)**: mock `renderMDX` to throw, verify page still renders title (test try/catch feasibility first)
    - 404: mock `getProjectBySlug` returning null, verify `notFound()` called
    - Back nav: verify link to `/projects` exists
    - _Requirements: 4.1–4.9_

- [x] 6. Checkpoint — Home, About, Projects
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement route pages — Blog
  - [x] 7.1 Implement blog index (`src/app/blog/page.tsx`)
    - Extend existing stub: call `getBlogPosts()`, render heading "Blog", render `BlogPostCard` for each post
    - Empty state message when no posts exist
    - Posts display in loader order (date desc, title asc)
    - Static metadata: title "Blog"
    - _Requirements: 5.1–5.6, 12.1, 12.4_

  - [x] 7.2 Write unit tests for blog index (P10, empty state)
    - Test file: `src/__tests__/pages/blog-index.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders
    - **P10 (unit)**: render with known ordered list, verify DOM order matches loader order
    - Empty state: render with empty array, verify message displayed
    - _Requirements: 5.4, 5.6_

  - [x] 7.3 Implement blog post detail page (`src/app/blog/[slug]/page.tsx`)
    - Extend existing stub: call `getBlogPostBySlug(slug)`, render title as `<h1>`, formatted date via `formatDate`, tags, MDX content via `MdxContent`
    - Conditional image: only if `image` field present
    - Back navigation link to `/blog`
    - `generateStaticParams` from `getBlogPosts()` mapped to slug array (already exists from Spec 5)
    - `generateMetadata` with post title and excerpt as description
    - `notFound()` if no post matches slug
    - _Requirements: 6.1–6.8, 12.1–12.3_

  - [x] 7.4 Write tests for blog post detail (P8, P9, P12, P13, 404, back nav)
    - Test file: `src/__tests__/pages/blog-detail.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders and `renderMDX`
    - Async RSC pattern with params: `{ params: Promise.resolve({ slug: 'x' }) }`
    - **P8 (PBT — Property 8: Dynamic route metadata includes entity title and summary)**: generate random BlogPost entities, verify `generateMetadata` returns post title and excerpt. **Validates: Requirements 6.7, 12.1, 12.3**
    - **P9 (unit)**: mock `getBlogPosts()`, verify `generateStaticParams` returns all slugs
    - **P12 (PBT — Property 12: Blog post detail conditionally displays optional image)**: generate random posts with/without image, verify conditional rendering. **Validates: Requirements 6.4**
    - **P13 (unit)**: mock `renderMDX` to throw, verify page still renders title (test try/catch feasibility first)
    - 404: mock `getBlogPostBySlug` returning null, verify `notFound()` called
    - Back nav: verify link to `/blog` exists
    - _Requirements: 6.1–6.8_

- [x] 8. Implement contact page
  - [x] 8.1 Implement contact page (`src/app/contact/page.tsx`)
    - Extend existing stub: call `getPageBySlug('contact')`, render title as `<h1>` (fallback: "Contact"), render MDX content via `MdxContent`
    - `generateMetadata` reads entity — title from entity (fallback: "Contact"), description from entity `description` if present
    - If no entity, show fallback title with empty content area
    - _Requirements: 7.1–7.5, 12.1, 12.2, 12.4_

  - [x] 8.2 Write unit tests for contact page (P7, fallback, metadata, seed content)
    - Test file: `src/__tests__/pages/contact.test.tsx`
    - Use `// @vitest-environment jsdom` directive
    - Mock content loaders and `renderMDX`
    - **P7 (unit)**: render with entity → verify entity title displayed; render without entity → verify "Contact" fallback
    - Metadata: verify `generateMetadata` returns correct title and description
    - Seed content: verify contact MDX contains email and profile links (can be a separate test or part of seed validation)
    - _Requirements: 7.1–7.5_

- [x] 9. Seed content validation and final audit
  - [x] 9.1 Write seed content validation tests (P14, P15)
    - Test file: `src/__tests__/content/seed-validation.test.ts`
    - Node environment (no jsdom needed)
    - **P14 (integration — Property 14: Seed content passes loader validation)**: call real content loaders against actual seed files, verify no validation errors. **Validates: Requirements 9.7**
    - **P15 (integration — Property 15: Seed content contains no placeholder text)**: scan seed file contents for known placeholder patterns ("lorem ipsum", "TODO", "placeholder", "TBD"). **Validates: Requirements 9.6**
    - Verify minimum counts: ≥2 projects, ≥3 blog posts, ≥1 highlighted project, home page entity, about page entity, contact page entity
    - Verify all blog post dates are distinct
    - _Requirements: 9.1–9.7_

- [x] 10. Final checkpoint — All pages and tests
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All components are React Server Components — no `'use client'` directives
- `renderMDX` is mocked in component tests; real MDX compilation tested only in seed validation
- ISO date generators use integer components (year/month/day), not `fc.date()` — per fast-check v4 gotcha
- PBT with String.replace: use `split('%s')` + concatenation, not `replace('%s', title)` — per learning log
- Async RSC test pattern: `const el = await Component(); render(el);`
- Existing `generateStaticParams`, `generateMetadata`, and `notFound()` patterns from Spec 5 are extended, not rewritten
- Shared components (ProjectCard, BlogPostCard) are used on both home page and index pages — R8.5 enforced by architecture
