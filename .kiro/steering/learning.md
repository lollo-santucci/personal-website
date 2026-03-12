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

### Subagent inconsistency: readonly modifiers on entity interfaces
**What went wrong:** Subagent added `readonly` to all `BlogPost` fields while other entity interfaces (Page, Project, Agent, Service) didn't use `readonly`.
**Why:** No explicit constraint in the subagent prompt about `readonly` consistency for the first few tasks; added it after noticing the drift.
**Correct approach:** When delegating entity type creation to subagents, explicitly state style constraints (e.g. "do NOT use `readonly`") to maintain consistency across files. Catch drift early.

### expectTypeOf + branded types: toEqualTypeOf fails with `Slug | undefined` under tsc
**What went wrong:** `expectTypeOf<Narrowed['agentSlug']>().toEqualTypeOf<Slug | undefined>()` passed in Vitest runtime but failed under `tsc --noEmit` because `Slug | undefined` doesn't satisfy the branded type constraint in `expect-type`'s generic.
**Why:** Vitest's type checker and `tsc` handle branded type unions differently in `toEqualTypeOf` constraints. The `undefined` in the union breaks the constraint check.
**Correct approach:** Use `.not.toEqualTypeOf<Slug>()` to verify the optional field differs from the required case, avoiding the branded-type-plus-undefined constraint issue.

### [Consolidated] Spec authoring lessons (from bootstrap + content-entity-types specs)
- **Requirements**: describe outcomes, not implementation. No filenames, config flags, or duplicated verification gates. Every AC must add a non-trivial constraint.
- **Design docs**: prescribe principles, not exact current state. Use "in this design..." not "the only import is...". Role/purpose/choices — not near-complete file contents or hardcoded versions.
- **Inter-type invariants**: classify as type-level (TS enforced), runtime (content loader), or documentation-only.
- **Testing**: pure type modules use `tsc --noEmit` + `expectTypeOf`, not PBT. Reserve fast-check for runtime logic.
- **Scripts**: always have both `format` (write) and `format:check` (CI). Use `--no-error-on-unmatched-pattern` for Prettier globs.

### [Consolidated] Bootstrap tooling gotchas
- `create-next-app` refuses non-empty dirs → scaffold into temp dir, then move files.
- `import.meta.dirname` is undefined under `tsx` CJS transform → use `dirname(fileURLToPath(import.meta.url))`.
- Prettier exits non-zero on unmatched globs → `--no-error-on-unmatched-pattern`.

## Decisions Log

### Vitest as project test runner
Vitest chosen as the test runner. Type-level tests use `expectTypeOf`. Test script: `"test": "vitest run"`.

### Branded type pattern for semantic aliases
`string & { readonly __brand: unique symbol }` — not directly assignable from `string` without explicit cast.

### Content type architecture decisions
- Type-only modules: `tsc --noEmit` + `expectTypeOf`, not PBT
- `DialogueId` and `LineId` as domain-specific branded aliases alongside `Slug`, `IsoDateString`, `AssetPath`
- `Dialogue.speaker` typed as `Slug` (all speakers are Characters; documented escape hatch for future non-Character speakers)
- Validation technology deferred to content-loader spec
- Three-tier guarantee classification: type-level, runtime, documentation-only
- Character agent narrowing via TS discriminated union (`type === 'agent'` → `agentSlug` required)

### Next.js 16 + Tailwind v4 as bootstrap baseline
Next.js 16.1.6, Tailwind 4.2.1, ESLint 9.39.4 (flat config), TypeScript 5.9.3. Tailwind v4 uses CSS-based config. ESLint uses flat config. Prettier standalone (no ESLint integration).
