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

### Misread "manuale" as CLI instead of dashboard
**What went wrong:** Lorenzo asked for a "deployment manuale su vercel" and I gave CLI instructions. He clarified he meant the Vercel dashboard (vercel.com), not the CLI.
**Why:** Assumed "manuale" meant "from the terminal" rather than "from the browser UI".
**Correct approach:** When Lorenzo says "manuale su [platform].com", he means the web dashboard flow. Ask for clarification if ambiguous.

## Decisions Log

## Mistakes & Corrections

### Cross-link data loading breaks all old page tests when pages are redesigned
**What went wrong:** Redesigned pages load agents/projects/blogPosts for cross-link sections via `Promise.all`. Old test mocks only mocked the page's primary content loader (e.g., `getBlogPosts` for blog index) but not `getAgents`/`getProjects`. This caused 16 test files to fail simultaneously at the checkpoint.
**Why:** Cross-link data is a new architectural pattern (InnerPageLayout + CrossLinks) that touches every inner page. Old tests had no awareness of it.
**Correct approach:** When adding a cross-cutting data dependency to all pages (like cross-links), update the mock pattern in ALL page test files in the same task — or at minimum, document the required mock shape so the test update task has a clear pattern. Mock ALL content loader exports the page imports, not just the primary one.

### Duplicate test files accumulated across specs (src/__tests__/app/ vs src/__tests__/pages/)
**What went wrong:** Two sets of page tests existed: `src/__tests__/app/` (from earlier specs) and `src/__tests__/pages/` (from core-content-pages spec). Both tested the same pages with different patterns. When pages were redesigned, both sets broke.
**Why:** Later specs created new test files in `src/__tests__/pages/` without deleting the originals in `src/__tests__/app/`.
**Correct approach:** When creating new test files for existing pages, delete the old test files in the same task. One page = one test file. Grep for existing tests before creating new ones.

### Extending a type interface breaks existing loader tests and template alignment tests
**What went wrong:** Adding required fields to the Agent interface broke: (1) agent loader integration tests that create temp YAML fixtures without the new fields, (2) content-templates test whose metadata map didn't include the new fields, (3) template had dropped `portrait` but the TS interface still had it.
**Why:** The type extension was done without checking all consumers — temp test fixtures, template metadata maps, and template-interface alignment tests.
**Correct approach:** When extending a type interface with new required fields, grep for all test fixtures that create instances of that type (including temp files in integration tests) and update them. Also verify the content template and the template-alignment test metadata map stay in sync with the TS interface.

