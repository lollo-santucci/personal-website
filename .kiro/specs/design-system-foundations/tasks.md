# Implementation Plan: Design System Foundations

## Overview

Implement the design system foundations for the classic view: CSS custom properties, Tailwind v4 `@theme` tokens, font loading, 13 base UI components in `src/components/ui/`, a design tokens TypeScript module, and comprehensive tests. Existing components (ProjectCard, BlogPostCard, etc.) are NOT modified — deferred to Spec 09.

## Tasks

- [x] 1. Global styles, color palette, and theme tokens
  - [x] 1.1 Add CSS custom properties and `@theme` block to `globals.css`
    - Define all 8 color tokens as CSS custom properties in `:root` (`--white`, `--black`, `--accent`, `--violet`, `--blue`, `--lime`, `--green`, `--muted`)
    - Define layout spacing tokens in `:root` (`--page-px`, `--page-pt`, `--section-gap`, `--content-max-w`, `--collection-px`, `--collection-py`, `--card-gap`, `--crosslink-gap`)
    - Add `@theme` block mapping CSS custom properties to Tailwind semantic tokens: colors (`primary`, `secondary`, `surface`, `text`, `text-muted`, `border`, `blue`, `lime`, `green`), font families, border widths (`standard`, `collection`, `frame`), spacing tokens, container widths
    - Register `@plugin "@tailwindcss/typography"` (already installed)
    - _Requirements: 1.1, 1.2, 4.1, 4.3, 4.5_

  - [x] 1.2 Add global base styles in `@layer base`
    - Body background `var(--white)`, color `var(--black)`
    - Text selection with `var(--accent)` background and white text
    - Global focus-visible treatment: `3px solid var(--accent)` outline with 2px offset on all interactive elements
    - Global `border-radius: 0` reset on all elements
    - Smooth scrolling on `html`
    - `.pixel-art` utility class applying `image-rendering: pixelated`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [x] 1.3 Configure font loading in `src/app/layout.tsx`
    - Add `next/font/local` imports for Pixbob Bold, Pixbob Regular, Pixbob Lite from `public/assets/fonts/`
    - Add `next/font/google` import for Manrope weight 300
    - All fonts with `display: 'swap'` for no FOIT
    - Apply all four CSS variables to `<html>` className
    - _Requirements: 2.1, 2.2, 18.2_

- [x] 2. Design tokens TypeScript module
  - [x] 2.1 Create `src/lib/design-tokens.ts`
    - Export `colors` object with all 8 color hex values
    - Export `borderWidths` object (standard: 3, collection: 10, frame: 5)
    - Export `containerWidths` object (contentMax: 1312)
    - Export `spacing` object with all 7 spacing values
    - All objects `as const`, each value with inline sync comment referencing CSS source
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 2.2 Write unit tests for design tokens (`src/__tests__/lib/design-tokens.test.ts`)
    - Verify all 8 color values match expected hex literals
    - Verify border width values match expected numbers
    - Verify spacing and container width values match expected numbers
    - Acts as drift detector between CSS and TS values
    - _Requirements: 15.5_

- [x] 3. Checkpoint — Verify foundation layer
  - Ensure `pnpm build` compiles without errors after globals.css, layout.tsx, and design-tokens changes
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. ArrowUpRight icon and Button component
  - [x] 4.1 Create `src/components/ui/ArrowUpRight.tsx`
    - Inline SVG arrow-up-right icon component
    - Props: `className?` for sizing
    - _Requirements: 5.4 (icon support)_

  - [x] 4.2 Create `src/components/ui/Button.tsx`
    - TypeScript interface for props: `variant` (`'primary' | 'secondary' | 'dark'`), `size` (`'sm' | 'md' | 'lg'`), `href?`, `icon?` (React node), `showIcon?` (boolean, default true), `children`, `className?`, plus native button/anchor attributes
    - Render as `<a>` when `href` provided, `<button>` otherwise
    - Variant colors per design: primary = accent bg + white text, secondary = white bg + black text, dark = black bg + white text
    - Size maps to responsive text size and padding per design's Button Size Map
    - `border-standard border-black`, no border-radius, Pixbob Regular font
    - Default icon: ArrowUpRight
    - Inherits global Focus_Treatment
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 4.3 Write unit tests for Button (`src/__tests__/components/ui/Button.test.tsx`)
    - Test all 3 variants render correct background/text classes
    - Test all 3 sizes render correct text size classes
    - Test icon rendering (default, custom, hidden)
    - Test href→anchor and no-href→button examples
    - Test accessible name from children
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [x] 4.4 Write property tests for Button (`src/__tests__/components/ui/Button.pbt.test.tsx`)
    - **Property 2: Button element type determined by href**
    - **Property 3: Button accessible name**
    - **Validates: Requirements 5.5, 5.7**

