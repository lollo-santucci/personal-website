# Requirements Document

## Introduction

This spec implements the core content pages for the classic view. Spec 5 (site shell) established the layout, navigation, and route stubs. This spec replaces those stubs with full page implementations that read all content from the content system (Spec 4). It also adds shared presentational components and additional seed content so every page has meaningful data to display.

After this spec, the classic view is a functional professional website: home page with featured work and latest writing, about page with MDX prose, projects and blog with index/detail pairs, and a contact page. All content comes from the content loaders — no hardcoded text beyond structural UI labels and fallback titles.

## Glossary

- **Content_Loader**: The typed async functions from `src/lib/content/` that return validated, branded entities from the content directory.
- **Content_System**: The content directory (`content/`) plus the Content_Loader layer. Single source of truth for all displayable text.
- **Highlighted_Project**: A Project entity where `highlight: true` in frontmatter, intended for featuring on the home page.
- **Seed_Content**: Content files shipped with the codebase to populate pages during development and at launch.
- **Structural_Label**: A UI string that describes page structure (e.g., "Featured Projects", "Back to projects") as opposed to content text. Structural labels are the only acceptable hardcoded strings in page components.
- **Fallback_Title**: A hardcoded page title (e.g., "About", "Contact") displayed when the Content_System returns no entity for that page's slug. Fallback titles are an explicit exception to the no-hardcoded-text rule.
- **Static_Generation**: Build-time rendering via `generateStaticParams` that pre-renders all known dynamic route paths.
- **Home_Page_Entity**: The Page entity with slug `home`, used as the source for the home page value proposition section. If absent, the home page omits the value proposition — no crash.

## Dependencies

- Content loaders (Spec 4): `getProjects`, `getProjectBySlug`, `getBlogPosts`, `getBlogPostBySlug`, `getPages`, `getPageBySlug` must be implemented and functional.
- MDX rendering (Spec 4): A function that accepts a raw MDX string and returns a JSX element must be available.
- Site shell (Spec 5): Root layout, Header, Footer, route file structure must exist.
- Entity types (Spec 2): `Project`, `BlogPost`, `Page` interfaces define the fields available for display.
- Project fields guaranteed required by Spec 2: `title`, `slug`, `description`, `content`, `stack`, `categories`, `status`, `highlight`. Optional: `links`, `image`, `order`.
- BlogPost fields guaranteed required by Spec 2: `title`, `slug`, `excerpt`, `content`, `date`, `categories`, `tags`. Optional: `image`, `relatedProjects`, `relatedAgents`.
- Page fields guaranteed required by Spec 2: `title`, `slug`, `content`. Optional: `description`.
- `getProjects()` returns projects sorted by `order` ascending (undefined last), then title ascending. `getBlogPosts()` returns posts sorted by date descending, then title ascending. These sort orders are guaranteed by the content loader (Spec 4).
- Tailwind typography plugin must be available for prose styling on MDX content. If not already installed, this spec adds it (install command and registration in CSS required — see learning log).

## Requirements

### Requirement 1: Home Page Content

**User Story:** As a visitor, I want the home page to show who Lorenzo is, what he's built, and what he writes about, so that I can quickly assess relevance and navigate deeper.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/`, THE home page SHALL display a value proposition section containing a heading and introductory text loaded from the Home_Page_Entity (Page with slug `home`).
2. IF the Content_System returns no Page for slug `home`, THEN THE home page SHALL omit the value proposition section entirely — no error, no crash, no placeholder.
3. WHEN at least one Highlighted_Project exists, THE home page SHALL display a "Featured Projects" section listing each Highlighted_Project as a project card.
4. WHEN no Highlighted_Project exists, THE home page SHALL omit the "Featured Projects" section entirely — no empty container, no placeholder.
5. THE home page SHALL display a "Latest Posts" section containing the 3 most recent blog posts (by date descending) as blog post cards.
6. WHEN fewer than 3 blog posts exist, THE home page SHALL display all available posts. WHEN no blog posts exist, THE home page SHALL omit the "Latest Posts" section entirely.
7. THE home page SHALL display a call-to-action element linking to `/contact`.
8. THE home page SHALL display a play mode teaser section — a visual placeholder indicating the play view exists. The teaser is a Structural_Label (pure layout, not content-system-driven). It SHALL be non-functional (no navigation, no interaction).
9. EACH project card on the home page SHALL link to `/projects/{slug}` for the corresponding project.
10. EACH blog post card on the home page SHALL link to `/blog/{slug}` for the corresponding post.

### Requirement 2: About Page Content

