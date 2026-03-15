# Requirements Document

## Introduction

This spec defines the design system foundations for Lorenzo Santucci's personal website classic view. The classic view is fully built (Specs 5–7) with all pages, routes, content loading, and navigation working on minimal Tailwind styling with neutral colors and system fonts. This spec establishes the visual language — color palette, typography (Pixbob pixel font family + Manrope for prose), spacing tokens, border conventions, and a base component library — derived from the approved Figma mockups. The next spec (09) applies this system to all pages, redesigns existing card/list components, and handles advanced patterns.

Backlog tasks covered: P4-T01, P4-T02, P4-T03, P4-T06, P4-T08 (partial), P4-T10.

## Glossary

- **Design_System**: The set of CSS custom properties, Tailwind theme tokens, font definitions, and reusable components that define the site's visual language.
- **Color_Token**: A CSS custom property (e.g., `--accent`) that stores a color value and is referenced by Tailwind theme and components.
- **Pixbob_Bold**: A pixel-art bitmap font used for page titles, section headings, project titles, logo text, and CTA headlines.
- **Pixbob_Regular**: A pixel-art bitmap font used for buttons, badges, navigation labels, list items, card text, stat bar labels, and form labels.
- **Pixbob_Lite**: A pixel-art bitmap font with lighter visual weight, used for subtitles, footer text, and the header "MENU" label.
- **Manrope**: A sans-serif font used exclusively for long-form prose content (About page body, blog post body, project descriptions).
- **Responsive_Token**: A spacing, sizing, or typography value that scales across breakpoints, defined as a theme token or CSS custom property.
- **Border_Convention**: The standard border styles: 3px solid `var(--black)` for interactive elements, 10px solid `var(--black)` for collection containers, 5px solid `var(--black)` for image frames.
- **Focus_Treatment**: The standard interactive focus style: `3px solid var(--accent)` focus-visible outline with 2px offset. Defined once globally, inherited by all interactive components.
- **Pixel_Rendering**: The `image-rendering: pixelated` CSS property applied to pixel-art assets to prevent anti-aliasing blur at scaled sizes.
- **Integer_Scale**: Rendering pixel art at whole-number multiples of its native resolution (2×, 3×, 4×) to maintain crisp pixel boundaries.
- **RPG_Selector**: The `>` character prefix used before list items throughout the design, rendered in Pixbob_Regular.
- **Stat_Bar**: A vertical bar chart component showing a 1–5 rating as stacked filled/empty rectangles.
- **Collection_Container**: A 10px-bordered container for list views.
- **Collection_Row**: A single row inside a Collection_Container with left-side content and right-side action button.
- **CTA_Banner**: A full-width violet banner with headline, body text, and arrow icon.
- **Cross_Links**: A two-column section showing links to other site sections.
- **Design_Tokens_Module**: A TypeScript module exporting named constants for colors, border widths, and container widths for programmatic use outside CSS.

## Dependencies

- Site shell layout (Spec 5) must be implemented: root layout, Header, Footer, route structure.
- Content loader (Spec 4) must be implemented: typed content loading for all entity types.
- Font files must exist at `public/assets/fonts/` (pixbob-bold.ttf, pixbob-lite.ttf, pixbob-regular.ttf).
- Tailwind CSS v4 with CSS-based configuration.
- `@tailwindcss/typography` plugin installed.

## Scope Boundary

This spec covers design tokens and base UI component definitions only. Each component requirement defines the component's contract (props, visual behavior, accessibility). Where and how these components are adopted on specific pages is deferred to Spec 09 (Design System Application):
- ProjectCard redesign (offset shadow, badge overlay)
- Blog index and agentdex index migration from cards to collection rows
- Deprecation of BlogPostCard, AgentCard, and StatusBadge components
- Page-level layout application of the design system
- Adoption of CTA_Banner, Cross_Links, Prose, RPGSelector, etc. on specific pages

## Requirements

### Requirement 1: Global Styles and Color Palette

**User Story:** As a developer, I want all colors defined as CSS custom properties and mapped to Tailwind theme tokens, with global style conventions enforced in one place, so that every component references a single source of truth.

#### Acceptance Criteria

