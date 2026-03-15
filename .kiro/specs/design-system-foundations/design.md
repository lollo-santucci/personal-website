# Design Document: Design System Foundations

## Overview

This design establishes the visual language for the classic view: color palette, typography (Pixbob pixel font family + Manrope for prose), spacing tokens, border conventions, and a base component library. The source of truth is CSS custom properties defined via Tailwind CSS v4's `@theme` directive in `globals.css`. A supplementary TypeScript module exports the same values for programmatic consumers (e.g., future Phaser world engine).

The current site (Specs 5–7) uses minimal Tailwind styling with neutral grays, system fonts, and `border-radius` on cards. This spec replaces that with the approved Figma design: 8-color palette, Pixbob font family for UI chrome, Manrope Light for prose, heavy black borders with sharp corners, and RPG-flavored interaction patterns.

All base UI components live in `src/components/ui/` and reference theme tokens exclusively — zero hardcoded hex or pixel values in component markup. Existing card components (ProjectCard, BlogPostCard, AgentCard, StatusBadge) are NOT modified by this spec — their redesign and migration to the new component system is deferred to Spec 09 (Design System Application).

## Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────┐
│  Components (src/components/ui/)                     │
│  Button, Badge, SectionLabel, CollectionContainer,   │
│  CollectionRow, CTABanner, CrossLinks, Prose,        │
│  RPGSelector, StatBar, Blockquote, PixelImage        │
│  → consume Tailwind utilities referencing theme       │
├─────────────────────────────────────────────────────┤
│  Tailwind Theme Layer (@theme in globals.css)        │
│  Semantic colors, font families, spacing tokens      │
│  → references CSS custom properties                  │
├─────────────────────────────────────────────────────┤
│  CSS Custom Properties (:root in globals.css)        │
│  --white, --black, --accent, --violet, --blue,       │
│  --lime, --green, --muted + layout tokens            │
│  → single source of truth                            │
├─────────────────────────────────────────────────────┤
│  Design Tokens TS Module (src/lib/design-tokens.ts)  │
│  Named constants mirroring CSS values                │
│  → supplementary, for programmatic consumers         │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. CSS custom properties defined in `:root` block in `globals.css`
2. `@theme` block in `globals.css` maps CSS custom properties to Tailwind token names (e.g., `--color-primary: var(--accent)`)
3. Components use Tailwind utility classes (`bg-primary`, `text-surface`, `font-pixbob-bold`, `px-page-px`) that resolve to the theme tokens
4. `design-tokens.ts` exports the same literal values as named TS constants — kept in sync via a documented manual strategy with inline comments referencing the CSS source

### Tailwind v4 Configuration Approach

Tailwind CSS v4 uses CSS-based configuration. There is no `tailwind.config.ts`. All theme customization happens via `@theme` blocks in CSS files.

#### Tokens registered via `@theme` (generate named Tailwind utilities)

These tokens are registered in the `@theme` block and produce first-class Tailwind utilities (e.g., `bg-primary`, `font-pixbob-bold`, `border-standard`):

