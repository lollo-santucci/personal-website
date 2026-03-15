# Requirements Document

## Introduction

This spec applies the design system foundations (Spec 8) to every page of the classic view and builds the advanced UI patterns that give the site its distinctive identity. Spec 8 established the visual language — color palette, typography, spacing tokens, border conventions, and base component library. This spec consumes those foundations: it redesigns every page to match the approved Figma mockups, replaces the existing minimal-styling components with design-system-native implementations, builds new page-level patterns (animated sprite, RPG menu, navigation overlay, agent profile layout, chat placeholder, project metadata panel), and enforces responsive behavior from 320px to 1440px+.

After this spec, the classic view is visually complete: the RPG title screen landing page, the agentdex profile with stat bars and chat UI, the collection-based blog and agentdex indexes, the two-column project detail with metadata panels, and the shared page structure (header, page title, CTA banner, cross-links, footer) that ties every inner page together.

Backlog tasks covered: P4-T04, P4-T05, P4-T07, P4-T08 (completion), P4-T09.

## Glossary

- **Inner_Page**: Any page except the landing page (`/`). All inner pages share a common vertical structure: Header → page title → page content → CTA_Banner → Cross_Links → Footer.
- **Landing_Page**: The home page (`/`), styled as an RPG title screen. Has its own unique structure — no Header, no CTA_Banner, no Cross_Links.
- **Shared_Page_Structure**: The vertical layout pattern common to all Inner_Pages: Header, page title (Pixbob_Bold at page title size), page content, CTA_Banner, Cross_Links, Footer.
- **Menu_Overlay**: A full-screen overlay triggered by the "MENU" element in the Header, displaying navigation links.
- **Totti_Sprite**: An animated pixel-art sprite of the companion dog Totti, displayed on the Landing_Page with a sitting/barking/sleeping state machine.
- **Landing_Menu**: The RPG-style navigation menu on the Landing_Page, listing site sections with RPG_Selector prefixes.
- **Agent_Profile_Layout**: The full agent profile page layout including character sprite, metadata (role, best for, mission, tone of voice stat bars), and chat section.
- **Chat_Section**: The area on the agent profile page displaying a greeting message and a text input area. Functional chat is deferred to the Agent Platform phase — this spec renders the visual UI with placeholder behavior.
- **Offset_Shadow**: A decorative shadow effect on project card screenshots — a solid-color rectangle offset from the image frame.
- **Collection_Index**: An index page (blog, agentdex) that uses Collection_Container and Collection_Row components from Spec 8 instead of card grids.
- **Read_Time**: An estimated reading time for blog posts, calculated from the content word count.
- **Agent_Extended_Fields**: The fields required for the full agent profile that are not yet in the Agent interface: `index` (number), `mission` (string), `bestFor` (string[]), `toneOfVoice` (object with `warm`, `direct`, `playful`, `formal`, `calm` as 1–5 numbers), `greeting` (optional string). These fields must be added to the Agent type and content files.
- **Focus_Treatment**: 3px solid `var(--accent)` outline with 2px offset — the global keyboard focus indicator defined in Spec 8.
- **Pixel_Rendering**: `image-rendering: pixelated` (no anti-aliasing) at integer scale — the rendering mode for all pixel-art sprites.
- **Border_Convention**: Solid `var(--black)` border at the width specified per context (3px for inputs, 5px for screenshots, 10px for collection containers) — defined in Spec 8.
- **Fallback_Title**: A hardcoded page title displayed when the content system returns no content for a content-backed page. Permitted exception to the no-hardcoded-text principle.
- **Empty_State**: A non-blank message displayed when a collection index has zero items. Exact wording is a design decision.
- **Static_Generation**: Entity detail pages pre-render all known slugs at build time. Unknown slugs return 404.

## Dependencies