1. THE Design_System SHALL define the following Color_Tokens as CSS custom properties in `:root`: `--white` (`#fffdfa`), `--black` (`#222222`), `--accent` (`#fc5c46`), `--violet` (`#b87dfe`), `--blue` (`#467afc`), `--lime` (`#cbfd00`), `--green` (`#00cf00`), `--muted` (`#9a9997`).
2. THE Design_System SHALL map these Color_Tokens to Tailwind semantic theme colors: `primary` → `--accent`, `secondary` → `--violet`, `surface` → `--white`, `text` → `--black`, `text-muted` → `--muted`, `border` → `--black`, `blue` → `--blue`, `lime` → `--lime`, `green` → `--green`.
3. THE Design_System SHALL set `body` background to `var(--white)` and color to `var(--black)`.
4. THE Design_System SHALL style text selection with `var(--accent)` background and white text.
5. THE Design_System SHALL define a global Focus_Treatment for all interactive elements: `3px solid var(--accent)` focus-visible outline with 2px offset.
6. THE Design_System SHALL enforce `border-radius: 0` globally — no rounded corners on any element across the site.
7. THE Design_System SHALL enable smooth scrolling on the `html` element.
8. THE Design_System SHALL define a `.pixel-art` utility class that applies Pixel_Rendering.
9. ALL components created in this spec SHALL reference Color_Tokens or Tailwind theme tokens for color values — no hardcoded hex values in component markup.

### Requirement 2: Typography — Font Loading and Configuration

**User Story:** As a visitor, I want the site to use distinctive pixel-art fonts for UI elements and a readable sans-serif for prose, so that the visual identity is consistent and content is comfortable to read.

#### Acceptance Criteria

1. THE Design_System SHALL load Pixbob_Bold, Pixbob_Regular, Pixbob_Lite, and Manrope Light (weight 300) as optimized web fonts with no Flash of Invisible Text (FOIT) — text SHALL be visible immediately using a fallback font, then swap to the loaded font.
2. THE Design_System SHALL make each font available as a named theme font family so that components can reference them by name (e.g., `font-pixbob-bold`, `font-manrope`).
3. THE Design_System SHALL assign Pixbob_Bold to: page titles, section headings, project titles, logo text, CTA headlines, and headings within prose sections.
4. THE Design_System SHALL assign Pixbob_Regular to: buttons, badges, navigation labels, list items, collection item titles, card text, stat bar labels, and form labels.
5. THE Design_System SHALL assign Pixbob_Lite to: subtitles, header "MENU" label, and footer copyright text.
6. THE Design_System SHALL assign Manrope Light (300) to: all long-form prose content.

### Requirement 3: Typographic Scale — Responsive Sizing

**User Story:** As a visitor on any device, I want text to scale fluidly from mobile to desktop, so that headings are impactful on large screens and readable on small ones.

#### Acceptance Criteria

1. THE Design_System SHALL define a typographic scale with named sizes for: page title (128px desktop), project title (60px desktop), section heading (48px desktop), logo (48px desktop), collection item (48px desktop), CTA headline (40px desktop), CTA body / card text (36px desktop), button / label (32–40px desktop), footer / subtitle (32px desktop), badge (22px desktop), body prose (26px desktop).
2. EACH named typographic size above body prose SHALL scale responsively — the rendered size at 320px SHALL be smaller than the rendered size at 1440px.
3. THE Design_System SHALL customize prose typography to use Manrope Light at 26px desktop with `var(--black)` text color, and Pixbob_Bold for headings within prose sections.

### Requirement 4: Spacing and Layout Tokens

**User Story:** As a developer, I want all spacing and layout values defined as theme tokens, so that changing a value in one place propagates to every component that uses it.

#### Acceptance Criteria

1. THE Design_System SHALL define the following layout tokens with desktop reference values: `page-px` (100px), `page-pt` (50px), `section-gap` (60px), `content-max-w` (1312px), `collection-px` (40px), `collection-py` (25px), `card-gap` (25px), `crosslink-gap` (50px).
2. EACH layout token except `content-max-w` SHALL scale responsively: the value at 375px SHALL be 30–60% of the desktop value (e.g., `page-px` ≈ 24px at 375px, `section-gap` ≈ 32px at 375px).
3. THE Design_System SHALL define fixed border width tokens: 3px for standard interactive elements, 10px for collection containers, 5px for image frames.
4. ALL spacing and sizing values used in components created by this spec SHALL reference theme tokens or CSS custom properties — zero hardcoded pixel values in component markup.
5. WHEN a layout token value is changed in the theme configuration, THE change SHALL propagate to all components that reference that token without editing component files.

### Requirement 5: Button Component

**User Story:** As a visitor, I want buttons that are visually consistent with the site's pixel-art identity, so that interactive elements are clearly recognizable.

#### Acceptance Criteria

1. THE Button component SHALL render with Border_Convention (3px), no border-radius, and Pixbob_Regular font.
2. THE Button component SHALL support three color variants: primary (`var(--accent)` background, white text), secondary (`var(--white)` background, `var(--black)` text), dark (`var(--black)` background, white text).
3. THE Button component SHALL support three sizes: sm (20–24px text), md (30–36px text), lg (36–42px text).
4. THE Button component SHALL accept an optional trailing icon (arrow-up-right ↗ is the default).
5. WHEN an `href` prop is provided, THE Button component SHALL render as an anchor element. WHEN no `href` is provided, it SHALL render as a `<button>` element.
6. THE Button component SHALL inherit the global Focus_Treatment.
7. THE Button component SHALL expose its label text to assistive technologies (non-empty accessible name).
8. THE Button component SHALL be typed with a TypeScript interface for its props.

