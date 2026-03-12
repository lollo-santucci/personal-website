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

### Direct `as T` cast from Record<string, unknown> fails in YAML-only loaders
**What went wrong:** `agents.ts` used `return raw.data as Agent` which TS rejects because `Record<string, unknown>` doesn't overlap with `Agent`. MDX loaders avoided this incidentally via `{ ...raw.data, content: raw.body }` (spread creates a fresh type).
**Why:** Direct cast from `Record<string, unknown>` to a concrete interface requires double assertion when there's no structural overlap.
**Correct approach:** Use `as unknown as T` for runtime-validated casts in YAML/JSON-only loaders (agents, characters, dialogues, locations). MDX loaders don't need this because the spread already widens the type.

### fast-check v4: fc.date() can produce invalid Date objects
**What went wrong:** Blog post sorting PBT used `fc.date().map(d => d.toISOString().slice(0,10))` which threw `RangeError: Invalid time value` because fast-check v4 generates Date objects outside the valid range.
**Why:** fast-check v4's `fc.date()` default range includes dates that can't be serialized with `toISOString()`.
**Correct approach:** Generate date strings from integer components: `fc.tuple(fc.integer({min:2000,max:2030}), fc.integer({min:1,max:12}), fc.integer({min:1,max:28}))` and format manually.

### Design feedback not applied before moving to tasks
**What went wrong:** Lorenzo gave 5 concrete design doc feedback points (slug validation ambiguity, Agent nested casting, renderMDX contract, localeCompare specificity, fragile PBT properties). I acknowledged them but proceeded to create tasks.md without editing design.md first.
**Why:** Implicit rules suggested moving to tasks after design exists, and I followed the automation instead of the user's explicit feedback.
**Correct approach:** Always apply user feedback to the current document before proceeding to the next phase. User corrections take priority over workflow automation.

### Return type typo in function signature table
**What went wrong:** `getProjectBySlug` return type was written as `Promise<Page | null>` instead of `Promise<Project | null>` in the requirements doc.
**Why:** Copy-paste from the Page row when building the table.
**Correct approach:** After generating tables with repeated structure, verify each row's types match the content type — don't just copy the first row.

### Subagent inconsistency: readonly modifiers on entity interfaces
**What went wrong:** Subagent added `readonly` to all `BlogPost` fields while other entity interfaces (Page, Project, Agent, Service) didn't use `readonly`.
**Why:** No explicit constraint in the subagent prompt about `readonly` consistency for the first few tasks; added it after noticing the drift.
**Correct approach:** When delegating entity type creation to subagents, explicitly state style constraints (e.g. "do NOT use `readonly`") to maintain consistency across files. Catch drift early.

### expectTypeOf + branded types: toEqualTypeOf fails with `Slug | undefined` under tsc
**What went wrong:** `expectTypeOf<Narrowed['agentSlug']>().toEqualTypeOf<Slug | undefined>()` passed in Vitest runtime but failed under `tsc --noEmit` because `Slug | undefined` doesn't satisfy the branded type constraint in `expect-type`'s generic.
**Why:** Vitest's type checker and `tsc` handle branded type unions differently in `toEqualTypeOf` constraints. The `undefined` in the union breaks the constraint check.
**Correct approach:** Use `.not.toEqualTypeOf<Slug>()` to verify the optional field differs from the required case, avoiding the branded-type-plus-undefined constraint issue.

### [Consolidated] Spec authoring lessons (from bootstrap, content-entity-types, content-directory-templates specs)
- **Requirements**: describe outcomes, not implementation. No filenames, config flags, or duplicated verification gates. Every AC must add a non-trivial constraint.
- **Requirements vs design boundary**: field matrices and verifiable checklists belong in requirements; placeholder values, comment wording, and formatting details are design decisions — defer them explicitly.
- **Verifiability**: "match exactly" is vague. Use explicit field matrices (field, required?, type, notes) derived from actual source code. For discriminated unions, state whether template shows superset or per-branch files.
- **Source precedence**: when a spec references multiple sources (TS types, steering files, docs), declare explicit precedence. Include all relevant steering files — don't omit `structure.md` when naming conventions matter.
- **Dependencies on future specs**: when an AC depends on code that doesn't exist yet (e.g. content loader), call it out as a dependency note rather than stating it as a verifiable fact.
- **Design docs**: prescribe structural constraints, not editorial style. Field ordering, comment header wording, YAML syntax choices (inline vs block) are implementation details — defer them explicitly.
- **Testing calibration**: for specs with a small, fixed input domain (e.g. 8 static files), use parameterized unit tests, not `fast-check` PBT. Reserve PBT for runtime logic with large/random input spaces.
- **Inter-type invariants**: classify as type-level (TS enforced), runtime (content loader), or documentation-only.
- **Scripts**: always have both `format` (write) and `format:check` (CI). Use `--no-error-on-unmatched-pattern` for Prettier globs.

### [Consolidated] Bootstrap tooling gotchas
- `create-next-app` refuses non-empty dirs → scaffold into temp dir, then move files.
- `import.meta.dirname` is undefined under `tsx` CJS transform → use `dirname(fileURLToPath(import.meta.url))`.
- Prettier exits non-zero on unmatched globs → `--no-error-on-unmatched-pattern`.
- Complex inline `node -e "..."` scripts fail in zsh with quoting issues → write to a temp `.mjs` file instead.
- `js-yaml` is now installed as a production dependency (content-loader spec). Previously required Node built-ins for ad-hoc YAML parsing.

## Decisions Log

### Content loader: shared utility core with thin per-type wrappers
Common logic (file discovery, validation, branded casting, sorting) lives in `src/lib/content/utils/`. Each content type module is a thin wrapper configuring the shared core with type-specific metadata (directory, required fields, sort comparator). Avoids duplicating logic across 5+ loader modules.

### Content loader: .yml excluded, only .yaml supported
YAML content files use `.yaml` only, not `.yml`. Aligns with Spec 3 templates which use `.yaml` exclusively. Explicit exclusion avoids ambiguity.

### Content loader: by-slug accepts string, not Slug (API ergonomics)
By-slug functions accept plain `string` parameter, not branded `Slug`. Callers (route params, URL segments) provide plain strings — requiring `Slug` would force casting at every call site. Branding happens inside the loader.

### Content loader validation scope
Loaders validate: required field presence, array-typed fields are arrays, parseable file format. They do NOT validate enum membership, IsoDateString regex, or deep runtime type-checking. Explicit scope prevents implementation drift.

### Slug identity: filename is canonical, frontmatter must match
Filename (without extension) is the single source of truth for slug. Frontmatter `slug` is required and must match exactly — mismatch throws. By-slug lookup uses filename, not frontmatter scan.

### Content directory resilience: missing/empty → empty array, not error
Missing content directory → list returns `[]`, by-slug returns `null`. Empty directory (only `.gitkeep`/templates) → `[]`. No build failures from absent content.

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

### Template-TypeScript alignment tests use hand-maintained metadata map
For the 8 content type templates, tests use a hand-maintained `CONTENT_TYPES` metadata map (field names, optionality, enum values, branded types) rather than AST-parsing TS interfaces at test time. The domain is small and stable — AST parsing would add complexity and a `typescript` API dependency for no real benefit. Update the map when interfaces change.

### Next.js 16 + Tailwind v4 as bootstrap baseline
Next.js 16.1.6, Tailwind 4.2.1, ESLint 9.39.4 (flat config), TypeScript 5.9.3. Tailwind v4 uses CSS-based config. ESLint uses flat config. Prettier standalone (no ESLint integration).
