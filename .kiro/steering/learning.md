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

### JSX in .ts file causes TypeScript diagnostics
**What went wrong:** `src/lib/content/mdx.ts` contained JSX (`<a>` elements in `MdxAnchor`) but used a `.ts` extension. TypeScript produced 13 parse errors because JSX is only valid in `.tsx` files.
**Why:** When adding the `MdxAnchor` component to the previously JSX-free utility, the file wasn't renamed to `.tsx`.
**Correct approach:** Any file that contains JSX must use `.tsx` extension. When adding JSX to an existing `.ts` file, rename it immediately. Use `smartRelocate` to update imports automatically.

### Seed content used wrong GitHub username
**What went wrong:** Seed content files (contact.mdx, ml-pipeline-toolkit.mdx) used `github.com/lorenzosantucci` instead of the correct `github.com/lollo-santucci`. Footer.tsx from Spec 5 also has the wrong URL.
**Why:** Subagent generated plausible-looking URLs based on the persona name without verifying the actual GitHub handle.
**Correct approach:** Personal identifiers (GitHub handle, LinkedIn URL, email) should be defined in a single source (steering file or env var) and referenced from there. Never guess usernames.

### MDX-rendered external links missing target="_blank"
**What went wrong:** Links in MDX content (contact page, blog posts, project descriptions) rendered as plain `<a>` tags without `target="_blank"`, violating Lorenzo's requirement that all external hrefs open in a new tab.
**Why:** `renderMDX` used `next-mdx-remote` with no custom components. External link behavior wasn't specified in the spec.
**Correct approach:** Added a custom `MdxAnchor` component to `renderMDX` that detects `http://` / `https://` hrefs and adds `target="_blank" rel="noopener noreferrer"`. All external links — both in MDX content and hardcoded in components — must open in new tabs.

### Stale tests from previous specs break after page reimplementation
**What went wrong:** After replacing the Spec 5 home page stub with the full content-driven implementation, the old test file (`src/__tests__/app/page.test.tsx`) failed because it tested the removed quickLinks/hardcoded heading pattern.
**Why:** The old test wasn't removed or updated when the page was rewritten. The test suite caught it, but it should have been anticipated.
**Correct approach:** When a spec replaces a page stub from a previous spec, check for and remove/update any existing tests for that stub before running the full suite. Search `src/__tests__/` for test files matching the modified route.

### Parallel strReplace calls on overlapping text regions
**What went wrong:** Two parallel `strReplace` calls targeted the same section of design.md. The first edit changed the text that the second edit was matching against, causing the second to fail with "oldStr not found."
**Why:** Both edits touched the Error Handling / MdxContent section. The first edit changed `error.tsx` wording, which altered the text the second edit needed to match.
**Correct approach:** When multiple edits target the same section or nearby text, run them sequentially (not in parallel). Only parallelize edits to clearly independent sections of a file.

### Design doc: implementation notes belong in tasks, not design
**What went wrong:** MDX error handling section included "during task execution, test this with intentionally broken MDX content" — an operational instruction that belongs in task descriptions, not the design doc.
**Why:** Blurred the line between design decisions (what strategy to use) and task execution guidance (how to verify it works).
**Correct approach:** Design docs state the strategy and acceptable fallbacks. Operational testing instructions ("test with broken content", "if X doesn't work, do Y") belong in the task that implements the feature.

### Design doc: file map should account for error boundary files
**What went wrong:** Design referenced `error.tsx` as an acceptable fallback for MDX failures but didn't include it in the file map or explicitly state it's not created by this spec.
**Why:** Mentioned error.tsx as a concept without clarifying whether it's an existing file, a new file, or out of scope.
**Correct approach:** If a design references a file as part of its error handling strategy, the file map must either include it (if created) or explicitly note it's not part of this spec's scope.

