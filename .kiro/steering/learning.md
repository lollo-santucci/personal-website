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

### Subagent file deletion not verified on disk
**What went wrong:** Subagent reported deleting `src/__tests__/app/office/` during Task 1.3, but Lorenzo showed the files still existed on disk via `ls`. The workspace tree didn't show them, masking the issue.
**Why:** Trusted the subagent's success report and the workspace tree without verifying via `executeBash` that files were actually removed from the filesystem.
**Correct approach:** After subagent deletes files, verify with `executeBash` (`ls` or `test -d`) that the files are actually gone from disk. Don't rely solely on the workspace tree or subagent output.

### Navigation rename missed HeaderNav test file
**What went wrong:** Task 1 renamed "Office" → "Agentdex" in `navigation.ts` and `navigation.test.ts`, but `HeaderNav.test.tsx` still expected "Office" in its nav link assertions. Caught at checkpoint.
**Why:** The rename tasks listed specific files but didn't grep for all "Office" references across the test suite.
**Correct approach:** After any rename, grep the entire `src/__tests__/` directory for the old value before marking the task complete.

### Incomplete find-and-replace across design doc sections
**What went wrong:** Updated `localeCompare` locale from `'en'` to `undefined` in Key Design Decisions and function description, but missed the same stale `'en'` in Correctness Property 1. Lorenzo caught the inconsistency.
**Why:** Applied fixes to known locations without searching the full document for all occurrences of the changed value.
**Correct approach:** After changing a value in a design doc, grep the entire file for all occurrences before declaring the fix complete.

### Design-requirements misalignment: update requirements, don't document deviations
**What went wrong:** Design doc acknowledged that `aria-disabled="true"` deviated from the requirements' "disabled `<button>`" wording, but left the requirements unchanged. Lorenzo flagged this as a process problem.
**Why:** Treated the design doc as the authority and documented the deviation rather than fixing the source.
**Correct approach:** When design needs to deviate from requirements wording, update the requirements to match the design intent. A design doc should never contradict its requirements.

### fsWrite/strReplace edits to spec files revert between turns
**What went wrong:** Across 3+ turns, edits to spec files reverted to original content on the next turn. Only `executeBash` with a heredoc persisted reliably.
**Why:** Unknown root cause — possibly related to spec file watching or undo behavior.
**Correct approach:** When spec file edits keep reverting, use `executeBash` with a heredoc. Verify persistence by reading the file in a subsequent turn.

### JSX in .ts file causes TypeScript diagnostics
**What went wrong:** `src/lib/content/mdx.ts` contained JSX but used a `.ts` extension. TypeScript produced 13 parse errors.
**Correct approach:** Any file that contains JSX must use `.tsx` extension. Use `smartRelocate` to update imports automatically.

### Seed content used wrong GitHub username
**What went wrong:** Seed content used `github.com/lorenzosantucci` instead of `github.com/lollo-santucci`.
**Correct approach:** Personal identifiers should be defined in a single source and referenced from there. Never guess usernames.

### Stale tests from previous specs break after page reimplementation
**What went wrong:** Old test file tested removed patterns after page was rewritten.
**Correct approach:** When a spec replaces a page stub, check for and remove/update existing tests before running the full suite.

### Parallel strReplace calls on overlapping text regions
**What went wrong:** Two parallel `strReplace` calls targeted the same section; second failed because first changed the text.
**Correct approach:** When multiple edits target the same section, run them sequentially. Only parallelize edits to clearly independent sections.

### Design feedback not applied before moving to tasks
**What went wrong:** Lorenzo gave concrete design feedback; I acknowledged but proceeded to create tasks.md without editing design.md first.
**Correct approach:** Always apply user feedback to the current document before proceeding to the next phase. User corrections take priority over workflow automation.

### Direct `as T` cast from Record<string, unknown> fails in YAML-only loaders
**What went wrong:** `agents.ts` used `return raw.data as Agent` which TS rejects because `Record<string, unknown>` doesn't overlap with `Agent`.
**Correct approach:** Use `as unknown as T` for runtime-validated casts in YAML/JSON-only loaders.

### fast-check v4: fc.date() can produce invalid Date objects
**What went wrong:** `fc.date().map(d => d.toISOString().slice(0,10))` threw `RangeError` because fast-check v4 generates dates outside valid range.
**Correct approach:** Generate date strings from integer components: `fc.tuple(fc.integer({min:2000,max:2030}), ...)` and format manually.