- Design system foundations (Spec 8): all color tokens, typography tokens, spacing tokens, border conventions, and base UI components (Button, Badge, SectionLabel, CollectionContainer, CollectionRow, CTABanner, CrossLinks, Prose, RPGSelector, StatBar, Blockquote, PixelImage, ArrowUpRight) must be implemented.
- Content loaders (Spec 4): `getProjects`, `getProjectBySlug`, `getBlogPosts`, `getBlogPostBySlug`, `getPages`, `getPageBySlug`, `getAgents`, `getAgentBySlug` must be functional.
- MDX rendering (Spec 4): `renderMDX` must be available.
- Site shell (Spec 5): Root layout with title template, route file structure.
- Agent interface (Spec 2): `Agent` type — this spec extends it with Agent_Extended_Fields.
- Font files at `public/assets/fonts/` (loaded in Spec 8).
- Totti spritesheets at `public/assets/characters/totti/spritesheets/BROWN_DOG_SITTING.png`, `BROWN_DOG_PLAYFUL.png`, `BROWN_DOG_SLEEPING.png`.
- Agent spritesheets at `public/assets/agents/{slug}/spritesheets/character_spritesheet.png`.

## Scope Boundary

This spec covers page-level design application and advanced UI patterns only. It does NOT cover:
- Agent chat functionality (API routes, streaming, Vercel AI SDK) — deferred to Agent Platform phase
- Play view or world engine — separate spec
- Content creation beyond seed data updates — content is authored independently
- Design token definitions or base component contracts — those are Spec 8

## Priority Tiers

Requirements are classified into two tiers:

- **Core** (must-have): Layout, structure, navigation, content display, data model changes, accessibility, responsive integrity, build integrity. The site is shippable with only Core requirements complete.
- **Polish** (enhancement): Micro-interactions, sprite animation state machine, offset shadow, stat bar fill animation. These enhance the experience but are not blocking. Requirements marked with **(Polish)** may be deferred without breaking the site.


## Requirements

### Requirement 1: Shared Page Structure for Inner Pages

**User Story:** As a visitor, I want every inner page to follow a consistent vertical structure, so that the site feels cohesive and I always know where to find navigation, calls to action, and cross-links.

#### Acceptance Criteria

1. EACH Inner_Page SHALL render the following vertical sections in order: Header, page title, page content, CTA_Banner, Cross_Links, Footer.
2. THE page title on each Inner_Page SHALL use the `page-title` typography token defined in Spec 8.
3. THE page content area SHALL be constrained to `content-max-w` and centered horizontally.
4. WHEN the viewport width exceeds 1440px, THE page content SHALL NOT stretch beyond `content-max-w`.
5. THE CTA_Banner on each Inner_Page SHALL link to `/contact`. The headline and body text for each page is a design decision.
6. THE Cross_Links section on each Inner_Page SHALL display links to at least two other site sections. The specific sections and layout is a design decision.
7. ALL spacing between vertical sections SHALL use the `section-gap` layout token.

### Requirement 2: Header

**User Story:** As a visitor, I want a header with the site name and a menu trigger, so that I can navigate the site from any page.

#### Acceptance Criteria

1. THE Header SHALL display "Lorenzo Santucci" on the left, linking to `/`. Typography uses the `logo` token defined in Spec 8.
2. THE Header SHALL display a menu trigger on the right. The trigger label and typography is a design decision.
3. WHEN a visitor activates the menu trigger, THE Header SHALL open the Menu_Overlay.
4. THE menu trigger SHALL have an accessible label communicating its purpose (e.g., "Open navigation menu").
5. THE menu trigger SHALL be operable via keyboard (Enter/Space to activate).
6. THE Header SHALL NOT appear on the Landing_Page.

### Requirement 3: Menu Overlay

**User Story:** As a visitor, I want a full-screen navigation overlay when I activate MENU, so that I can navigate to any section of the site.

#### Acceptance Criteria