### Design doc: missing steering alignment section
**What went wrong:** Design doc didn't show how it inherits naming, file placement, import patterns, server/client boundaries, and testing conventions from steering files. Felt "self-contained" rather than workspace-native.
**Why:** Focused on component architecture without explicitly connecting decisions to steering rules.
**Correct approach:** Every design doc should include an "Alignment with Steering" section covering: naming/import conventions, file placement rationale, server/client boundaries, testing conventions, and which existing files are preserved vs replaced.

### Design doc: over-optimistic MDX error handling without RSC feasibility check
**What went wrong:** Design stated "each page wraps renderMDX in try/catch" as if it's guaranteed to work. In RSC, compilation errors during rendering may propagate before catch can intercept.
**Why:** Assumed try/catch works uniformly in async server components without verifying against the actual RSC + next-mdx-remote behavior.
**Correct approach:** State the preferred strategy, the acceptable fallback (error.tsx boundary), and flag it as "test during implementation." Don't promise resilience the stack may not support.

### Design doc: all properties mapped to PBT without calibration
**What went wrong:** Testing strategy said "each correctness property maps to a single property-based test" — including page-level properties (P5, P7, P9, P10, P13, P14, P15) where randomization adds complexity without proportional value.
**Why:** Applied PBT uniformly instead of evaluating which properties benefit from random input generation vs fixed examples.
**Correct approach:** Classify each property as PBT-friendly (pure functions, component rendering with varied entity data) or unit/integration (page-level rendering, fixed input domains, single failure modes). State the rationale for each classification.

### Design doc: missing metadata centralization note
**What went wrong:** Design described per-page metadata without noting that the root layout already provides site name, title template, and default description. Risk of duplicating logic across route files during implementation.
**Why:** Didn't cross-reference the existing layout.tsx metadata setup when designing per-page metadata behavior.
**Correct approach:** Document where shared metadata values live (layout.tsx) and what individual routes need to return (just title + description). Prevents task implementers from re-inventing the template.

### Requirements doc: duplicate AC numbering after inserting new items
**What went wrong:** After inserting a new AC4 in R9 (about page seed), the subsequent items kept the old numbers — two ACs numbered `5.`.
**Why:** Manual renumbering after insertion is error-prone, especially in markdown numbered lists.
**Correct approach:** After inserting or reordering ACs, always re-read the full requirement to verify sequential numbering. Markdown renderers auto-number, but raw text must be correct since specs are referenced by AC number.

### Requirements doc: design-forward phrasing leaking into ACs
**What went wrong:** ACs contained phrases like "The design SHALL specify the exact Intl.DateTimeFormat options", "The exact separator and site name are design decisions", "install command SHALL be documented in the design". These steer the design from within the requirements.
**Why:** Tried to be helpful by flagging what the design needs to decide, but that's the design doc's job — requirements should state the behavioral outcome only.
**Correct approach:** State the expected behavior (e.g., "human-readable long format"). If a dependency needs an installation plan, note it as a dependency constraint, not as an AC directing the design.

### Requirements doc: implementation-specific names leaked into requirements
**What went wrong:** Requirements referenced `Project_Card`, `MDX_Content`, `Status_Badge`, `renderMDX`, `@tailwindcss/typography` by name — these are design/implementation decisions, not behavioral outcomes.
**Why:** The glossary defined component names and the ACs used them directly, blurring the requirements/design boundary.
**Correct approach:** Requirements describe behaviors ("a reusable project card component", "typography styling", "Tailwind typography plugin"). Specific component names, function names, and library names belong in the design doc.

### Requirements doc: ambiguous content source for home page value proposition
**What went wrong:** R1 said "loaded from the Content_System" without specifying which entity provides the home page intro text. Ambiguous whether it's a Page entity, a hardcoded section, or something else.
**Why:** The home page is a composite of multiple content sources, and the value proposition source wasn't pinned down.
**Correct approach:** Define a specific entity source (e.g., "Page with slug `home`") and document the fallback behavior if that entity is absent.