### Return type typo in function signature table
**What went wrong:** `getProjectBySlug` return type was `Promise<Page | null>` instead of `Promise<Project | null>`.
**Correct approach:** After generating tables with repeated structure, verify each row's types match the content type.

### Subagent inconsistency: readonly modifiers on entity interfaces
**What went wrong:** Subagent added `readonly` to `BlogPost` fields while other interfaces didn't use `readonly`.
**Correct approach:** When delegating to subagents, explicitly state style constraints to maintain consistency. Catch drift early.

### expectTypeOf + branded types: toEqualTypeOf fails with `Slug | undefined` under tsc
**What went wrong:** `toEqualTypeOf<Slug | undefined>()` passed in Vitest but failed under `tsc --noEmit`.
**Correct approach:** Use `.not.toEqualTypeOf<Slug>()` to avoid the branded-type-plus-undefined constraint issue.

### [Consolidated] Design doc authoring lessons (from site-shell, core-content-pages, agentdex-shell specs)
- **File placement**: check existing project structure before proposing new file locations. Content-related utilities go under `src/lib/content/`, not `src/lib/`.
- **Locale choices**: use `undefined` (runtime default) or explicitly motivate the locale. Don't default to `'en'` in a multilingual context.
- **Implementation notes**: design docs state strategy and fallbacks. Operational testing instructions belong in tasks.
- **Error boundary files**: if design references a file as part of error handling, the file map must include it or explicitly note it's out of scope.
- **Steering alignment**: every design doc needs an "Alignment with Steering" section covering naming, imports, file placement, server/client boundaries, testing conventions.
- **RSC feasibility**: don't promise try/catch resilience in async server components without verifying. State preferred strategy + acceptable fallback.
- **PBT calibration**: classify each property as PBT-friendly or unit/integration. Don't apply PBT uniformly.
- **Metadata centralization**: document where shared metadata lives (layout.tsx) and what individual routes return.
- **New dependencies**: must appear in file map with install command and registration mechanism.
- **Code signatures**: design docs describe behavior and data flow, not exact function signatures or framework-specific API details.
- **Shared modules**: when logic is pure, testable, and referenced by multiple consumers, define it in a shared module from the start.
- **File map**: every design doc needs a File Map section listing every file created or modified.
- **External contracts**: when design uses an external function in multiple places, document its contract inline.
- **Design-requirements alignment**: never contradict requirements — either update requirements or conform the design.

### [Consolidated] Requirements doc authoring lessons (from site-shell, core-content-pages, agentdex-shell specs)
- **No implementation names**: requirements describe behaviors, not component names, function names, or library names.
- **No design-forward phrasing**: don't steer the design from within ACs ("The design SHALL specify..."). State the behavioral outcome only.
- **Implementation-specific CSS**: state the behavioral need ("consistent dimensions regardless of aspect ratio"), not the CSS technique.
- **AC numbering**: after inserting or reordering ACs, re-read the full requirement to verify sequential numbering.
- **Ambiguous content sources**: define specific entity sources and fallback behavior, don't say "loaded from Content_System" without specifying which entity.
- **Seed content minimums**: set minimums to match the maximum display count of any consuming page.
- **Fallback titles as exceptions**: when a no-hardcoded-text rule exists, explicitly declare fallback titles as a permitted exception category.
- **Missing behavioral details**: specify date locale, metadata title pattern, error behavior, and show/omit policy for optional fields.
- **Redundant ACs**: when a new requirement subsumes part of an existing one, remove the overlap. Each AC has exactly one owner.
- **Uniform route specification**: when a requirement covers multiple routes, give each the same level of content specification.
- **Content field guarantees**: cite the dependency explicitly when a requirement depends on specific content fields.
- **Accessibility criteria**: every interactive UI component must specify accessible label, state communication to AT, and keyboard operability.
- **Metadata/SEO**: include a metadata requirement for any public-facing site. This is requirements-level, not design.
- **Feature scope**: keep feature specs scoped to the feature. Cross-cutting audits belong in their own spec.
- **Global assertions**: audit ALL requirements for global assertions that apply to pages outside the feature.

### [Consolidated] Spec authoring lessons (from bootstrap, content-entity-types, content-directory-templates specs)
- **Requirements vs design boundary**: field matrices and verifiable checklists belong in requirements; placeholder values, comment wording, and formatting details are design decisions.
- **Verifiability**: use explicit field matrices derived from actual source code. "Match exactly" is vague.
- **Source precedence**: when a spec references multiple sources, declare explicit precedence.
- **Dependencies on future specs**: call out as dependency notes rather than verifiable facts.
- **Testing calibration**: for small, fixed input domains, use parameterized unit tests, not PBT.
- **Inter-type invariants**: classify as type-level (TS enforced), runtime (content loader), or documentation-only.
- **Scripts**: always have both `format` (write) and `format:check` (CI). Use `--no-error-on-unmatched-pattern` for Prettier globs.

