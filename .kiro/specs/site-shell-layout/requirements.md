# Requirements Document

## Introduction

This spec defines the site shell and layout for Lorenzo Santucci's personal website. The site shell provides the root layout, global navigation (header and footer), route structure for all classic view pages, base Tailwind styling, and responsive behavior. After this spec, every classic view route is navigable and renders real content from the content system (Spec 4). The play view is not implemented here — a placeholder link signals its existence without creating any dependency.

## Glossary

- **Site_Shell**: The root layout structure comprising Header, main content area, and Footer, rendered on every page.
- **Header**: The top-level navigation component containing the site logo/name, navigation links, and a play mode placeholder.
- **Footer**: The bottom-level component containing copyright and professional links.
- **Navigation**: The set of links in the Header that allow users to move between site sections.
- **Active_Link**: A navigation link whose target matches the current page URL, rendered with a visually distinct style.
- **Hamburger_Menu**: A mobile navigation pattern where links collapse behind a toggle button on small viewports.
- **Content_Loader**: The typed functions that read and return content entities (Pages, Projects, Blog Posts, Agents, Services). Implementation details deferred to design.
- **Dynamic_Route**: A route with a slug parameter that resolves to a specific content entity.
- **Static_Generation**: Build-time rendering that pre-renders all known dynamic route paths.
- **Classic_View**: The professional website presentation layer — pages, navigation, content cards, detail views.
- **Play_Mode_Placeholder**: A visually distinct, inert element in the Header indicating future play view availability.

## Dependencies

- Content system (Spec 4) must be implemented: loaders for Pages, Projects, Blog Posts, Agents are required.
- MDX rendering capability must be available for detail pages.
- Agent content type guarantees `name`, `slug`, `role`, `personality`, `capabilities`, `status` as required fields (validated at load time).

## Requirements

### Requirement 1: Root Layout Structure

**User Story:** As a visitor, I want every page to share a consistent layout with header and footer, so that I can navigate the site predictably.

#### Acceptance Criteria

1. THE Site_Shell SHALL render a document with `lang="en"`.
2. THE Site_Shell SHALL load global styles.
3. THE Site_Shell SHALL render the Header, a main content area, and the Footer in that order on every page.

### Requirement 2: Header with Navigation

**User Story:** As a visitor, I want a header with clear navigation links, so that I can reach any section of the site from any page.

#### Acceptance Criteria

1. THE Header SHALL display the text "Lorenzo Santucci" as a link to the home page (`/`).
2. THE Header SHALL display navigation links to: Home (`/`), About (`/about`), Projects (`/projects`), Blog (`/blog`), Office (`/office`), Contact (`/contact`).
3. THE Header SHALL display a Play_Mode_Placeholder rendered as an inert element (not a navigable link) labeled "Play Mode", visually dimmed relative to active navigation links. Design decides the specific element type.
4. WHEN the viewport width is 768px or greater, THE Header SHALL display all navigation links in a horizontal row.
5. WHEN the viewport width is less than 768px, THE Header SHALL collapse navigation links behind a Hamburger_Menu toggle button.
6. THE Hamburger_Menu toggle button SHALL have an accessible label (e.g., `aria-label="Toggle navigation"`).
7. THE Hamburger_Menu toggle button SHALL communicate its expanded/collapsed state to assistive technologies (e.g., `aria-expanded`).
8. WHEN a visitor activates the Hamburger_Menu toggle, THE Header SHALL reveal the full list of navigation links.
9. WHEN a visitor activates the Hamburger_Menu toggle while the menu is open, THE Header SHALL hide the navigation links.
10. THE Hamburger_Menu SHALL be operable via keyboard (Enter/Space to toggle, Tab to navigate links).

### Requirement 3: Active Link Indication

**User Story:** As a visitor, I want to see which page I am currently on in the navigation, so that I maintain orientation within the site.

#### Acceptance Criteria

1. THE Navigation SHALL render the Active_Link with a visually distinct style (font weight, underline, or color change) compared to inactive links.
2. THE Active_Link SHALL also be indicated to assistive technologies (e.g., `aria-current="page"`).
3. WHEN the current URL path matches a navigation link's href exactly, THE Navigation SHALL mark that link as the Active_Link.
4. WHEN the current URL path starts with a navigation link's href and the href is not `/`, THE Navigation SHALL mark that link as the Active_Link (e.g., `/projects/my-project` activates the Projects link).
5. WHEN both an exact match and a prefix match exist, THE exact match SHALL take priority.

### Requirement 4: Footer

**User Story:** As a visitor, I want a footer with copyright and professional links, so that I can find attribution and external profiles.

#### Acceptance Criteria

1. THE Footer SHALL display a copyright line containing "Lorenzo Santucci" and the current year.
2. THE Footer SHALL display links to professional profiles (GitHub, LinkedIn) — placeholder hrefs are acceptable at this stage.
3. THE Footer SHALL use a `<footer>` landmark element.
4. THE Footer SHALL render on every page below the main content area.

### Requirement 5: Route Structure — Static Pages