- **Colors**: `--color-primary`, `--color-secondary`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-blue`, `--color-lime`, `--color-green`
- **Font families**: `--font-pixbob-bold`, `--font-pixbob-regular`, `--font-pixbob-lite`, `--font-manrope`
- **Border widths**: `--border-standard: 3px`, `--border-collection: 10px`, `--border-frame: 5px`
- **Spacing**: `--spacing-page-px: 100px`, `--spacing-page-pt: 50px`, `--spacing-section-gap: 60px`, `--spacing-collection-px: 40px`, `--spacing-collection-py: 25px`, `--spacing-card-gap: 25px`, `--spacing-crosslink-gap: 50px`
- **Container widths**: `--width-content-max: 1312px`

```css
/* globals.css — @theme block (excerpt) */
@theme {
  --color-primary: var(--accent);
  --color-secondary: var(--violet);
  --color-surface: var(--white);
  --color-text: var(--black);
  --color-border: var(--black);
  --font-pixbob-bold: 'Pixbob Bold', monospace;
  --border-standard: 3px;
  --spacing-page-px: 100px;
  --width-content-max: 1312px;
  /* ... full list above */
}
```

Components use named utilities: `bg-primary`, `text-secondary`, `font-pixbob-bold`, `border-standard`, `px-page-px`, `max-w-content-max`.

#### Values consumed via Tailwind arbitrary value syntax

Typographic sizes at the `xl` breakpoint use arbitrary values (e.g., `xl:text-[128px]`) because Tailwind v4's `@theme` does not generate font-size utilities from custom `--font-size-*` tokens in the same way as colors or spacing. The small/medium breakpoints use standard Tailwind size classes (`text-xl`, `text-2xl`, etc.).

This means:
- **Colors, fonts, borders, spacing, widths** → named theme utilities (no arbitrary values in component markup)
- **Typography at xl breakpoint** → arbitrary values (`xl:text-[128px]`) because these are one-off Figma-derived sizes that don't map cleanly to Tailwind's built-in scale
- **Collection container mobile border** → responsive override `md:border-collection` with `border-[6px]` at mobile (the 6px mobile value is not worth a separate token)

## Components and Interfaces

### Font Loading (layout.tsx)

Four fonts loaded in the root layout:

- **Pixbob Bold**: `next/font/local` from `public/assets/fonts/pixbob-bold.ttf`, `display: 'swap'`, CSS variable `--font-pixbob-bold`
- **Pixbob Regular**: `next/font/local` from `public/assets/fonts/pixbob-regular.ttf`, `display: 'swap'`, CSS variable `--font-pixbob-regular`
- **Pixbob Lite**: `next/font/local` from `public/assets/fonts/pixbob-lite.ttf`, `display: 'swap'`, CSS variable `--font-pixbob-lite`
- **Manrope**: `next/font/google` with weight `'300'`, `display: 'swap'`, CSS variable `--font-manrope`

All four CSS variables are applied to `<html>` via className concatenation. The `@theme` block in `globals.css` maps these variables to Tailwind font family tokens.

`display: 'swap'` ensures no FOIT — text renders immediately with a fallback font, then swaps when the custom font loads.

### Global Styles (globals.css)

The `globals.css` file is restructured into three sections:

1. **Tailwind imports and plugins**: `@import 'tailwindcss'`, `@source`, `@plugin "@tailwindcss/typography"`
2. **CSS custom properties**: `:root` block with all 8 color tokens + layout spacing tokens
3. **`@theme` block**: Maps CSS custom properties to Tailwind semantic tokens (colors, fonts, spacing)
4. **`@layer base`**: Global resets and base styles (body, selection, focus-visible, border-radius reset, smooth scroll, pixel-art utility)

### Base UI Components

All components are React server components by default (no `'use client'` unless interactivity is needed). Each accepts typed props via a TypeScript interface. All color and spacing values reference Tailwind theme tokens.

#### Button

- Renders as `<a>` when `href` is provided, `<button>` otherwise
- Props: `variant` (`'primary' | 'secondary' | 'dark'`), `size` (`'sm' | 'md' | 'lg'`), `href?`, `icon?` (React node, defaults to arrow-up-right SVG), `showIcon?` (boolean, defaults to `true`), `children`, `className?`, plus native button/anchor attributes
- Visual: `border-standard border-black` (resolves to 3px via theme token), no border-radius, Pixbob Regular font
- Variant colors: primary = accent bg + white text, secondary = white bg + black text, dark = black bg + white text
- Size maps to text size and padding via Tailwind responsive classes
- Inherits global Focus_Treatment via `:focus-visible`

#### Badge

- Props: `variant` (`'accent' | 'violet' | 'blue' | 'green' | 'lime' | 'dark'`), `children`, `className?`
- Visual: `border-standard border-black`, no border-radius, Pixbob Regular at badge size
- All variants use white text except `lime` which uses black text

#### SectionLabel

- Same visual structure and variant system as Badge
- Props: `variant`, `as?` (`'h2' | 'h3' | 'h4' | 'span'`, defaults to `'span'`), `children`, `className?`
- Semantically distinct from Badge: used to introduce content sections rather than tag items
- The `as` prop controls the rendered HTML element. When used as a section header, callers pass `as="h2"` or `as="h3"`. When used as a decorative label without heading semantics, the default `<span>` is appropriate
- Visual styling is identical regardless of the `as` value — the prop controls semantics only

#### CollectionContainer

- Props: `children`, `className?`
- Visual: `border-collection border-black` (desktop, resolves to 10px via theme token), reduced to `border-[6px]` below 768px via responsive override (`border-[6px] md:border-collection`), no border-radius, no background (inherits surface), internal padding from layout tokens (`px-collection-px`, `py-collection-py` at xl)

#### CollectionRow

- Props: `children` (left content area), `action?` (React node for right side), `className?`
- Visual: flex row, `justify-between`, `items-center`, `gap-card-gap`
- Left side: `flex-1 min-w-0` — accepts arbitrary children (date, title, badge, sprite). `min-w-0` enables text truncation within flex children when the row is constrained
- Right side: `flex-shrink-0` — accepts an optional action element (typically a Button). The action area never shrinks; the left content area absorbs overflow
- Overflow strategy: the left content area clips overflow via `overflow-hidden`. Individual children within the left area are responsible for their own truncation (e.g., `truncate` on a title). The CollectionRow itself does not truncate — it provides the flex context for children to truncate within
- Mobile: remains a single horizontal row at all viewport widths. No wrapping (`flex-nowrap`). The action slot maintains its intrinsic width; the content area shrinks

#### CTABanner

- Props: `headline`, `body`, `href`, `className?`
- Visual: violet background, `border-standard border-black`, no border-radius
- Content: headline in Pixbob Bold, body in Pixbob Regular, arrow-up-right icon, all white text
- Renders as an anchor element wrapping the content (the entire banner is clickable)
- Inherits global Focus_Treatment

#### CrossLinks

- Props: `sections` (array of 2 section objects, each with `title`, `href`, `items` array)
- Each item: `{ label: string; href: string }`
- Visual: two-column grid (stacks on mobile), each column has a section title in Pixbob Bold with arrow icon, followed by bordered item links in Pixbob Regular
- Item links: `border-standard border-black`, white background, arrow-up-right icon

#### Prose

- Props: `children`, `className?`
- Wraps content in a `<div>` with Tailwind typography plugin classes customized for Manrope Light at body prose size
- Headings within prose use Pixbob Bold at section heading size
- Responsive text sizing via Tailwind responsive classes

#### RPGSelector

- Props: `className?`
- Renders a `>` character in Pixbob Regular, sized to match parent context
- Accepts className for sizing overrides
- Inline element, used as a prefix before list items

#### StatBar

- Props: `label`, `value` (1–5), `className?`
- Renders 5 stacked rectangles: filled (lime bg, `border-2 border-black`) or empty (white bg, `border-2 border-black`)
- Label below in Pixbob Regular
- `aria-label="{label}: {value} out of 5"` for accessibility
- **StatBarGroup**: wrapper component, props: `children`, `className?` — renders children in a flex row with gap

#### Blockquote

- Props: `children`, `className?`
- Visual: violet background, left border accent in accent color, Pixbob Regular text in white
- Contrast: white text (#fffdfa) on violet background (#b87dfe) yields a contrast ratio of approximately 3.2:1. This does not meet WCAG AA for normal text (4.5:1) but meets WCAG AA for large text (3:1 threshold). Pixbob Regular at the sizes used in Blockquote (≥24px) qualifies as large text per WCAG definition (≥18.66px bold or ≥24px regular). If Blockquote is ever used at smaller sizes, the contrast would need to be re-evaluated. This is a specific contrast assessment for this color pair at these sizes, not a full WCAG compliance claim

#### PixelImage

- Props: `src`, `scale` (`2 | 3 | 4`), `alt` (required, non-empty string), `width`, `height`, `className?`
- Applies `image-rendering: pixelated` via the `.pixel-art` utility class
- Computes displayed dimensions as `width * scale` × `height * scale` (integer scaling)
- `width` and `height` represent the source frame dimensions in pixels

### Arrow Icon

The arrow-up-right (↗) icon is used across multiple components (Button, CTABanner, CrossLinks). It is implemented as an inline SVG component at `src/components/ui/ArrowUpRight.tsx` to avoid external asset dependencies. Props: `className?` for sizing.


## Data Models

### Color Tokens

| CSS Custom Property | Value | Tailwind Semantic Token | Usage |
|---|---|---|---|
| `--white` | `#fffdfa` | `surface` | Page/card backgrounds |
| `--black` | `#222222` | `text`, `border` | Primary text, all borders |
| `--accent` | `#fc5c46` | `primary` | CTA buttons, "New" badges, accent highlights |
| `--violet` | `#b87dfe` | `secondary` | CTA banners, tech badges |
| `--blue` | `#467afc` | `blue` | Section labels, tech badges |
| `--lime` | `#cbfd00` | `lime` | Stat bar fills, section labels |
| `--green` | `#00cf00` | `green` | Tech badges, success states |
| `--muted` | `#9a9997` | `text-muted` | Dates, index numbers, secondary text |