1. WHEN the Menu_Overlay is open, THE overlay SHALL cover the full viewport.
2. THE Menu_Overlay SHALL display navigation links to: About (`/about`), Projects (`/projects`), Agentdex (`/agentdex`), Blog (`/blog`), Contact (`/contact`).
3. THE Menu_Overlay SHALL present navigation as an RPG-style full-screen menu. Each link SHALL be a list item. The overlay SHALL use pixel-art typography (Spec 8 pixel font tokens). Layout, decorative prefixes, and specific typography choices is a design decision.
4. THE Menu_Overlay SHALL display a close control with an accessible label communicating its purpose (e.g., "Close navigation menu").
5. WHEN a visitor activates the close control or presses the Escape key, THE Menu_Overlay SHALL close.
6. WHEN the Menu_Overlay is open, keyboard focus SHALL be trapped within the overlay — Tab and Shift+Tab SHALL cycle through the overlay's interactive elements only.
7. WHEN the Menu_Overlay closes, focus SHALL return to the element that triggered it.
8. THE Menu_Overlay SHALL communicate its open/closed state to assistive technologies via appropriate ARIA attributes.

### Requirement 4: Footer

**User Story:** As a visitor, I want a footer with copyright, social links, and a contact CTA, so that I can find attribution and reach out from any page.

#### Acceptance Criteria

1. THE Footer SHALL display a copyright notice including "Lorenzo Santucci" and the current year. Exact wording and typography is a design decision.
2. THE Footer SHALL display LinkedIn and GitHub icon links. LinkedIn SHALL link to `https://linkedin.com/in/lorenzosantucci`. GitHub SHALL link to `https://github.com/lollo-santucci`. Both SHALL open in a new tab with `rel="noopener noreferrer"`.
3. THE Footer SHALL display a contact CTA linking to `/contact`.
4. WHEN the viewport width is less than 768px, THE Footer layout SHALL stack vertically.
5. EACH social icon link SHALL have an accessible label identifying the platform (e.g., "LinkedIn", "GitHub").

### Requirement 5: Landing Page — RPG Title Screen

**User Story:** As a visitor, I want the landing page to feel like an RPG title screen, so that the site immediately communicates its distinctive personality.

#### Acceptance Criteria

1. THE Landing_Page SHALL NOT render the Header, CTA_Banner, or Cross_Links sections. It SHALL render the Footer.
2. THE Landing_Page SHALL display "Lorenzo Santucci" centered, using the `page-title` typography token.
3. THE Landing_Page SHALL display a non-empty subtitle text below the title, centered. Exact wording is a design decision.
4. THE Landing_Page SHALL display the Totti_Sprite and the Landing_Menu in a two-column layout on desktop.
5. WHEN the viewport width is less than 768px, THE Landing_Page SHALL stack vertically: title → subtitle → Totti_Sprite → Landing_Menu. The page SHALL be scrollable on mobile.
6. WHEN the viewport width is 768px or greater, THE Landing_Page SHALL fill the viewport height without requiring scrolling.

### Requirement 6: Totti Sprite Animation (Polish)

**User Story:** As a visitor, I want to see an animated companion dog on the landing page that reacts to my presence, so that the site feels alive and playful.

#### Acceptance Criteria

1. THE Totti_Sprite SHALL render a pixel-art sprite from the Totti spritesheets with Pixel_Rendering at integer scale.
2. THE Totti_Sprite SHALL implement a state machine with three states: sitting (default), barking, and sleeping.
3. WHILE in the sitting state, THE Totti_Sprite SHALL loop the front-facing sitting animation frames (tail wagging).
4. WHILE in the sitting state, THE Totti_Sprite SHALL periodically transition to barking. The exact interval is a design decision (suggested: 8–15 seconds random).
5. WHEN the barking animation completes, THE Totti_Sprite SHALL return to the sitting state.
6. WHEN no user interaction (hover, click, or mouse movement over the Landing_Page) occurs for a configurable inactivity threshold, THE Totti_Sprite SHALL transition from sitting to sleeping. The exact threshold is a design decision (suggested: 10 seconds).
7. WHILE in the sleeping state, THE Totti_Sprite SHALL loop a slow breathing animation.
8. WHEN the user interacts (hover, click, or mouse movement) while the Totti_Sprite is sleeping, THE Totti_Sprite SHALL transition to the sitting state.
9. WHEN the user has `prefers-reduced-motion: reduce` enabled, THE Totti_Sprite SHALL display a static frame instead of animating.