### Requirements doc: seed content minimum didn't exercise all behaviors
**What went wrong:** R9 required "at least 2 blog posts" but R1 specified "Latest 3 Posts" on the home page. The seed minimum didn't fully exercise the home page behavior.
**Why:** Seed content count was set generically without cross-referencing the consuming requirements.
**Correct approach:** Set seed content minimums to match the maximum display count of any consuming page. If the home page shows 3 posts, seed at least 3.

### Requirements doc: fallback titles not declared as exceptions
**What went wrong:** R2 and R7 specified fallback titles ("About", "Contact") when content is missing, but R10 (no hardcoded text) didn't acknowledge these as permitted exceptions.
**Why:** Fallback behavior and the no-hardcoded-text rule were written independently without cross-referencing.
**Correct approach:** Explicitly declare fallback titles as a named exception category in the no-hardcoded-text requirement.

### Requirements doc: missing behavioral details deferred to implementation
**What went wrong:** Date format locale, metadata title pattern, MDX rendering failure behavior, and optional field display policy (image, relatedProjects) were all unspecified — leaving implementation to make undocumented decisions.
**Why:** Treated these as "obvious" implementation details rather than behavioral contracts that affect user experience.
**Correct approach:** Specify: date locale and format style, metadata title template pattern, graceful degradation for MDX failures, and explicit show/omit policy for each optional entity field displayed on detail pages.

### Design doc: new dependency introduced without explicit installation plan
**What went wrong:** `@tailwindcss/typography` was mentioned as "(If not yet installed, this spec adds it)" without specifying the install command, CSS registration syntax, or listing `package.json` in the file map.
**Why:** Treated a new dependency as a minor aside instead of a concrete implementation step.
**Correct approach:** Any new dependency must appear in the file map (package.json), include the install command, and specify the registration mechanism (e.g., `@plugin` directive for Tailwind v4).

### Design doc: framework-specific code signatures in design
**What went wrong:** Project detail page example included `params: Promise<{ slug: string }>` and full function body — too implementation-specific for a design doc.
**Why:** Copy-pasted from Context7 docs directly into the design instead of abstracting to behavioral description.
**Correct approach:** Design docs describe what a component does and its data flow, not exact function signatures. Framework-specific API details (like Next.js params typing) belong in implementation.

### Design doc: shared logic defined inline instead of in a shared module
**What went wrong:** `NAV_LINKS` and `isActiveLink` were defined inside `HeaderNav.tsx` with a note saying "extractable for testing", but tests were already planned in `src/__tests__/lib/navigation.test.ts`. Inconsistency between component ownership and test location.
**Why:** Defaulted to co-locating logic with its primary consumer instead of thinking about reusability and testability upfront.
**Correct approach:** When logic is pure, testable, and referenced by multiple consumers (component + tests), define it in a shared module from the start (e.g., `src/lib/navigation.ts`). Design docs should show the final module location, not "extractable later."

### Design doc: missing explicit file map
**What went wrong:** The design described components and their behavior well but didn't list all files to create/modify in one place. Readers had to piece together the file plan from scattered sections.
**Why:** Focused on component architecture over implementation logistics.
**Correct approach:** Every design doc should include a File Map section near the top listing every file created or modified, with a one-line purpose. This is especially important for task generation.

### Design doc: external dependency contract not documented
**What went wrong:** Multiple pages called `renderMDX(page.content)` but the design didn't document the function's contract (input type, output type, prose wrapper pattern, custom components policy).
**Why:** Assumed the reader knows the existing API from Spec 4. But the design depends on that capability across many pages.
**Correct approach:** When a design uses an external function in multiple places, document its contract inline — at minimum: signature, return type, and any wrapper/styling expectations. Don't assume cross-spec knowledge.

### Requirements doc: redundant ACs across requirements
**What went wrong:** R1 included site-level title/description metadata, then R11 defined the full metadata policy per page. Redundancy between the two.
**Why:** R1 was written first as a "catch-all" for the shell. When R11 was added later for metadata, the overlap wasn't cleaned up.
**Correct approach:** When adding a new requirement that subsumes part of an existing one, remove the overlapping ACs from the original. Each AC should have exactly one owning requirement.