### Font Family Tokens

| CSS Variable | Tailwind Token | Font | Weight | Source |
|---|---|---|---|---|
| `--font-pixbob-bold` | `font-pixbob-bold` | Pixbob Bold | — | `next/font/local` |
| `--font-pixbob-regular` | `font-pixbob-regular` | Pixbob Regular | — | `next/font/local` |
| `--font-pixbob-lite` | `font-pixbob-lite` | Pixbob Lite | — | `next/font/local` |
| `--font-manrope` | `font-manrope` | Manrope | 300 (Light) | `next/font/google` |

### Typographic Scale

Desktop reference values. Small/medium breakpoints use standard Tailwind size classes. The `xl` breakpoint uses arbitrary values for Figma-derived sizes that don't map to Tailwind's built-in scale.

| Role | Font Family | Desktop Size | Tailwind Approach |
|---|---|---|---|
| Page title | Pixbob Bold | 128px | `text-5xl md:text-7xl xl:text-[128px]` |
| Project title | Pixbob Bold | 60px | `text-3xl md:text-4xl xl:text-[60px]` |
| Section heading | Pixbob Bold | 48px | `text-2xl md:text-3xl xl:text-[48px]` |
| Logo | Pixbob Bold | 48px | `text-2xl md:text-3xl xl:text-[48px]` |
| Collection item | Pixbob Regular | 48px | `text-xl md:text-2xl xl:text-[48px]` |
| CTA headline | Pixbob Bold | 40px | `text-xl md:text-2xl xl:text-[40px]` |
| CTA body / card text | Pixbob Regular | 36px | `text-lg md:text-xl xl:text-[36px]` |
| Button / label | Pixbob Regular | 32–40px | Size-dependent responsive classes |
| Footer / subtitle | Pixbob Lite | 32px | `text-lg md:text-xl xl:text-[32px]` |
| Badge | Pixbob Regular | 22px | `text-sm md:text-base xl:text-[22px]` |
| Body prose | Manrope Light | 26px | `text-base md:text-lg xl:text-[26px]` |