- [x] 5. Badge and SectionLabel components
  - [x] 5.1 Create `src/components/ui/Badge.tsx`
    - TypeScript interface: `variant` (`'accent' | 'violet' | 'blue' | 'green' | 'lime' | 'dark'`), `children`, `className?`
    - `border-standard border-black`, no border-radius, Pixbob Regular at badge size
    - All variants white text except `lime` which uses black text
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 5.2 Create `src/components/ui/SectionLabel.tsx`
    - TypeScript interface: `variant`, `as?` (`'h2' | 'h3' | 'h4' | 'span'`, default `'span'`), `children`, `className?`
    - Same visual structure and variant system as Badge
    - `as` prop controls rendered HTML element, visual styling identical regardless
    - _Requirements: 6.3, 6.4_

  - [x] 5.3 Write unit tests for Badge (`src/__tests__/components/ui/Badge.test.tsx`)
    - Test all 6 color variants render correct classes
    - Test lime variant uses black text, others use white
    - Test border and font classes
    - _Requirements: 6.1, 6.2_

  - [x] 5.4 Write unit tests for SectionLabel (`src/__tests__/components/ui/SectionLabel.test.tsx`)
    - Test variant rendering matches Badge visual structure
    - Test `as` prop renders correct HTML element (h2, h3, h4, span)
    - Test default `as` is span
    - _Requirements: 6.3_

- [x] 6. Collection components
  - [x] 6.1 Create `src/components/ui/CollectionContainer.tsx`
    - TypeScript interface: `children`, `className?`
    - `border-[6px] md:border-collection border-black`, no border-radius, no background
    - Internal padding from layout tokens (`px-4 md:px-6 xl:px-collection-px`, `py-4 md:py-5 xl:py-collection-py`)
    - _Requirements: 7.1, 7.4, 7.5_

  - [x] 6.2 Create `src/components/ui/CollectionRow.tsx`
    - TypeScript interface: `children` (left content), `action?` (React node), `className?`
    - Flex row with `justify-between items-center gap-card-gap flex-nowrap`
    - Left side: `flex-1 min-w-0 overflow-hidden`
    - Right side: `flex-shrink-0`
    - No wrapping at any viewport width
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [x] 6.3 Write unit tests for CollectionContainer (`src/__tests__/components/ui/CollectionContainer.test.tsx`)
    - Test border classes present
    - Test padding classes present
    - Test children rendering
    - _Requirements: 7.1_

  - [x] 6.4 Write unit tests for CollectionRow (`src/__tests__/components/ui/CollectionRow.test.tsx`)
    - Test flex layout classes
    - Test children rendered in left area
    - Test action slot rendered in right area
    - Test renders without action slot
    - _Requirements: 7.2, 7.3_

- [x] 7. CTABanner and CrossLinks components
  - [x] 7.1 Create `src/components/ui/CTABanner.tsx`
    - TypeScript interface: `headline`, `body`, `href`, `className?`
    - Violet background, `border-standard border-black`, no border-radius
    - Headline in Pixbob Bold, body in Pixbob Regular, ArrowUpRight icon, all white text
    - Renders as anchor element (entire banner clickable)
    - Inherits global Focus_Treatment
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 7.2 Create `src/components/ui/CrossLinks.tsx`
    - TypeScript interface: `sections` (array of 2 objects with `title`, `href`, `items` array of `{ label, href }`)
    - Two-column grid, stacks vertically below 768px
    - Section titles in Pixbob Bold with ArrowUpRight icon
    - Item links: `border-standard border-black`, white background, Pixbob Regular, ArrowUpRight icon
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 7.3 Write unit tests for CTABanner (`src/__tests__/components/ui/CTABanner.test.tsx`)
    - Test violet background class
    - Test headline, body, href rendering
    - Test renders as anchor element
    - Test accessible name
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 7.4 Write unit tests for CrossLinks (`src/__tests__/components/ui/CrossLinks.test.tsx`)
    - Test two-column structure
    - Test section titles with icons
    - Test item links with border and icon
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 8. Prose, RPGSelector, and Blockquote components
  - [x] 8.1 Create `src/components/ui/Prose.tsx`
    - TypeScript interface: `children`, `className?`
    - Wraps content with Tailwind typography plugin classes
    - Manrope Light font, responsive body prose sizing
    - Headings within prose use Pixbob Bold at section heading size
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 8.2 Create `src/components/ui/RPGSelector.tsx`
    - Props: `className?`
    - Renders `>` character in Pixbob Regular at 36–44px desktop
    - Inline element, scales with parent font size
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 8.3 Create `src/components/ui/Blockquote.tsx`
    - TypeScript interface: `children`, `className?`
    - Violet background, left border accent in `var(--accent)`, Pixbob Regular text in white
    - Text sizes ≥24px at all breakpoints (WCAG AA large text, ~3.2:1 contrast)
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 8.4 Write unit tests for Prose (`src/__tests__/components/ui/Prose.test.tsx`)
    - Test Manrope font class
    - Test typography plugin classes present
    - _Requirements: 10.1_

  - [x] 8.5 Write unit tests for RPGSelector (`src/__tests__/components/ui/RPGSelector.test.tsx`)
    - Test renders `>` character
    - Test font class
    - Test className override
    - _Requirements: 11.1, 11.2_

  - [x] 8.6 Write unit tests for Blockquote (`src/__tests__/components/ui/Blockquote.test.tsx`)
    - Test violet background class
    - Test accent left border class
    - Test white text class
    - _Requirements: 13.1_