### Requirement 6: Badge and SectionLabel Components

**User Story:** As a visitor, I want colored labels that categorize content at a glance, so that I can quickly identify technology tags, status indicators, and section headers.

#### Acceptance Criteria

1. THE Badge component SHALL render with Border_Convention (3px), no border-radius, and Pixbob_Regular at badge size (20–24px desktop).
2. THE Badge component SHALL support color variants: accent (red background, white text), violet, blue, green, lime (black text), dark (black background, white text).
3. THE SectionLabel component SHALL share the same visual structure and color variant system as Badge, but be semantically distinct (used as a section header rather than an inline tag).
4. BOTH components SHALL be typed with TypeScript interfaces for their props.

### Requirement 7: Collection Components

**User Story:** As a developer, I want reusable list container and row components with consistent borders and layout, so that any list view can adopt the same visual pattern.

#### Acceptance Criteria

1. THE Collection_Container component SHALL render with Border_Convention (10px), no border-radius, no background color (inherits `var(--white)`), and internal padding from layout tokens (`collection-px`, `collection-py`).
2. THE Collection_Row component SHALL render as a flex row with left-side content area and right-side action area, vertically centered.
3. THE Collection_Row component SHALL accept `children` for the left content area and an optional `action` slot for the right-side element (typically a Button).
4. WHEN the viewport width is less than 768px, THE Collection_Container border width SHALL reduce to 6px or less, and THE Collection_Row SHALL remain a single horizontal row without wrapping.
5. BOTH components SHALL be typed with TypeScript interfaces for their props.

### Requirement 8: CTA Banner Component

**User Story:** As a site owner, I want a reusable call-to-action banner component, so that any page can include a prominent conversion prompt.

#### Acceptance Criteria

1. THE CTA_Banner component SHALL render with `var(--violet)` background, Border_Convention (3px), and no border-radius.
2. THE CTA_Banner component SHALL display a headline in Pixbob_Bold, body text in Pixbob_Regular, and an arrow-up-right icon, all in white text.
3. THE CTA_Banner component SHALL accept `headline`, `body`, and `href` props.
4. THE CTA_Banner component SHALL inherit the global Focus_Treatment and expose its link destination as an accessible name.
5. THE CTA_Banner component SHALL be typed with a TypeScript interface for its props.

### Requirement 9: Cross-Links Component

**User Story:** As a developer, I want a reusable cross-links component that renders two columns of section links, so that any page can offer navigation to related content.

#### Acceptance Criteria

1. THE Cross_Links component SHALL render as a two-column layout.
2. EACH column SHALL display a section title in Pixbob_Bold with an arrow-up-right icon, followed by a list of item links.
3. EACH item link SHALL render as a bordered element (`var(--white)` background, Border_Convention 3px, Pixbob_Regular) with an arrow-up-right icon.
4. WHEN the viewport width is less than 768px, THE two columns SHALL stack vertically.
5. THE Cross_Links component SHALL accept props defining which two sections to display and their items.
6. THE Cross_Links component SHALL be typed with a TypeScript interface for its props.

### Requirement 10: Prose Component

**User Story:** As a developer, I want a reusable prose wrapper that applies the reading-optimized typography, so that any long-form content section gets consistent styling.

#### Acceptance Criteria

1. THE Prose component SHALL apply Manrope Light at 26px desktop with a line height between 1.5 and 1.8, and `var(--black)` text color.
2. THE Prose component SHALL render headings within prose sections using Pixbob_Bold at section heading size (48px desktop).
3. THE Prose component SHALL scale text responsively — body prose and headings SHALL render smaller at 320px than at 1440px.
4. THE Prose component SHALL be typed with a TypeScript interface for its props.

### Requirement 11: RPG Selector Component

**User Story:** As a developer, I want a reusable `>` prefix component that gives list items the site's RPG character.

#### Acceptance Criteria

1. THE RPG_Selector component SHALL render a `>` character in Pixbob_Regular at 36–44px desktop, in `var(--black)`.
2. THE RPG_Selector component SHALL accept an optional `className` prop for sizing overrides.
3. THE RPG_Selector component text size SHALL scale proportionally when the parent container's font size changes.

### Requirement 12: Stat Bar Component

**User Story:** As a developer, I want a reusable stat bar component that visualizes a 1–5 rating, so that agent profiles and similar contexts can display ratings consistently.