Note: the `xl:text-[Npx]` arbitrary values are the only place hardcoded pixel values appear in component className strings. These are intentional — see Property 1 permitted exceptions.

### Layout Tokens

Defined as CSS custom properties in `:root` and registered as Tailwind spacing tokens via `@theme`. Components use named utilities at the `xl` breakpoint and standard Tailwind scale classes at smaller breakpoints for responsive scaling.

| Token | Desktop Value | Mobile (~375px) | Tailwind Approach |
|---|---|---|---|
| `page-px` | 100px | ~24px | `px-6 md:px-12 xl:px-page-px` |
| `page-pt` | 50px | ~20px | `pt-5 md:pt-8 xl:pt-page-pt` |
| `section-gap` | 60px | ~32px | `gap-8 md:gap-12 xl:gap-section-gap` |
| `content-max-w` | 1312px | full width | `max-w-content-max mx-auto` |
| `collection-px` | 40px | ~16px | `px-4 md:px-6 xl:px-collection-px` |
| `collection-py` | 25px | ~16px | `py-4 md:py-5 xl:py-collection-py` |
| `card-gap` | 25px | ~12px | `gap-3 md:gap-5 xl:gap-card-gap` |
| `crosslink-gap` | 50px | stacks | `gap-6 md:gap-8 xl:gap-crosslink-gap` |

The small/medium breakpoint values (`px-6`, `gap-8`, etc.) use Tailwind's built-in spacing scale as approximations of the responsive target. The `xl` breakpoint uses the registered theme token for the exact Figma value.

### Border Width Tokens

Fixed values (do not scale responsively), except collection container which reduces on mobile.

| Token | Value | Usage |
|---|---|---|
| `border-standard` | 3px | Interactive elements (buttons, badges, cards, CTA) |
| `border-collection` | 10px (desktop), 6px (mobile) | Collection containers |
| `border-frame` | 5px | Image frames |

### Button Variant Map

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `var(--accent)` | white | `border-standard border-black` |
| `secondary` | `var(--white)` | `var(--black)` | `border-standard border-black` |
| `dark` | `var(--black)` | white | `border-standard border-black` |

### Button Size Map

| Size | Text Size (responsive) | Padding |
|---|---|---|
| `sm` | `text-sm md:text-base xl:text-[22px]` | `px-3 py-1 md:px-3 md:py-1.5` |
| `md` | `text-lg md:text-xl xl:text-[36px]` | `px-4 py-1.5 md:px-5 md:py-3` |
| `lg` | `text-xl md:text-2xl xl:text-[40px]` | `px-5 py-2 md:px-6 md:py-3` |

### Badge Variant Map

| Variant | Background | Text |
|---|---|---|
| `accent` | `var(--accent)` | white |
| `violet` | `var(--violet)` | white |
| `blue` | `var(--blue)` | white |
| `green` | `var(--green)` | white |
| `lime` | `var(--lime)` | `var(--black)` |
| `dark` | `var(--black)` | white |

### Design Tokens TypeScript Module

Located at `src/lib/design-tokens.ts`. Exports named constants organized by category:

```typescript
// Colors — must match :root CSS custom properties in globals.css
export const colors = {
  white: '#fffdfa',
  black: '#222222',
  accent: '#fc5c46',
  violet: '#b87dfe',
  blue: '#467afc',
  lime: '#cbfd00',
  green: '#00cf00',
  muted: '#9a9997',
} as const;

// Border widths in pixels
export const borderWidths = {
  standard: 3,
  collection: 10,
  frame: 5,
} as const;

// Container widths in pixels
export const containerWidths = {
  contentMax: 1312,
} as const;

// Spacing reference values (desktop) in pixels
export const spacing = {
  pagePx: 100,
  pagePt: 50,
  sectionGap: 60,
  collectionPx: 40,
  collectionPy: 25,
  cardGap: 25,
  crosslinkGap: 50,
} as const;
```