### Requirement 7: Landing Menu

**User Story:** As a visitor, I want an RPG-style menu on the landing page, so that I can navigate to site sections in a way that matches the title screen aesthetic.

#### Acceptance Criteria

1. THE Landing_Menu SHALL display navigation items for: About (`/about`), Projects (`/projects`), Agentdex (`/agentdex`), Blog (`/blog`), and a disabled "New Game" placeholder for the future play view.
2. THE "New Game" item SHALL be rendered as non-interactive: not focusable, not clickable, and visually differentiated from active items. The specific visual treatment is a design decision.
3. EACH interactive menu item SHALL link to its corresponding route.
4. THE Landing_Menu SHALL present items in an RPG menu style using pixel-art typography (Spec 8 pixel font tokens). Each item SHALL be a list item with an RPG_Selector prefix (`>`). Labels and specific typography sizes is a design decision.
5. THE Landing_Menu SHALL display the Focus_Treatment on each interactive item when focused via keyboard.
6. THE Landing_Menu SHALL be navigable via keyboard (Tab between items, Enter to activate).

### Requirement 8: About Page

**User Story:** As a visitor, I want the about page to present Lorenzo's background in a two-column layout with an agentdex-style sidebar, so that I get both narrative content and a quick profile summary.

#### Acceptance Criteria

1. THE about page SHALL follow the Shared_Page_Structure.
2. THE page content SHALL use a two-column layout on desktop: left column for prose content, right column for a profile sidebar.
3. THE left column SHALL display content sections rendered via the Prose component.
4. THE right column SHALL display a profile sidebar styled as an agentdex-style profile card, containing: character sprite (rendered with Pixel_Rendering), role, use cases, mission text, tone of voice metrics for each dimension, and a contact CTA linking to `/contact`. The sidebar SHALL use pixel-art typography for labels (Spec 8 pixel font tokens). Visual composition within the sidebar is a design decision.
5. WHEN the viewport width is less than 1024px, THE two columns SHALL stack vertically — prose content above, sidebar below.
6. THE about page content SHALL be loaded from the content system (Page entity with slug `about`). IF no content exists, THE page SHALL display the Fallback_Title "About" with an empty content area.

### Requirement 9: Blog Index

**User Story:** As a visitor, I want the blog index to display articles in a collection list format with dates and action buttons, so that I can scan posts quickly.

#### Acceptance Criteria

1. THE blog index SHALL follow the Shared_Page_Structure.
2. THE blog index SHALL display all blog posts inside a Collection_Container.
3. EACH blog post SHALL render as a Collection_Row displaying: formatted date (DD.MM.YYYY), the post title, an optional "New" Badge for posts published within the last 30 days, and a "Read" action linking to the post's detail page. Decorative prefixes are a design decision.
4. THE blog posts SHALL be displayed in date-descending order (then title ascending as tiebreaker).
5. WHEN no blog posts exist, THE page SHALL display an Empty_State.

### Requirement 10: Blog Post Detail Page

**User Story:** As a visitor, I want to read blog posts with proper typography, breadcrumb navigation, and metadata, so that long-form content is comfortable and well-contextualized.

#### Acceptance Criteria

1. THE blog post detail page SHALL follow the Shared_Page_Structure.
2. THE page SHALL display a breadcrumb: "Blog" (linking to `/blog`) followed by the post title.
3. THE page SHALL display the post title using the `page-title` typography token.
4. THE page SHALL display a metadata row below the title containing: formatted date (DD.MM.YYYY), estimated Read_Time, and category/tag badges if available.
5. THE post body SHALL render inside a Prose component. Maximum content width is a design decision (suggested: ~720px).
6. THE page SHALL follow the Static_Generation pattern for all known blog post slugs.
7. IF no blog post matches the given slug, THE page SHALL return a 404 response.

### Requirement 11: Agentdex Index

**User Story:** As a visitor, I want the agentdex index to display agents in a collection list format with pixel portraits and index numbers, so that the directory feels like an RPG character roster.