**User Story:** As a visitor, I want to access the home, about, and contact pages, so that I can learn about Lorenzo and get in touch.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/`, THE home page SHALL display a heading with "Lorenzo Santucci", a brief introduction text, and navigation cues to key sections (Projects, Blog, Office). Exact layout deferred to design.
2. WHEN a visitor navigates to `/about`, THE about page SHALL display the page title and rendered prose content from the content system.
3. WHEN a visitor navigates to `/contact`, THE contact page SHALL display the page title and rendered prose content from the content system.
4. IF the content system returns no content for a static page slug, THEN THE page SHALL render the page title derived from the route (e.g., "About", "Contact") with an empty content area — no error page, no crash.

### Requirement 6: Route Structure — Projects

**User Story:** As a visitor, I want to browse projects and view individual project details, so that I can evaluate Lorenzo's work.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/projects`, THE page SHALL display a list of all projects from the content system.
2. THE projects index page SHALL display each project's title and description.
3. WHEN a visitor navigates to `/projects/{slug}`, THE page SHALL display the matching project's title and rendered prose content.
4. ALL known project slugs SHALL be pre-rendered at build time via Static_Generation.
5. IF no project matches a given slug, THEN THE page SHALL return a 404 response.

### Requirement 7: Route Structure — Blog

**User Story:** As a visitor, I want to browse blog posts and read individual articles, so that I can learn from Lorenzo's writing.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/blog`, THE page SHALL display a list of all blog posts from the content system.
2. THE blog index page SHALL display each post's title, date, and excerpt.
3. WHEN a visitor navigates to `/blog/{slug}`, THE page SHALL display the matching post's title, date, and rendered prose content.
4. ALL known blog post slugs SHALL be pre-rendered at build time via Static_Generation.
5. IF no blog post matches a given slug, THEN THE page SHALL return a 404 response.

### Requirement 8: Route Structure — Office (Agentdex)

**User Story:** As a visitor, I want to browse the agent directory and view individual agent profiles, so that I can understand Lorenzo's AI capabilities.

#### Acceptance Criteria

1. WHEN a visitor navigates to `/office`, THE page SHALL display a list of all agents from the content system.
2. THE office index page SHALL display each agent's name and role.
3. WHEN a visitor navigates to `/office/{slug}`, THE page SHALL display the matching agent's name, role, personality, and capabilities. (These fields are guaranteed required by the Agent content type — see Dependencies.)
4. ALL known agent slugs SHALL be pre-rendered at build time via Static_Generation.
5. IF no agent matches a given slug, THEN THE page SHALL return a 404 response.

### Requirement 9: Base Styling

**User Story:** As a visitor, I want the site to have clean, readable typography and consistent spacing, so that content is easy to consume.

#### Acceptance Criteria

1. THE site SHALL use a system font stack as the default body font (specific stack deferred to design).
2. THE site SHALL set base prose styles: body text size between 16px–18px, line-height between 1.5–1.75, dark text on a light background.
3. THE site SHALL use a single light color palette with no dark mode variant and no theme toggle.
4. ALL styles applied to content pages SHALL render correctly in production builds — no missing or broken styles due to build-time omissions. (Design ensures the styling toolchain covers all source and content files.)

### Requirement 10: Responsive Layout

**User Story:** As a visitor on any device, I want the site to be usable and readable, so that I have a good experience regardless of screen size.

#### Acceptance Criteria

1. THE Site_Shell SHALL render without horizontal scrolling on viewports from 320px width and above.
2. THE main content area SHALL be constrained to a maximum width (design decides value, between 768px–1024px) and centered on the page.
3. WHEN the viewport width is less than 768px, THE Site_Shell SHALL reduce horizontal padding and adapt layout for single-column reading.
4. THE Header, main content, and Footer SHALL stack vertically and fill the full viewport height (sticky footer pattern).

### Requirement 11: Baseline Accessibility

**User Story:** As a visitor using assistive technology or keyboard navigation, I want the site to use semantic structure and visible focus indicators, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE Site_Shell SHALL use semantic landmark elements: `<header>`, `<main>`, `<footer>`.
2. THE Site_Shell SHALL provide a "Skip to content" link as the first focusable element, targeting the main content area.
3. ALL interactive elements (links, buttons, toggle controls) SHALL have a visible focus indicator when focused via keyboard.
4. THE Navigation SHALL use a `<nav>` element with an accessible label.

### Requirement 12: Page Metadata

**User Story:** As a site owner, I want each page to have appropriate metadata, so that the site is discoverable and shareable.

#### Acceptance Criteria

1. EACH page SHALL have a `<title>` that includes the page name and site name (e.g., "About — Lorenzo Santucci"). The home page title SHALL be "Lorenzo Santucci".
2. EACH page SHALL have a meta description — either from content frontmatter `description` field (if present) or the site-level default description ("Freelance full-stack developer and ML/AI engineer").
3. THE Site_Shell SHALL define a base Open Graph configuration (og:title, og:description, og:type="website", og:site_name="Lorenzo Santucci"). Individual pages MAY override og:title and og:description from their content.
4. THE Site_Shell SHALL include a canonical URL for each page, derived from the site's base URL (configured as a single environment variable or build-time constant — design decides mechanism).