### Sync Strategy: CSS ↔ TypeScript Drift Prevention

The CSS custom properties in `globals.css` are the single source of truth. The TypeScript module (`design-tokens.ts`) is a supplementary mirror for programmatic consumers.

Drift prevention strategy:
1. Each value in `design-tokens.ts` has an inline comment referencing the CSS source: `// sync: globals.css :root --accent`
2. A unit test in the test suite validates that the TS module values match the expected literal values (the test acts as a change detector — if someone updates CSS but not TS, the test fails)
3. The design document and task list explicitly call out the sync requirement

This is a manual sync strategy with automated drift detection. A build-time code generation approach was considered but rejected as over-engineering for 8 colors + a handful of spacing values.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: No hardcoded color values and no unnecessary hardcoded pixel values in component markup

*For any* component file in `src/components/ui/`, the JSX/TSX markup shall contain zero hardcoded hex color values (e.g., `#fc5c46`) in className strings or inline styles. All color references must use Tailwind theme tokens (e.g., `bg-primary`, `text-surface`) or CSS variable references (e.g., `var(--accent)`).

For pixel values: components shall not use hardcoded pixel values in className strings where a registered theme token exists. Permitted exceptions:
- Tailwind arbitrary values at responsive breakpoints for typographic sizes (e.g., `xl:text-[128px]`) — these are Figma-derived one-off sizes not registered as theme tokens
- The collection container mobile border override (`border-[6px]`) — a responsive variant of the registered `border-collection` token
- Tailwind's built-in utility classes that happen to resolve to pixel values (e.g., `border-2`, `gap-3`, `px-4`) — these are standard Tailwind scale values, not hardcoded pixels
- SVG intrinsic dimensions (e.g., `width="16" height="16"` on the ArrowUpRight icon)
- PixelImage computed dimensions (integer-scaled `width` and `height` attributes)

The test for this property scans for raw hex patterns (`#[0-9a-fA-F]{3,8}`) and flags them. It does NOT flag Tailwind arbitrary value syntax or standard utility classes.

**Validates: Requirements 1.9, 4.4**

### Property 2: Button element type determined by href

*For any* non-empty string `href`, the Button component shall render an `<a>` element. *For any* render without an `href` prop (or `href` is undefined), the Button component shall render a `<button>` element.

**Validates: Requirements 5.5**

### Property 3: Button accessible name

*For any* non-empty children text passed to the Button component, the rendered element shall have an accessible name that includes that text.

**Validates: Requirements 5.7**

### Property 4: StatBar filled and empty rectangle count

*For any* integer value `v` where 1 ≤ v ≤ 5, the StatBar component shall render exactly `v` filled rectangles (lime background) and exactly `5 - v` empty rectangles (white background).

**Validates: Requirements 12.1, 12.2**

### Property 5: StatBar aria-label format

*For any* string `label` and integer `value` where 1 ≤ value ≤ 5, the StatBar component shall expose an `aria-label` attribute equal to `"{label}: {value} out of 5"`.

**Validates: Requirements 12.6, 18.4**

### Property 6: PixelImage integer scaling

*For any* source dimensions `(width, height)` where both are positive integers, and *for any* scale factor in `{2, 3, 4}`, the PixelImage component shall render with displayed dimensions `(width × scale, height × scale)`.

**Validates: Requirements 14.3**

### Property 7: PixelImage non-empty alt requirement

*For any* render of the PixelImage component, the `alt` attribute on the rendered `<img>` element shall be a non-empty string.

**Validates: Requirements 14.4, 18.3**

## Error Handling

### Font Loading Failures

If a custom font file fails to load, `next/font` with `display: 'swap'` ensures the fallback font (monospace for Pixbob family, sans-serif for Manrope) remains visible. No FOIT occurs. The site remains fully functional with degraded typography.

### Invalid StatBar Values

The StatBar component types `value` as `number` (not a union literal) to accommodate values computed at runtime (e.g., from content data). Out-of-range handling:

- Values < 1 are clamped to 1; values > 5 are clamped to 5
- Non-integer values are rounded via `Math.round()` before clamping
- The aria-label always reflects the clamped/rounded value

**Rationale for clamping over strict typing or throwing:** StatBar values come from content YAML files via the content loader, which does not validate numeric ranges (per content loader validation scope decision). A strict `1 | 2 | 3 | 4 | 5` union type would require runtime validation at the content boundary, which is out of scope for this spec. Clamping is the pragmatic choice: the component renders something reasonable, and the drift-detection unit test for content data (Spec 4) catches invalid values at test time. A `console.warn` in development mode when clamping occurs would be a reasonable addition but is not required by this spec.