### Requirements doc: under-specified page vs siblings in same requirement
**What went wrong:** R5 specified "render the home page" for `/` but gave explicit content contracts (title + rendered prose) for `/about` and `/contact`. Inconsistency within the same requirement.
**Why:** Home page felt "obvious" so got less attention. But requirements should be uniform — if sibling routes specify what's displayed, so should the home route.
**Correct approach:** When a requirement covers multiple routes, give each route the same level of content specification. Flag any that differ and explain why.

### Requirements doc: content field references should cite their guarantee
**What went wrong:** R8 referenced agent `personality` and `capabilities` without noting where those fields are guaranteed. If Spec 4 changes, this requirement silently breaks.
**Why:** Assumed the reader knows the Agent content type. Requirements should be self-contained enough to trace dependencies.
**Correct approach:** When a requirement depends on specific content fields, cite the dependency explicitly (e.g., "guaranteed required by Agent content type — see Dependencies section").

### Requirements doc: missing accessibility criteria for interactive components
**What went wrong:** Hamburger menu had no ACs for `aria-label`, `aria-expanded`, keyboard operability, or `aria-current="page"` on active links.
**Why:** Focused on visual behavior (toggle open/close) without considering assistive technology and keyboard interaction.
**Correct approach:** Every interactive UI component in requirements must specify: accessible label, state communication to AT, and keyboard operability. Add these as explicit ACs, not design-phase afterthoughts.

### Requirements doc: missing page metadata / SEO requirement
**What went wrong:** No requirement for per-page `<title>`, meta description, Open Graph, or canonical URLs on a personal/professional website.
**Why:** Focused on layout and navigation, overlooked that discoverability and shareability are core outcomes for a freelancer site.
**Correct approach:** For any public-facing site, include a metadata requirement covering title pattern, descriptions, OG basics, and canonical URLs. This is a requirements-level concern, not design.

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

### External links always open in new tab
All external hrefs (`http://` / `https://`) must have `target="_blank" rel="noopener noreferrer"`. This applies to both hardcoded links in components and MDX-rendered content. Enforced via custom `MdxAnchor` component in `renderMDX`.

### Lorenzo's GitHub handle is `lollo-santucci`
Not `lorenzosantucci`. Use `https://github.com/lollo-santucci` everywhere. LinkedIn is `https://linkedin.com/in/lorenzosantucci` (confirmed correct).

### Metadata policy: static metadata vs generateMetadata by route type
Pure index pages (projects, blog) export `const metadata`. Content-entity-backed pages (home, about, contact) and dynamic routes (`[slug]` pages) use `generateMetadata()` to read entity fields (title, description). Refined from original rule that all static routes use `const metadata` — entity-backed pages need dynamic metadata to pull from content system.

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

### Testing async server components in jsdom
Async server components (e.g., `AboutPage`) can't be rendered directly with `render(<AboutPage />)`. Call the function, await the result, then render: `const el = await AboutPage(); render(el);`. For components with params, pass a resolved Promise: `{ params: Promise.resolve({ slug: 'x' }) }`.

### Per-file vitest environment for component tests
Existing content loader tests use Node environment. Component tests need jsdom. Instead of changing the global vitest config, use `// @vitest-environment jsdom` at the top of each component test file. Avoids breaking existing Node-based tests.

### PBT with String.replace and special replacement patterns
`String.prototype.replace('%s', title)` breaks when `title` contains `$&`, `$'`, etc. (special replacement patterns). Use `template.split('%s')` + concatenation instead. Discovered during Property 6 (title template) testing.

### Next.js 16 + Tailwind v4 as bootstrap baseline
Next.js 16.1.6, Tailwind 4.2.1, ESLint 9.39.4 (flat config), TypeScript 5.9.3. Tailwind v4 uses CSS-based config. ESLint uses flat config. Prettier standalone (no ESLint integration).