- [x] 9. Checkpoint — Verify all simple components
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. StatBar and PixelImage components
  - [x] 10.1 Create `src/components/ui/StatBar.tsx`
    - TypeScript interface: `label` (string), `value` (number), `className?`
    - Clamp value to 1–5 (round then clamp)
    - Render 5 stacked rectangles: filled (lime bg, `border-2 border-black`) or empty (white bg, `border-2 border-black`)
    - Label below in Pixbob Regular
    - `aria-label="{label}: {value} out of 5"` (uses clamped value)
    - Export `StatBarGroup` wrapper: flex row with 8–12px gap
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 10.2 Create `src/components/ui/PixelImage.tsx`
    - TypeScript interface: `src`, `scale` (`2 | 3 | 4`), `alt` (required non-empty string), `width`, `height`, `className?`
    - Apply `.pixel-art` class for `image-rendering: pixelated`
    - Compute displayed dimensions: `width * scale` × `height * scale`
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 10.3 Write unit tests for StatBar (`src/__tests__/components/ui/StatBar.test.tsx`)
    - Test filled/empty counts for each value 1–5
    - Test label rendering
    - Test aria-label format
    - Test clamping for out-of-range values
    - Test StatBarGroup renders children with gap
    - _Requirements: 12.1, 12.2, 12.3, 12.6_

  - [x] 10.4 Write unit tests for PixelImage (`src/__tests__/components/ui/PixelImage.test.tsx`)
    - Test pixel-art class applied
    - Test integer scaling dimensions for each scale factor
    - Test alt attribute present
    - _Requirements: 14.1, 14.3, 14.4_

  - [x] 10.5 Write property tests for StatBar (`src/__tests__/components/ui/StatBar.pbt.test.tsx`)
    - **Property 4: StatBar filled and empty rectangle count**
    - **Property 5: StatBar aria-label format**
    - **Validates: Requirements 12.1, 12.2, 12.6, 18.4**

  - [x] 10.6 Write property tests for PixelImage (`src/__tests__/components/ui/PixelImage.pbt.test.tsx`)
    - **Property 6: PixelImage integer scaling**
    - **Property 7: PixelImage non-empty alt requirement**
    - **Validates: Requirements 14.3, 14.4, 18.3**

- [x] 11. No-hardcoded-values scanning test
  - [x] 11.1 Write Property 1 scanning test (`src/__tests__/components/ui/no-hardcoded-values.test.ts`)
    - **Property 1: No hardcoded color values in component markup**
    - Scan all `src/components/ui/*.tsx` files for hex color patterns (`#[0-9a-fA-F]{3,8}`)
    - Does NOT flag Tailwind arbitrary value syntax, standard utility classes, SVG dimensions, or computed PixelImage dimensions
    - **Validates: Requirements 1.9, 4.4**

- [x] 12. Final checkpoint — Build integrity and full test suite
  - Ensure `pnpm build` compiles without errors
  - Ensure all tests pass (`pnpm test`)
  - Verify no TypeScript errors (`tsc --noEmit`)
  - Ask the user if questions arise
  - _Requirements: 16.1, 16.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All components are React Server Components (no `'use client'`)
- Existing components (ProjectCard, BlogPostCard, etc.) are NOT modified — deferred to Spec 09
- Font files must exist at `public/assets/fonts/` before task 1.3
- `fast-check` and `@tailwindcss/typography` are already installed