### Invalid PixelImage Scale

The PixelImage component accepts `scale` typed as `2 | 3 | 4`. TypeScript enforces valid values at compile time. If a non-integer scale somehow reaches runtime, the component still renders — the image may appear slightly blurred but won't break.

### Missing Icon

The ArrowUpRight inline SVG component has no external dependencies. If a component expects an icon prop and none is provided, the default (ArrowUpRight) is used. If `showIcon` is `false`, no icon renders.

### Empty Children

Components that accept `children` (Badge, SectionLabel, Prose, CollectionContainer, CollectionRow) render whatever children are passed, including empty content. No special error handling — empty children produce empty visual output, which is valid.

## Testing Strategy

### Dual Testing Approach

This spec uses both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and rendering behavior for each component. Cover the fixed-domain acceptance criteria (color token values, font configuration, variant rendering, layout structure).
- **Property-based tests**: Verify universal properties that hold across all valid inputs. Cover the properties defined in the Correctness Properties section above.

### Unit Test Coverage

Each base UI component gets a test file in `src/__tests__/components/ui/`:

| Test File | Covers |
|---|---|
| `Button.test.tsx` | Variant rendering, size rendering, icon rendering, href→anchor / no-href→button (examples), accessible name |
| `Badge.test.tsx` | All 6 color variants, border and font classes |
| `SectionLabel.test.tsx` | Variant rendering, structural similarity to Badge |
| `CollectionContainer.test.tsx` | Border class, padding classes, children rendering |
| `CollectionRow.test.tsx` | Flex layout, children + action slot rendering |
| `CTABanner.test.tsx` | Violet background, headline/body/href rendering, anchor element, accessible name |
| `CrossLinks.test.tsx` | Two-column structure, section titles, item links with icons |
| `Prose.test.tsx` | Manrope font class, typography plugin classes |
| `RPGSelector.test.tsx` | Renders `>` character, font class, className override |
| `StatBar.test.tsx` | Filled/empty counts for each value 1-5, label rendering, aria-label format |
| `Blockquote.test.tsx` | Violet background, accent left border, white text |
| `PixelImage.test.tsx` | pixel-art class, integer scaling dimensions, alt attribute |

Additional unit tests:

| Test File | Covers |
|---|---|
| `src/__tests__/lib/design-tokens.test.ts` | All exported color values match expected hex, border widths match, spacing values match |

### Property-Based Test Coverage

Property-based tests use `fast-check` (already installed). Each test runs minimum 100 iterations.

| Test File | Property | Tag |
|---|---|---|
| `src/__tests__/components/ui/Button.pbt.test.tsx` | Properties 2, 3 | Feature: design-system-foundations, Property 2/3 |
| `src/__tests__/components/ui/StatBar.pbt.test.tsx` | Properties 4, 5 | Feature: design-system-foundations, Property 4/5 |
| `src/__tests__/components/ui/PixelImage.pbt.test.tsx` | Properties 6, 7 | Feature: design-system-foundations, Property 6/7 |
| `src/__tests__/components/ui/no-hardcoded-values.test.ts` | Property 1 | Feature: design-system-foundations, Property 1 |

Property 1 (no hardcoded color values) is implemented as a file-scanning test that reads all `src/components/ui/*.tsx` files and checks for hex color patterns (`#[0-9a-fA-F]{3,8}`) in the file content. It does not flag Tailwind arbitrary value syntax (`text-[128px]`), standard Tailwind utility classes, SVG dimensions, or computed PixelImage dimensions — only raw hex color codes. While not a traditional PBT with random generation, it validates a universal property across all component files.

### Property-Based Testing Configuration

- Library: `fast-check` v4 (already in devDependencies)
- Minimum iterations: 100 per property test
- Each test tagged with: `Feature: design-system-foundations, Property {number}: {property_text}`
- Each correctness property implemented by a single property-based test
- Component tests use `// @vitest-environment jsdom` for DOM rendering

### Test Environment

- Vitest as test runner (already configured)
- `@testing-library/react` for component rendering
- `jsdom` environment for component tests (per-file `// @vitest-environment jsdom` directive)
- `fast-check` for property-based test generation

## Key Design Decisions

### 1. Tailwind v4 CSS-based configuration (no tailwind.config.ts)

Tailwind CSS v4 uses `@theme` blocks in CSS files instead of a JavaScript config file. All theme customization (colors, fonts, spacing) is defined in `globals.css`. This is the correct approach for the installed Tailwind version (^4).

### 2. CSS custom properties as single source of truth