#### Acceptance Criteria

1. THE agentdex index SHALL follow the Shared_Page_Structure.
2. THE agentdex index SHALL display all agents inside a Collection_Container.
3. EACH agent SHALL render as a Collection_Row displaying: a pixel portrait (rendered with Pixel_Rendering), the agent's index number formatted as three digits (e.g., "001"), the agent's name, an optional Badge for the agent's status, and a "Meet" action linking to the agent's profile page. Decorative prefixes are a design decision.
4. THE agents SHALL be sorted by the `index` field ascending.
5. WHEN no agents exist, THE page SHALL display an Empty_State.

### Requirement 12: Agent Profile Page

**User Story:** As a visitor, I want a rich agent profile page with character sprite, metadata, stat bars, and a chat section, so that I can fully understand the agent's personality and capabilities.

#### Acceptance Criteria

1. THE agent profile page SHALL follow the Shared_Page_Structure.
2. THE page SHALL display a breadcrumb: "Agentdex" (linking to `/agentdex`) followed by the agent's name.
3. THE page SHALL display the agent's name using the `page-title` typography token, with the index number (formatted as three digits) displayed adjacent. The index number SHALL be displayed with lower visual weight than the agent name (e.g., reduced opacity or secondary color). The specific treatment is a design decision.
4. THE page SHALL use a two-column layout on desktop: left column for the agent's character sprite (rendered with Pixel_Rendering at a size larger than the portrait used in Collection_Row; exact dimensions are a design decision), right column for metadata.
5. THE right column SHALL display: the agent's role, a "Best for" list of `bestFor` items, a bordered mission box containing the `mission` text, and a "Tone of Voice" section displaying metrics for each of the five tone dimensions (`warm`, `direct`, `playful`, `formal`, `calm`). Visual composition, decorative prefixes, and section label styling is a design decision.
6. BELOW the two-column area, THE page SHALL display the Chat_Section.
7. WHEN the viewport width is less than 1024px, THE two columns SHALL stack vertically — sprite above, metadata below.
8. THE page SHALL follow the Static_Generation pattern for all known agent slugs.
9. IF no agent matches the given slug, THE page SHALL return a 404 response.

### Requirement 13: Chat Section (Visual Placeholder)

**User Story:** As a visitor, I want to see a chat interface on the agent profile page, so that I understand the agent can be conversed with (even if chat is not yet functional).

#### Acceptance Criteria

1. THE Chat_Section SHALL display a greeting message area. IF the agent has a `greeting` field, THE greeting text SHALL be displayed. IF absent, a default greeting SHALL be shown (e.g., "Hi! I'm {agent name}. Chat coming soon.").
2. THE Chat_Section SHALL display a text input area with placeholder text and a send button.
3. THE text input SHALL be visually styled with Border_Convention. Typography is a design decision.
4. THE send button SHALL remain focusable for assistive technology while communicating the non-functional state via `aria-disabled="true"`.
5. THE send button SHALL have an accessible label that conveys both the action and its unavailability (e.g., "Send message — coming soon").
6. THE Chat_Section SHALL NOT trigger any API call, navigation, or functional behavior when the user types or activates the send button.

### Requirement 14: Projects Index

**User Story:** As a visitor, I want to browse projects in a grid with visually rich cards, so that I can evaluate Lorenzo's work at a glance.

#### Acceptance Criteria

1. THE projects index SHALL follow the Shared_Page_Structure.
2. THE projects index SHALL display projects in a two-column grid layout on desktop.
3. EACH project SHALL render as a card with: a screenshot area with Border_Convention and an Offset_Shadow, tech stack badges, the project title, and a short description. Typography and badge styling is a design decision.
4. IF a project has an `image` field, THE screenshot area SHALL display it. IF absent, THE screenshot area SHALL display a placeholder background.
5. EACH project card SHALL link to `/projects/{slug}` for the corresponding project.
6. WHEN the viewport width is less than 768px, THE grid SHALL collapse to a single column.
7. WHEN no projects exist, THE page SHALL display an Empty_State.