**User Story:** As a visitor, I want to read about Lorenzo's background and skills, so that I can evaluate fit for collaboration or hiring.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/about`, THE about page SHALL display the page title from the `about` Page entity's `title` field.
2. THE about page SHALL render the `about` Page entity's MDX content with typography styling (prose-level formatting for headings, paragraphs, lists, code, links).
3. IF the Content_System returns no Page for slug `about`, THEN THE about page SHALL display the Fallback_Title "About" with an empty content area — no error, no crash.
4. THE about page SHALL generate metadata with the page title and description (from the Page entity's `description` field if present, otherwise the site default).

### Requirement 3: Projects Index

**User Story:** As a visitor, I want to browse all projects in a scannable format, so that I can find work relevant to my interests.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/projects`, THE projects index SHALL display all projects from the Content_System as project cards.
2. EACH project card SHALL display the project's title, description, stack tags, and status as a visually distinct label.
3. EACH project card SHALL link to `/projects/{slug}` for the corresponding project.
4. THE projects index SHALL display projects in the order returned by the Content_Loader (order ascending, then title ascending).
5. WHEN no projects exist, THE projects index SHALL display an empty state message — no crash, no broken layout.

### Requirement 4: Project Detail Page

**User Story:** As a visitor, I want to read the full details of a project, so that I can understand the scope, technology, and outcomes.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/projects/{slug}`, THE project detail page SHALL display the matching project's title as a heading.
2. THE project detail page SHALL render the project's MDX content with typography styling.
3. THE project detail page SHALL display the project's stack tags and status as a visually distinct label.
4. IF the project has a `links` field with at least one defined value (live, GitHub, or demo), THEN THE project detail page SHALL display those links. IF the project has no `links` field or all link values are undefined, THEN THE page SHALL omit the links section — no empty container.
5. IF the project has an `image` field, THE project detail page SHALL display it. IF absent, the image area SHALL be omitted — no broken image, no placeholder.
6. THE project detail page SHALL display a navigation element linking back to `/projects`.
7. ALL known project slugs SHALL be pre-rendered at build time via Static_Generation.
8. THE project detail page SHALL generate metadata with the project's title as page title and `description` field as meta description.
9. IF no project matches the given slug, THEN THE page SHALL return a 404 response.

### Requirement 5: Blog Index

**User Story:** As a visitor, I want to browse all blog posts sorted by recency, so that I can find the latest writing.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog`, THE blog index SHALL display all blog posts from the Content_System as blog post cards.
2. EACH blog post card SHALL display the post's title, excerpt, formatted date, and tags.
3. EACH blog post card SHALL link to `/blog/{slug}` for the corresponding post.
4. THE blog index SHALL display posts in the order returned by the Content_Loader (date descending, then title ascending).
5. THE date displayed on each blog post card SHALL be formatted in a human-readable long format (e.g., "July 1, 2025"), not raw ISO format.
6. WHEN no blog posts exist, THE blog index SHALL display an empty state message — no crash, no broken layout.

### Requirement 6: Blog Post Detail Page

**User Story:** As a visitor, I want to read a full blog post with proper typography, so that long-form content is comfortable to consume.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog/{slug}`, THE blog post detail page SHALL display the matching post's title as a heading.
2. THE blog post detail page SHALL display the post's date in the same human-readable format as the blog index and the post's tags.
3. THE blog post detail page SHALL render the post's MDX content with typography styling.
4. IF the post has an `image` field, THE blog post detail page SHALL display it. IF absent, the image area SHALL be omitted.
5. THE blog post detail page SHALL display a navigation element linking back to `/blog`.
6. ALL known blog post slugs SHALL be pre-rendered at build time via Static_Generation.
7. THE blog post detail page SHALL generate metadata with the post's title as page title and `excerpt` field as meta description.
8. IF no blog post matches the given slug, THEN THE page SHALL return a 404 response.

### Requirement 7: Contact Page Content

**User Story:** As a potential client, I want to find Lorenzo's contact information and professional links, so that I can reach out about work.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/contact`, THE contact page SHALL display the page title from the `contact` Page entity's `title` field.
2. THE contact page SHALL render the `contact` Page entity's MDX content with typography styling.
3. THE contact page content SHALL include contact information (email) and professional profile links (GitHub, LinkedIn) — delivered via the MDX content, not hardcoded in the component.
4. IF the Content_System returns no Page for slug `contact`, THEN THE contact page SHALL display the Fallback_Title "Contact" with an empty content area — no error, no crash.
5. THE contact page SHALL generate metadata with the page title and description (from the Page entity's `description` field if present, otherwise the site default).

### Requirement 8: Shared Presentational Components

**User Story:** As a developer, I want reusable components for displaying projects and blog posts, so that the home page and index pages share consistent presentation without duplication.

#### Acceptance Criteria

1. A reusable project card component SHALL accept a Project entity and render its title, description, stack tags, and status as a visually distinct label. It SHALL render a link to the project's detail page.
2. A reusable blog post card component SHALL accept a BlogPost entity and render its title, excerpt, formatted date, and tags. It SHALL render a link to the post's detail page.
3. A reusable status display component SHALL accept a project status value (`completed`, `in-progress`, `ongoing`) and render a visually distinct label for each status.
4. A reusable MDX content wrapper SHALL apply Tailwind typography classes so that headings, paragraphs, lists, code blocks, and links are styled consistently across all MDX-rendered pages.
5. THE project card and blog post card components SHALL be used on both the home page and their respective index pages — no duplicate card markup across pages.

### Requirement 9: Seed Content

**User Story:** As a developer, I want enough seed content to exercise all page behaviors, so that every page has meaningful data during development and at launch.

#### Acceptance Criteria

1. THE Content_System SHALL contain at least 2 Project entries with valid frontmatter (all required fields populated). At least one project SHALL have `highlight: true`.
2. THE Content_System SHALL contain at least 3 Blog post entries with valid frontmatter (all required fields populated) and distinct dates. (3 is the minimum needed to fully exercise the "Latest 3 Posts" behavior on the home page.)
3. THE Content_System SHALL contain a Page entry for slug `home` with content suitable for the home page value proposition section.
4. THE Content_System SHALL contain a Page entry for slug `about` with content suitable for the about page. (NOTE: `content/pages/about.mdx` already exists from Spec 3 — this AC ensures it remains valid and exercised by the seed content audit.)
5. THE Content_System SHALL contain a Page entry for slug `contact` with content that includes contact information and professional links.
6. ALL Seed_Content SHALL contain realistic, non-placeholder text appropriate for a freelance full-stack developer and ML/AI engineer. No lorem ipsum, no "TODO" markers.
7. ALL Seed_Content SHALL pass content loader validation without errors (required fields present, slug matches filename, correct types).

### Requirement 10: No Hardcoded Content Text

**User Story:** As a developer, I want all displayable content to come from the content system, so that adding or changing content never requires modifying page components.

#### Acceptance Criteria

1. THE home page value proposition text SHALL be loaded from the Content_System (Home_Page_Entity) — not defined as a string literal in the component.
2. ALL project data displayed on the home page and projects pages SHALL come from Content_Loader calls — no inline project definitions.
3. ALL blog post data displayed on the home page and blog pages SHALL come from Content_Loader calls — no inline post definitions.
4. THE only acceptable hardcoded strings in page components SHALL be: Structural_Labels (section headings like "Featured Projects", navigation text like "Back to projects", empty state messages, and the play mode teaser text) and Fallback_Titles (e.g., "About", "Contact" displayed when the Content_System returns no entity for that slug).

### Requirement 11: MDX Typography and Rendering Resilience

**User Story:** As a visitor reading long-form content, I want proper typographic styling on MDX-rendered pages, so that prose, code, lists, and headings are readable and visually consistent.

#### Acceptance Criteria

1. The MDX content wrapper SHALL apply Tailwind typography classes that style: headings (h1–h4), paragraphs, unordered and ordered lists, inline code, code blocks, blockquotes, and links.
2. THE typography styling SHALL be consistent across all pages that render MDX content (about, contact, project detail, blog post detail).
3. A Tailwind typography plugin SHALL be available for prose styling. (Dependency: if not already installed, the design must include the explicit installation plan per learning log.)
4. IF MDX rendering fails on a content entry that passed loader validation (e.g., invalid JSX in MDX body), THE page SHALL NOT produce an unhandled exception or blank page. The entity's title and metadata SHALL remain visible.

### Requirement 12: Metadata Defaults

**User Story:** As a visitor (or search engine), I want every page to have a meaningful title and description, so that the site is discoverable and shareable.

#### Acceptance Criteria

1. EVERY page SHALL have a `<title>` that includes the page-specific title and the site name. The exact format is a design decision.
2. EVERY page SHALL have a meta description. For content-driven pages, the description SHALL come from the entity's natural summary field (`description` for Pages and Projects, `excerpt` for Blog posts). WHEN no entity-level description is available, a site-wide default description SHALL be used.
3. Dynamic routes (project detail, blog post detail) SHALL generate metadata per-entity so that each URL has a unique title and description.
4. Index and static pages (home, about, contact, projects index, blog index) SHALL have stable metadata. For pages backed by a content entity (home, about, contact), metadata SHALL derive from the entity's fields when available, falling back to application-level defaults. For pure index pages (projects, blog), application-level defaults are sufficient.