Color tokens and layout values are defined as CSS custom properties in `:root`, then referenced by the `@theme` block. This allows both Tailwind utilities and raw CSS to access the same values. The TypeScript module mirrors these values for programmatic consumers but is not the source of truth.

### 3. Responsive scaling via Tailwind responsive classes (not clamp())

Typography and spacing use Tailwind's responsive breakpoint classes rather than CSS `clamp()`. Rationale: Tailwind responsive classes are more explicit, easier to debug, and align with the project's Tailwind-first approach. The breakpoint values provide clear control points rather than continuous fluid scaling.

### 4. Token registration strategy: named utilities vs arbitrary values

All colors, font families, border widths, spacing values, and container widths are registered in the `@theme` block and produce named Tailwind utilities (e.g., `bg-primary`, `border-standard`, `px-page-px`, `max-w-content-max`). Components use these named utilities wherever possible.

Typographic sizes at the `xl` breakpoint are the exception — they use Tailwind arbitrary value syntax (e.g., `xl:text-[128px]`) because these are one-off Figma-derived sizes that don't map to Tailwind's built-in font-size scale and registering 11 custom font-size tokens would add complexity without proportional benefit. The small/medium breakpoints use standard Tailwind size classes (`text-xl`, `text-2xl`, etc.).

The collection container mobile border (`border-[6px]`) is the only other arbitrary pixel value — a responsive variant of the registered `border-collection` token that isn't worth a separate token for a single mobile override.

### 5. Font loading via next/font with display: 'swap'

All four fonts use `next/font` (local for Pixbob family, Google for Manrope) with `display: 'swap'`. This ensures no FOIT — text is immediately visible with fallback fonts, then swaps when custom fonts load. CSS variables are applied to `<html>` and referenced in the `@theme` block.

### 6. Components in src/components/ui/ subdirectory

New base UI components go in `src/components/ui/` to separate them from existing page-level components in `src/components/`. Existing components (ProjectCard, BlogPostCard, AgentCard, StatusBadge, Header, Footer) remain untouched — their migration is Spec 09.

### 7. Manual sync strategy for CSS ↔ TypeScript drift

A unit test validates that `design-tokens.ts` values match expected literals. This is simpler than build-time code generation and sufficient for the small number of tokens (~20 values). Inline comments in the TS file reference the CSS source.

### 8. ArrowUpRight as inline SVG component

The arrow-up-right icon is used in Button, CTABanner, and CrossLinks. Rather than loading an external SVG file, it's implemented as a React component with an inline SVG. This avoids asset loading issues and keeps the icon co-located with the components that use it.

### 9. Blockquote contrast ratio