#### Acceptance Criteria

1. THE Stat_Bar component SHALL render 5 stacked rectangles (filled or empty based on a value from 1 to 5).
2. EACH filled rectangle SHALL use `var(--lime)` background with `border-2 border-black`. EACH empty rectangle SHALL use `var(--white)` background with `border-2 border-black`.
3. THE Stat_Bar component SHALL display a label below the bar in Pixbob_Regular at 28–34px desktop.
4. THE Stat_Bar component SHALL accept `label` (string) and `value` (number, 1–5) props.
5. THE Design_System SHALL provide a StatBarGroup wrapper that renders multiple Stat_Bars side by side with a gap of 8–12px between bars.
6. THE Stat_Bar component SHALL expose an `aria-label` in the format "{label}: {value} out of 5".
7. THE Stat_Bar component SHALL be typed with a TypeScript interface for its props.

### Requirement 13: Blockquote Component

**User Story:** As a developer, I want a reusable styled blockquote component for pull-quotes in prose content.

#### Acceptance Criteria

1. THE Blockquote component SHALL render with `var(--violet)` background, a left border accent in `var(--accent)`, and Pixbob_Regular text in white.
2. THE Blockquote component SHALL maintain a minimum contrast ratio of 3:1 between text and background, meeting WCAG AA for large text (≥24px regular or ≥18.66px bold). Blockquote text sizes SHALL remain at or above 24px at all breakpoints to satisfy this threshold.
3. THE Blockquote component SHALL be typed with a TypeScript interface for its props.

### Requirement 14: Pixel Image Component

**User Story:** As a developer, I want a reusable component for rendering pixel-art assets at crisp integer scales, so that sprites and pixel illustrations display without blur.

#### Acceptance Criteria

1. THE PixelImage component SHALL apply Pixel_Rendering to prevent anti-aliasing.
2. THE PixelImage component SHALL accept `src`, `scale` (2×, 3×, 4×), `alt`, and optional `className` props.
3. THE PixelImage component SHALL render sprites at Integer_Scale — the displayed dimensions SHALL be whole-number multiples of the source frame dimensions.
4. THE PixelImage component SHALL require a non-empty `alt` string prop.
5. THE PixelImage component SHALL be typed with a TypeScript interface for its props.

### Requirement 15: Design Tokens TypeScript Module

**User Story:** As a developer, I want design token values accessible in TypeScript, so that future programmatic consumers (e.g., Phaser world engine) can reference the same values without parsing CSS.

#### Acceptance Criteria

1. THE Design_Tokens_Module SHALL export named constants for all 8 color values.
2. THE Design_Tokens_Module SHALL export named constants for border widths (3px, 5px, 10px).
3. THE Design_Tokens_Module SHALL export named constants for container widths and key spacing values.
4. THE Design_Tokens_Module SHALL be located at `src/lib/design-tokens.ts`.
5. THE Design_Tokens_Module values SHALL match the CSS custom property values defined in Requirement 1 and Requirement 4, and THE system SHALL define a documented synchronization strategy to prevent drift between the TypeScript module and CSS custom properties.

### Requirement 16: Build Integrity

**User Story:** As a developer, I want the design system to compile cleanly, so that the foundation doesn't introduce build errors.

#### Acceptance Criteria

1. THE project SHALL compile without errors via `pnpm build` after all design system changes.
2. ALL base UI components SHALL be typed with TypeScript interfaces for their props.

### Requirement 17: Responsive Integrity

**User Story:** As a visitor on any device, I want the design system components to produce no broken layouts or horizontal overflow from 320px to desktop, so that no breakpoint degrades the experience.

#### Acceptance Criteria

1. THE site SHALL render without horizontal scrolling on viewports from 320px width and above.
2. ALL layout tokens that specify responsive behavior SHALL produce values within their defined 30–60% scaling range at 375px (per Requirement 4 AC 2).
3. ALL typographic sizes above body prose SHALL render smaller at 320px than at 1440px (per Requirement 3 AC 2).

### Requirement 18: Accessibility Baseline

**User Story:** As a visitor using assistive technology, I want the design system components to be accessible by default, so that the site is usable regardless of how I interact with it.

#### Acceptance Criteria

1. ALL interactive components (Button, CTA_Banner, clickable Collection_Row items, Cross_Links links) SHALL inherit the global Focus_Treatment defined in Requirement 1 AC 5.
2. THE font loading strategy SHALL produce no FOIT — all four fonts SHALL be visible immediately via fallback, then swap when loaded.
3. ALL PixelImage instances SHALL require a non-empty `alt` string.
4. THE Stat_Bar component SHALL expose an `aria-label` in the format "{label}: {value} out of 5".