### Requirement 15: Project Detail Page

**User Story:** As a visitor, I want a project detail page with a hero area, two-column content, and metadata panels, so that I can understand the project's scope, technology, and outcomes.

#### Acceptance Criteria

1. THE project detail page SHALL follow the Shared_Page_Structure.
2. THE page SHALL display a breadcrumb: "Projects" (linking to `/projects`) followed by the project title.
3. THE page SHALL display a hero area containing: the project screenshot (with Border_Convention frame), the project title using the `page-title` typography token, and tech stack badges. Layout composition within the hero area is a design decision.
4. THE page SHALL use a two-column layout on desktop: left column for prose content (rendered via Prose component), right column for a metadata panel.
5. THE metadata panel SHALL display: integrations, tech stack, key metrics, and a link to the project's live URL (if available). Section grouping and visual composition is a design decision.
6. IF the project has no live URL, THE metadata panel SHALL omit the live URL link.
7. WHEN the viewport width is less than 1024px, THE two columns SHALL stack vertically — prose above, metadata panel below.
8. THE page SHALL follow the Static_Generation pattern for all known project slugs.
9. IF no project matches the given slug, THE page SHALL return a 404 response.

### Requirement 16: Contact Page

**User Story:** As a potential client, I want a clean contact page with clear CTAs, so that I can easily reach Lorenzo.

#### Acceptance Criteria

1. THE contact page SHALL follow the Shared_Page_Structure.
2. THE page SHALL display the page title using the `page-title` typography token.
3. THE page SHALL display contact methods: an email link, a LinkedIn link (to `https://linkedin.com/in/lorenzosantucci`), and a GitHub link (to `https://github.com/lollo-santucci`). All external links SHALL open in a new tab with `rel="noopener noreferrer"`.
4. THE contact page content SHALL be loaded from the content system (Page entity with slug `contact`). IF no content exists, THE page SHALL display the Fallback_Title "Contact" with an empty content area.
5. EACH contact link SHALL have a minimum touch target of 44×44px on mobile.

### Requirement 17: Agent Type Extension

**User Story:** As a developer, I want the Agent interface to include all fields needed for the full agent profile, so that the agentdex profile page can display rich metadata.

#### Acceptance Criteria

1. THE Agent interface SHALL include the following additional required fields: `index` (number — display order in agentdex), `mission` (string — one-sentence mission statement), `bestFor` (string[] — use cases), `toneOfVoice` (object with `warm`, `direct`, `playful`, `formal`, `calm` as number fields, each 1–5).
2. THE Agent interface SHALL include the following additional optional field: `greeting` (string — chat placeholder message).
3. ALL existing agent content files SHALL be updated to include the new required fields.
4. THE agent content loader SHALL validate the presence of the new required fields at load time, consistent with the existing validation scope (required field presence, array-typed fields are arrays).
5. ALL updated agent content files SHALL pass content loader validation without errors.

### Requirement 18: Seed Content Updates

**User Story:** As a developer, I want seed content updated to exercise all new page behaviors, so that every redesigned page has meaningful data to display.

#### Acceptance Criteria

1. ALL agent content files SHALL include the Agent_Extended_Fields (`index`, `mission`, `bestFor`, `toneOfVoice`) with populated values.
2. AT LEAST one agent SHALL have a `greeting` field populated.
3. AT LEAST one project SHALL have an `image` field pointing to an existing asset in `public/assets/`.
4. ALL seed content SHALL pass content loader validation without errors.
5. ALL seed content SHALL contain no `TODO` markers, no `lorem ipsum`, and no empty required fields.

### Requirement 19: Component Deprecation

**User Story:** As a developer, I want the old minimal-styling components replaced by design-system-native implementations, so that the codebase has no dead code from the pre-design-system era.

#### Acceptance Criteria

1. THE following components SHALL be removed: `ProjectCard`, `BlogPostCard`, `AgentCard`, `StatusBadge`.
2. ALL pages that previously imported the deprecated components SHALL be updated to use design-system-native replacements.
3. ALL test files that reference the deprecated components SHALL be updated or removed.
4. THE project SHALL compile without errors after all deprecations.