### Subagent design doc leaked task-level detail and had precision errors
**What went wrong:** Design doc for Spec 9 had: (1) detailed test file listings and per-file coverage (task-level), (2) Header described as server then client (contradictory deliberation), (3) about sidebar coupling unjustified, (4) spritesheet grid dimensions and exact shadow offsets (implementation-level), (5) P9 checked hex colors instead of hardcoded pixel values, P3 domain unbounded, P8/P10 mislabeled as PBT.
**Why:** Subagent included implementation planning in the design doc and didn't verify correctness property precision against what they actually validate.
**Correct approach:** Design docs state structure and decisions, not test file checklists. Resolve architectural contradictions upfront (don't show deliberation). Justify coupling with explicit tradeoff callouts. Keep visual details at design-intent level, reference Figma for exact values. Verify each correctness property's domain and check target match the stated requirement.

### Subagent requirements doc too design-heavy for application spec (four rounds of fixes)
**What went wrong:** Subagent-generated requirements for Spec 9 needed four rounds: (1) implementation details, fuzzy ACs, no priority tiers. (2) Font names/sizes, hardcoded UI strings, CSS variable prescriptions, semi-subjective ACs. (3) Solution-shaped ACs prescribing UI composition, qualitative criteria, inconsistent abstraction levels. (4) Remaining qualitative terms ("prominent size", "visually distinguished"), over-abstracted identity anchors (overlay/menu/sidebar lost RPG identity), inconsistent "is/are a design decision" phrasing.
**Why:** Each pass removed one layer but exposed the next. Round 3 over-corrected by stripping identity-defining patterns along with prescriptive composition.
**Correct approach:** Four-layer cleanup: mechanism → design values → composition → qualitative terms + identity calibration. Preserve identity anchors (RPG-style menu, agentdex-style sidebar) as behavioral requirements while delegating visual details. Normalize phrasing ("is a design decision" everywhere). Budget 4 review passes for large application specs.

### Namespace import (`import * as`) does NOT break Turbopack static tracing
**What went wrong:** Tried switching `import { readFile } from 'node:fs/promises'` to `import * as fsPromises` to prevent Turbopack from tracing dynamic `readFile` calls. Warnings persisted — Turbopack traces through namespace imports too.
**Why:** Assumed namespace imports would be opaque to Turbopack's static analysis. They aren't.
**Correct approach:** Turbopack's overly broad file pattern warnings for dynamic `fs.readFile` paths are a known limitation. The warnings are cosmetic (build succeeds). Revert the unnecessary change and accept the warnings until Turbopack provides a suppression mechanism or the content loader is refactored to use static paths.

### strReplace dropped adjacent line when replacement boundary was too narrow
**What went wrong:** A `strReplace` targeting `readFile(filePath, 'utf-8');\n    const fileSlug = ...` replaced both lines but the new text only included the `readFile` line, silently dropping `const fileSlug = basename(filename, ext)`.
**Why:** The `oldStr` boundary included the next line but `newStr` didn't reproduce it.
**Correct approach:** When using strReplace, always verify that `newStr` preserves all lines from `oldStr` that should survive. Read the file after replacement to confirm.

### Adding new imports to layout.tsx breaks existing layout tests
**What went wrong:** Task 1.3 added `next/font/local` and `next/font/google` imports to `layout.tsx`. The existing `layout.test.tsx` didn't mock these modules, causing test failures caught only at the final checkpoint.
**Why:** The task focused on the implementation file without checking for existing tests that import it.
**Correct approach:** When modifying a file that has existing tests, check and update those tests in the same subtask — don't defer to a checkpoint. Grep for the file's import path across `src/__tests__/`.

### Design doc: Blockquote contrast ratio stated as 4.5:1 without verification
**What went wrong:** Design doc claimed white (#fffdfa) on violet (#b87dfe) met 4.5:1 contrast. Actual ratio is ~3.2:1, which only meets WCAG AA for large text (3:1 threshold). Requirements R13 AC2 also specified 4.5:1 incorrectly.
**Why:** Contrast ratio was asserted without computing it. The subagent generated the claim and it wasn't verified.
**Correct approach:** Always compute contrast ratios before claiming compliance. When the design contradicts requirements, update requirements to match reality (per existing learning). State the actual ratio and the WCAG threshold it meets.

### Design doc: hardcoded pixel values in Tailwind classes contradicted "zero hardcoded pixels" property
**What went wrong:** Design doc used `border-[10px]`, `max-w-[1312px]`, `xl:px-[100px]` etc. while Property 1 and Requirements 1.9/4.4 claimed zero hardcoded pixel values in component markup.
**Why:** Tokens were defined as CSS custom properties but not registered in `@theme`, so components had to use arbitrary value syntax instead of named utilities.
**Correct approach:** Register all design tokens in `@theme` so components use named utilities (`border-collection`, `max-w-content-max`, `px-page-px`). Document explicitly which values use arbitrary syntax (xl typography, mobile border override) and why, with permitted exceptions in the correctness property.

### Requirements doc: adoption points leaked into foundation component specs
**What went wrong:** After first round of fixes, component requirements still listed specific pages where they'd be used (e.g., "RPG Selector used in landing, agentdex, blog", "CTA Banner on every inner page"). Also: ambiguous ACs survived ("visible focus indicator", "descriptive alt text"), and some ACs still described mechanism ("expose as CSS variable", "configure Tailwind typography plugin"). Omnibus R16 mixed build/responsive/accessibility.
**Why:** Didn't fully separate component contract definition from component adoption. Vague criteria and mechanism language survived the first pass.
**Correct approach:** Foundation specs define component contracts (props, visual behavior, accessibility). Adoption points (which pages use which components) belong in the application spec. Quantify all ACs (e.g., "3px solid var(--accent) with 2px offset" not "visible focus indicator"). Split omnibus requirements into focused single-concern requirements.

### Requirements doc: implementation details, duplications, vague criteria, over-scoping
**What went wrong:** Design system foundations requirements doc had: (1) implementation details in ACs (`next/font/local`, `@theme directive`, "build process SHALL treat as violation"), (2) duplications across R1/R4/R17/R19/R20, (3) vague criteria ("no layout shift", "visually appropriate", "inviting"), (4) page-level redesigns (ProjectCard, blog/agent list) that belong in the application spec, not foundations.
**Why:** Subagent generated requirements too close to the spec prompt's implementation-heavy language without filtering for requirements-level abstraction.
**Correct approach:** Strip implementation mechanism from ACs (state what, not how). Merge overlapping requirements. Replace vague criteria with measurable checks (e.g., "no FOIT" instead of "no layout shift", contrast ratio instead of "readable"). Keep foundation specs to tokens + base components; page-level redesigns go in the application spec.

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

### [Consolidated] Design doc authoring lessons (from site-shell, core-content-pages, agentdex-shell, design-system-foundations specs)
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
- **Contrast ratios**: always compute actual contrast ratios before claiming compliance. State the actual ratio and the specific WCAG threshold it meets (normal text 4.5:1 vs large text 3:1).
- **Token-utility alignment**: when a design doc claims "no hardcoded values", ensure all referenced values are actually registered as named theme tokens. Document permitted exceptions explicitly.
- **Semantic ambiguity**: close open semantic decisions (e.g., "heading or span") with a concrete prop API in the design doc. Don't leave implementation-time choices for presentational components.
- **Overflow/truncation**: for constrained-width components (flex rows, collection items), specify overflow handling, truncation strategy, and shrink behavior — not just layout direction and alignment.
- **No task-level detail in design docs**: test file listings, per-file coverage tables, and code-level testing patterns (`const el = await Page()`) belong in tasks.md. Design docs keep: testing approach, PBT calibration table, test environment config.
- **Resolve architectural contradictions upfront**: don't show deliberation ("Decision: X becomes client because..."). State the decision as fact. If a component's server/client boundary changes during design, update all references consistently.
- **Justify coupling with tradeoff callouts**: when a design creates a content dependency (e.g., about page → agent entity), add a Key Design Decision callout explaining why, documenting the fallback, and noting the content dependency.
- **Correctness property precision**: verify each property's input domain matches the real use case (e.g., agent index 0–999, not "any non-negative integer"). Verify the check target matches the requirement (pixel values, not hex colors). Classify file-scan checks as unit tests, not PBT.

### [Consolidated] Requirements doc authoring lessons (from site-shell, core-content-pages, agentdex-shell, design-system-foundations specs)
- **No implementation names**: requirements describe behaviors, not component names, function names, or library names.
- **No design-forward phrasing**: don't steer the design from within ACs ("The design SHALL specify..."). State the behavioral outcome only.
- **No implementation mechanism in ACs**: don't specify `next/font/local`, `@theme directive`, or specific build tooling. State the outcome ("fonts load without FOIT"), not the mechanism.
- **Implementation-specific CSS**: state the behavioral need ("consistent dimensions regardless of aspect ratio"), not the CSS technique.
- **Vague criteria must be measurable**: replace "no layout shift" with "no FOIT", "visually appropriate" with specific ranges, "inviting" with nothing. If you can't test it, don't write it as an AC.
- **Merge overlapping requirements**: if multiple requirements cover the same concern (e.g., colors in R1 + global styles in R17 + responsive in R19), merge them. Each concern has exactly one owner requirement.
- **Foundation vs application scope**: token/component specs cover definitions only. Page-level redesigns and component migrations belong in the application spec.
- **No adoption points in foundation specs**: component requirements define the contract (props, visual behavior, accessibility). Where components are used on specific pages belongs in the application spec, not the foundation spec.
- **Quantify all ACs**: replace "visible focus indicator" with "3px solid var(--accent) with 2px offset", "descriptive alt text" with "non-empty alt string", "consistent gap" with "8–12px gap". If you can't measure it, don't write it as an AC.
- **Single-concern requirements**: don't create omnibus requirements mixing build integrity + responsiveness + accessibility. Split into focused requirements so each can be verified independently.
- **Centralize cross-cutting specs as glossary terms**: when the same visual/behavioral spec (e.g., focus outline) appears in multiple component requirements, define it once as a glossary term with a single AC, then have components "inherit" it by reference. Avoids repetition and inconsistency risk.
- **Compositional component contracts**: for container/wrapper components (e.g., Collection_Row), specify the slot API (children, action slot), alignment, and responsive behavior — not just "flex row with two areas". Match the specificity level of other components in the same spec.
- **No editorial notes in ACs**: "NOTE: the design doc SHALL..." is meta-commentary, not a normative criterion. Rewrite as a proper AC: "THE system SHALL define a documented strategy for X."
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
- **Priority tiers**: large specs should classify requirements as Core (must-have) vs Polish (enhancement). Mark polish requirements explicitly so they can be deferred without blocking the site.
- **Fuzzy timing/effect values**: when an AC involves timing, animation intervals, or visual effects that are design-intent rather than testable contracts, phrase as "configurable, exact value is a design decision (suggested: X)" — not as a hard AC.
- **Subjective content quality**: replace "realistic values" or "readable sentence" with verifiable checks: no TODO markers, no lorem ipsum, no empty required fields, passes loader validation.
- **Cross-cutting AC deduplication**: when responsive, accessibility, or structural ACs appear in both per-page requirements and cross-cutting requirements (R21/R23), keep the specific version in one place only. Per-page requirements reference the cross-cutting requirement; cross-cutting requirements don't re-list per-page details.
- **No composition prescription**: state WHAT information must be displayed, not HOW it's composed. Decorative elements (prefixes, visual effects, component choices) are design decisions. Name Spec 8 components only when the requirement IS about adopting them (e.g., Collection_Container for indexes), not as decorative prescriptions.
- **Qualitative → measurable or delegated**: replace "muted text", "visually dimmed", "large display size" with either measurable criteria or explicit "the specific styling is a design decision" delegation. No middle ground.
- **Three review passes for large application specs**: round 1 catches mechanism, round 2 catches design-level values, round 3 catches composition and qualitative terms, round 4 calibrates identity anchors vs over-abstraction. Budget up to 4 passes.
- **Abstraction floor — preserve identity anchors**: when abstracting away composition details, don't strip identity-defining behavioral patterns (RPG-style menu, agentdex-style sidebar, full-screen overlay navigation). These are product identity, not design prescription. The design doc needs anchors to build from, not a blank slate. State the distinctive pattern as a behavioral requirement; delegate only the visual details.

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

### Requirements priority tiers: Core vs Polish
Large specs (10+ requirements) classify each requirement as Core (must-have: layout, structure, navigation, data model, accessibility, build integrity) or Polish (enhancement: micro-interactions, animation state machines, decorative effects). Polish requirements are marked with **(Polish)** in the title and may be deferred. The site is shippable with only Core complete.

### Tailwind v4 token registration strategy: named utilities vs arbitrary values
Colors, font families, border widths, spacing, and container widths are registered via `@theme` and produce named Tailwind utilities. Typography sizes at xl breakpoint use arbitrary values (`xl:text-[128px]`) because they're one-off Figma sizes. Collection container mobile border (`border-[6px]`) is the only other arbitrary pixel value.

### SectionLabel semantic control via `as` prop
SectionLabel accepts `as?: 'h2' | 'h3' | 'h4' | 'span'` (defaults to `'span'`). Visual styling is identical regardless of `as` value — the prop controls rendered HTML element only. Callers choose heading level based on context.

### Blockquote contrast: 3:1 large text threshold, not 4.5:1
White (#fffdfa) on violet (#b87dfe) yields ~3.2:1 contrast. Meets WCAG AA for large text (≥3:1) only. Blockquote text must remain ≥24px at all breakpoints to satisfy this threshold.

### StatBar clamping over strict typing
StatBar accepts `value: number` and clamps to 1–5 rather than strict union type. Content loader doesn't validate numeric ranges; clamping ensures reasonable rendering. Seed validation tests catch invalid data.

### Design system spec scoping: foundations vs application
Spec 08 (design-system-foundations) covers tokens (colors, typography, spacing, borders) and base UI components only. Page-level redesigns (ProjectCard offset shadow, blog/agent list migration to collection rows, StatusBadge deprecation) are deferred to Spec 09 (design system application).

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

### About page sidebar loads Lorenzo's agent entity
The about page profile sidebar displays Lorenzo's agent data (role, bestFor, mission, toneOfVoice) loaded via `getAgentBySlug('lorenzo-santucci')`. This requires a `content/agents/lorenzo-santucci.yaml` file with Agent_Extended_Fields. Content dependency, not hardcoded data.

### Title template separator: pipe, not em dash
Root layout `title.template` updated from `'%s — Lorenzo Santucci'` (em dash) to `'%s | Lorenzo Santucci'` (pipe) per Spec 9 requirements R22.

### Header is a client component in Spec 9
Header owns menu open/close state (`useState`) and passes it to MenuOverlay. This makes Header a `'use client'` component. All other new Spec 9 components are server components except TottiSprite (also client, for animation).

### Cross-link data loading pattern for inner pages
Every inner page loads cross-link data (blog posts, projects, agents) alongside its primary content via `Promise.all`. Cross-link sections show the latest 3 items from each linked section. Test mocks must include ALL content loader exports the page uses, not just the primary one. Standard mock shape: `vi.mock('@/lib/content', () => ({ getPageBySlug: vi.fn(), renderMDX: vi.fn(), getBlogPosts: vi.fn(), getProjects: vi.fn(), getAgents: vi.fn(), ... }))`.

### Landing page full-height at all breakpoints (overrides R5 AC5/AC6 split)
Lorenzo requested "a tutta altezza" without breakpoint qualifier. Implementation uses `min-h-[100dvh]` unconditionally instead of the spec's `md:`-only constraint. On mobile, `min-h` still allows scrolling when content overflows, so AC5 (scrollable on mobile) is preserved. Uses `dvh` (dynamic viewport height) to handle mobile browser chrome correctly.

### "Lorenzo Santucci" text: white fill + black stroke (from Figma)
Figma specifies `color: #FFFDFA` (white) with `-webkit-text-stroke` in black. Landing page h1: 10px stroke. Header logo: 5px stroke. Uses `text-surface` for fill color and inline `style={{ WebkitTextStrokeWidth, WebkitTextStrokeColor }}` since Tailwind has no text-stroke utilities. This is a permitted inline style exception alongside xl typography arbitrary values.

### InnerPageLayout mock pattern for page tests
Page tests mock InnerPageLayout as a simple pass-through: `({ title, children }) => <div><h1>{title}</h1><div>{children}</div></div>`. This lets tests verify page-specific content without testing the shared layout structure. Same pattern for Breadcrumb, ChatSection, ProjectMetadataPanel mocks.