### [Consolidated] Bootstrap tooling gotchas
- `create-next-app` refuses non-empty dirs → scaffold into temp dir, then move files.
- `import.meta.dirname` is undefined under `tsx` CJS transform → use `dirname(fileURLToPath(import.meta.url))`.
- Prettier exits non-zero on unmatched globs → `--no-error-on-unmatched-pattern`.
- Complex inline `node -e "..."` scripts fail in zsh with quoting issues → write to a temp `.mjs` file instead.
- `js-yaml` is now installed as a production dependency (content-loader spec).

## Decisions Log

### Entity detail page meta descriptions: readable sentences, not raw field values
Meta descriptions for entity detail pages should be formatted as readable sentences, not just the raw field value. Exact sentence format is a design decision per spec, but the floor is: more descriptive than the raw value alone.

### Portrait images: consistent dimensions regardless of aspect ratio
Entity portrait/image fields displayed in cards and detail pages SHALL render with consistent dimensions regardless of source aspect ratio. The specific CSS technique is a design decision.

### External links always open in new tab
All external hrefs (`http://` / `https://`) must have `target="_blank" rel="noopener noreferrer"`. Enforced via custom `MdxAnchor` component in `renderMDX`.

### Lorenzo's GitHub handle is `lollo-santucci`
Not `lorenzosantucci`. Use `https://github.com/lollo-santucci` everywhere. LinkedIn is `https://linkedin.com/in/lorenzosantucci` (confirmed correct).

### Metadata policy: static metadata vs generateMetadata by route type
Pure index pages export `const metadata`. Content-entity-backed pages and dynamic routes use `generateMetadata()`.

### Content loader: shared utility core with thin per-type wrappers
Common logic lives in `src/lib/content/utils/`. Each content type module is a thin wrapper. Avoids duplicating logic across 5+ loader modules.

### Content loader: .yml excluded, only .yaml supported
YAML content files use `.yaml` only, not `.yml`. Aligns with Spec 3 templates.

### Content loader: by-slug accepts string, not Slug (API ergonomics)
By-slug functions accept plain `string` parameter, not branded `Slug`. Branding happens inside the loader.

### Content loader validation scope
Loaders validate: required field presence, array-typed fields are arrays, parseable file format. They do NOT validate enum membership, IsoDateString regex, or deep runtime type-checking.

### Slug identity: filename is canonical, frontmatter must match
Filename (without extension) is the single source of truth for slug. Frontmatter `slug` must match exactly — mismatch throws.

### Content directory resilience: missing/empty → empty array, not error
Missing content directory → `[]`, by-slug → `null`. No build failures from absent content.

### Vitest as project test runner
Vitest chosen as the test runner. Type-level tests use `expectTypeOf`. Test script: `"test": "vitest run"`.

### Branded type pattern for semantic aliases
`string & { readonly __brand: unique symbol }` — not directly assignable from `string` without explicit cast.

### Content type architecture decisions
- Type-only modules: `tsc --noEmit` + `expectTypeOf`, not PBT
- `DialogueId` and `LineId` as domain-specific branded aliases
- `Dialogue.speaker` typed as `Slug` (all speakers are Characters)
- Three-tier guarantee classification: type-level, runtime, documentation-only
- Character agent narrowing via TS discriminated union

### Template-TypeScript alignment tests use hand-maintained metadata map
For the 8 content type templates, tests use a hand-maintained `CONTENT_TYPES` metadata map rather than AST-parsing TS interfaces. Update the map when interfaces change.

### Testing async server components in jsdom
Call the function, await the result, then render: `const el = await Page(); render(el);`. For params, pass a resolved Promise.

### Per-file vitest environment for component tests
Use `// @vitest-environment jsdom` at the top of each component test file instead of changing global config.

### PBT with String.replace and special replacement patterns
`String.prototype.replace('%s', title)` breaks with special replacement patterns (`$&`, `$'`, etc.). Use `template.split('%s')` + concatenation instead.

### Next.js 16 + Tailwind v4 as bootstrap baseline
Next.js 16.1.6, Tailwind 4.2.1, ESLint 9.39.4 (flat config), TypeScript 5.9.3. Tailwind v4 uses CSS-based config. ESLint uses flat config.
