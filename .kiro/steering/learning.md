---
inclusion: always
---

# Learning Log

This file tracks mistakes, corrections, and decisions made during development. **Always read this file before starting work.** Never repeat a logged mistake.

## How This File Works

- Entries are added automatically by the post-session review hook or manually by Lorenzo
- Each entry has a short title, what went wrong, why, and the correct approach
- When this file exceeds ~100 lines, consolidated entries should be migrated to the relevant steering file and removed from here
- Entries are organized by recency — newest at the top

## Mistakes & Corrections

### Prettier errors on unmatched content glob
**What went wrong:** `pnpm format` failed with exit code 2 because `content/**/*.{md,mdx,yaml,yml,json}` matched zero files (only `.gitkeep` files exist).
**Why:** Prettier treats no-match globs as errors by default.
**Correct approach:** Add `--no-error-on-unmatched-pattern` flag to both `format` and `format:check` scripts.

### import.meta.dirname is undefined under tsx CJS transform
**What went wrong:** `import.meta.dirname` returned `undefined` when running a `.ts` file via `npx tsx`, causing `path.join` to throw.
**Why:** `tsx` transpiles to CJS by default; `import.meta.dirname` is only available in native ESM (Node ≥ 21.2).
**Correct approach:** Use `dirname(fileURLToPath(import.meta.url))` which works in both CJS-transpiled and native ESM contexts.

### create-next-app refuses non-empty directories
**What went wrong:** `pnpm create next-app .` fails with "contains files that could conflict" when existing files/dirs are present (even unrelated ones like `context/`, `.kiro/`).
**Why:** The scaffolder checks for any existing files, not just conflicting ones.
**Correct approach:** Scaffold into a temp directory, then move generated files into the project root. Back up and restore files that must be preserved (`.gitignore`).

### Design doc too prescriptive — config snippets belong in tasks
**What went wrong:** First design doc included near-complete file contents (tsconfig, eslint config, package.json scripts/deps) and hardcoded version numbers (Next.js 15, Tailwind v4, ESLint flat config with FlatCompat).
**Why:** Blurred the line between design decisions and implementation steps. Hardcoded versions that should be determined by the scaffolder.
**Correct approach:** Design doc describes role, purpose, and architectural choices for each file. Exact contents and versions go in implementation tasks. Anchor version choices to steering files or "determined by scaffolder" rather than hardcoding.

### Missing format:check script for CI verification
**What went wrong:** Design had `format` (write mode) but verification gates referenced `pnpm format --check`, which doesn't match the script definition.
**Why:** Didn't think through the write vs check distinction when defining scripts.
**Correct approach:** Two separate scripts: `format` (write, developer use) and `format:check` (exits non-zero if unformatted, CI use).

### Requirements mixed product intent with implementation details
**What went wrong:** First draft of `requirements.md` included specific filenames (`tailwind.config.ts`, `.prettierrc`, `pnpm-lock.yaml`), config flags (`"strict": true`), and duplicated verification criteria across R3 and R7.
**Why:** Treated the spec prompt as requirements verbatim instead of separating "what" from "how".
**Correct approach:** Requirements describe outcomes and constraints. Implementation details (file names, config syntax) belong in the design doc. Verification gates are cross-cutting checks, not standalone requirements. Reference steering files instead of duplicating their content.

## Decisions Log

### Next.js 16 + Tailwind v4 as bootstrap baseline
Scaffolder produced Next.js 16.1.6, Tailwind 4.2.1, ESLint 9.39.4 (flat config), TypeScript 5.9.3. Tailwind v4 uses CSS-based config (`@import "tailwindcss"` + `@source` directives, no `tailwind.config.ts`). ESLint uses flat config format (`eslint.config.mjs`).

### ESLint config format follows scaffolder
The ESLint config format (flat vs legacy) is determined by the `create-next-app` scaffolder, not prescribed in the design. We use `eslint-config-next` regardless of format.

### Prettier standalone, no ESLint integration
Prettier runs separately via `format` and `format:check` scripts. No `eslint-plugin-prettier` or `eslint-config-prettier` to avoid conflicts.