White text (#fffdfa) on violet background (#b87dfe) yields approximately 3.2:1 contrast. This meets WCAG AA for large text (≥3:1 threshold) but not for normal text (≥4.5:1). Pixbob Regular at the sizes used in Blockquote (≥24px) qualifies as large text per WCAG. If Blockquote is used at smaller sizes in the future, the contrast must be re-evaluated — either by increasing font size or choosing a darker background. This is a specific contrast assessment, not a full WCAG compliance claim.

### 10. Existing components untouched

Per the scope boundary, this spec does NOT modify ProjectCard, BlogPostCard, AgentCard, StatusBadge, Header, or Footer. Those components continue to use their current styling. Spec 09 handles their migration to the new design system.

### 11. StatBar clamping over strict typing

StatBar accepts `value: number` and clamps to 1–5 rather than using a strict `1 | 2 | 3 | 4 | 5` union type. Rationale: values come from content YAML via the content loader, which validates field presence and type but not numeric ranges. A strict union would require runtime validation at the content boundary (out of scope). Clamping ensures the component always renders something reasonable. Content data correctness is caught by seed validation tests (Spec 4), not by the component itself.

## Alignment with Steering

### Naming Conventions
- Component files: PascalCase (`Button.tsx`, `StatBar.tsx`) per `structure.md`
- Utility files: camelCase (`design-tokens.ts`) per `structure.md`
- CSS custom properties: kebab-case (`--accent`, `--page-px`)

### Import Patterns
- All components use `@/` alias for `src/` imports per `structure.md`
- Components import from `@/components/ui/`, never from `@/world/`
- No Phaser imports in any component

### File Placement
- Base UI components: `src/components/ui/` (new subdirectory)
- Design tokens: `src/lib/design-tokens.ts`
- Global styles: `src/styles/globals.css` (existing, modified)
- Font loading: `src/app/layout.tsx` (existing, modified)

### Server/Client Boundaries
- All base UI components are React Server Components (no `'use client'`)
- No interactivity needed — these are presentational components
- HeaderNav remains the only client component (already `'use client'`)

### Testing Conventions
- Test files in `src/__tests__/components/ui/` mirroring component structure
- Per-file `// @vitest-environment jsdom` for component tests
- `fast-check` for property-based tests (already installed)
- Vitest as runner (`vitest run`)

## File Map

### Files Created

| Path | Purpose |
|---|---|
| `src/components/ui/ArrowUpRight.tsx` | Inline SVG arrow-up-right icon component |
| `src/components/ui/Button.tsx` | Button component (anchor or button, 3 variants, 3 sizes) |
| `src/components/ui/Badge.tsx` | Colored label component (6 variants) |
| `src/components/ui/SectionLabel.tsx` | Section header label (same variants as Badge) |
| `src/components/ui/CollectionContainer.tsx` | 10px-bordered list container |
| `src/components/ui/CollectionRow.tsx` | Flex row with content + action slot |
| `src/components/ui/CTABanner.tsx` | Violet CTA banner with headline, body, href |
| `src/components/ui/CrossLinks.tsx` | Two-column section links |
| `src/components/ui/Prose.tsx` | Manrope prose wrapper with typography plugin |
| `src/components/ui/RPGSelector.tsx` | `>` prefix character component |
| `src/components/ui/StatBar.tsx` | Vertical 1–5 rating bar + StatBarGroup |
| `src/components/ui/Blockquote.tsx` | Styled violet blockquote |
| `src/components/ui/PixelImage.tsx` | Pixel-art image with integer scaling |
| `src/lib/design-tokens.ts` | TypeScript constants mirroring CSS tokens |

### Files Modified

| Path | Changes |
|---|---|
| `src/styles/globals.css` | Add `:root` color + layout custom properties, `@theme` block with semantic colors/fonts/spacing, global resets (border-radius: 0, selection, focus-visible, smooth scroll, pixel-art class) |
| `src/app/layout.tsx` | Add `next/font/local` imports for Pixbob family, `next/font/google` import for Manrope, apply CSS variables to `<html>` className |

### Files NOT Modified (deferred to Spec 09)

| Path | Reason |
|---|---|
| `src/components/ProjectCard.tsx` | Redesign deferred to Spec 09 |
| `src/components/BlogPostCard.tsx` | Deprecation deferred to Spec 09 |
| `src/components/AgentCard.tsx` | Deprecation deferred to Spec 09 |
| `src/components/StatusBadge.tsx` | Replacement deferred to Spec 09 |
| `src/components/Header.tsx` | Restyling deferred to Spec 09 |
| `src/components/Footer.tsx` | Restyling deferred to Spec 09 |

### Test Files Created

| Path | Purpose |
|---|---|
| `src/__tests__/components/ui/Button.test.tsx` | Unit tests for Button |
| `src/__tests__/components/ui/Button.pbt.test.tsx` | Property tests for Button (Properties 2, 3) |
| `src/__tests__/components/ui/Badge.test.tsx` | Unit tests for Badge |
| `src/__tests__/components/ui/SectionLabel.test.tsx` | Unit tests for SectionLabel |
| `src/__tests__/components/ui/CollectionContainer.test.tsx` | Unit tests for CollectionContainer |
| `src/__tests__/components/ui/CollectionRow.test.tsx` | Unit tests for CollectionRow |
| `src/__tests__/components/ui/CTABanner.test.tsx` | Unit tests for CTABanner |
| `src/__tests__/components/ui/CrossLinks.test.tsx` | Unit tests for CrossLinks |
| `src/__tests__/components/ui/Prose.test.tsx` | Unit tests for Prose |
| `src/__tests__/components/ui/RPGSelector.test.tsx` | Unit tests for RPGSelector |
| `src/__tests__/components/ui/StatBar.test.tsx` | Unit tests for StatBar |
| `src/__tests__/components/ui/StatBar.pbt.test.tsx` | Property tests for StatBar (Properties 4, 5) |
| `src/__tests__/components/ui/Blockquote.test.tsx` | Unit tests for Blockquote |
| `src/__tests__/components/ui/PixelImage.test.tsx` | Unit tests for PixelImage |
| `src/__tests__/components/ui/PixelImage.pbt.test.tsx` | Property tests for PixelImage (Properties 6, 7) |
| `src/__tests__/components/ui/no-hardcoded-values.test.ts` | Property 1: file scanning test |
| `src/__tests__/lib/design-tokens.test.ts` | Design tokens value verification |

### Dependencies

No new dependencies required. All needed packages are already installed:
- `tailwindcss` ^4 (CSS-based config)
- `@tailwindcss/typography` ^0.5.19
- `next` 16.1.6 (includes `next/font`)
- `fast-check` ^4.6.0
- `vitest` ^4.0.18
- `@testing-library/react` ^16.3.2
- `jsdom` ^28.1.0