### Requirement 20: Micro-Interactions (Polish)

**User Story:** As a visitor, I want subtle hover and focus transitions on interactive elements, so that the site feels polished and responsive to my actions.

#### Acceptance Criteria

1. WHEN a visitor hovers over a Button component, THE Button SHALL display a CSS state change (e.g., background, border, or color shift) completing within 200ms. The specific effect is a design decision.
2. WHEN a visitor hovers over a Collection_Row, THE row SHALL display a CSS state change (e.g., background, border, or color shift) completing within 200ms. The specific effect is a design decision.
3. WHEN a visitor hovers over a link with an arrow icon, THE arrow SHALL translate slightly to the upper-right, completing within 200ms.
4. ALL transition durations SHALL be 200ms or less.
5. WHEN the user has `prefers-reduced-motion: reduce` enabled, ALL animations and transitions SHALL be disabled or reduced to instant state changes.

### Requirement 21: Responsive Integrity

**User Story:** As a visitor on any device, I want every page to be fully usable from 320px to 1440px+, so that no breakpoint degrades the experience.

#### Acceptance Criteria

1. ALL pages SHALL render without horizontal scrolling on viewports from 320px width and above.
2. WHEN the viewport width is less than 640px, ALL multi-column layouts SHALL collapse to single column.
3. WHEN the viewport width is between 768px and 1023px, two-column layouts SHALL begin appearing where specified per page requirement.
4. WHEN the viewport width is 1440px or greater, THE page content SHALL be constrained to `content-max-w` (1312px) and centered.
5. ALL touch targets on mobile (buttons, links, menu items) SHALL have a minimum interactive area of 44×44px.
6. ALL spacing, sizing, and width values in page components SHALL reference design tokens (Tailwind theme tokens, responsive utility classes, or CSS custom properties). Permitted exceptions: Tailwind arbitrary values at responsive breakpoints for typographic sizes (per Spec 8 convention), SVG intrinsic dimensions, and PixelImage computed dimensions.

### Requirement 22: Page Metadata

**User Story:** As a site owner, I want each redesigned page to have appropriate metadata, so that the site remains discoverable and shareable.

#### Acceptance Criteria

1. THE Landing_Page SHALL have a `<title>` of "Lorenzo Santucci" (no site name suffix).
2. EACH Inner_Page SHALL have a `<title>` following the pattern `{Page Title} | Lorenzo Santucci`.
3. EACH page SHALL have a non-empty meta description. For entity detail pages, the description SHALL be derived from entity fields: blog posts from `excerpt`, agent profiles from `role` + `mission`, projects from `description`.
4. ALL pages SHALL include a canonical URL.
5. EACH entity detail page that returns no matching entity SHALL return a 404 response (not a page with empty metadata).

### Requirement 23: Accessibility

**User Story:** As a visitor using assistive technology, I want all redesigned pages to maintain accessible structure and interaction patterns, so that the site is usable regardless of how I interact with it.

#### Acceptance Criteria

1. ALL pages SHALL use semantic landmark elements (`<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`) as appropriate.
2. ALL images (sprites, screenshots, portraits) SHALL have non-empty `alt` attributes.
3. ALL breadcrumb navigation elements SHALL use a `<nav>` element with `aria-label="Breadcrumb"`.
4. ALL interactive elements SHALL display the Focus_Treatment when focused via keyboard.
5. THE Totti_Sprite SHALL respect `prefers-reduced-motion` by displaying a static frame when reduced motion is preferred.

### Requirement 24: Build Integrity

**User Story:** As a developer, I want the project to compile cleanly after all design system application changes, so that no page redesign introduces build errors.

#### Acceptance Criteria

1. THE project SHALL compile without errors via `pnpm build` after all changes in this spec.
2. ALL new components SHALL be typed with TypeScript interfaces for their props.
3. ALL deprecated components SHALL be fully removed — no dead imports, no unused files.
4. ALL existing tests that reference modified pages or deprecated components SHALL be updated to pass.
