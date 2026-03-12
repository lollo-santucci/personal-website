# Design Document: Content Directory Templates

## Overview

This design specifies the creation of template files and a README for the `content/` directory. Templates are documentation-only artifacts — they show content authors the complete field schema for each content type without requiring them to read TypeScript source. The README provides a single-page reference for directory structure, naming conventions, and authoring workflow.

### Key Design Decisions

1. **Templates are documentation, not code** — Template files use a `_` prefix (`_template.mdx`, `_template.yaml`) to signal they should never be loaded as content. The content loader (future spec) will enforce this by skipping `_`-prefixed files. Templates contain syntactically valid frontmatter/YAML so they don't break the build.

2. **Inline comments as the annotation mechanism** — Every field in a template is annotated with a `#` comment indicating required/optional status, type format, and allowed values. This keeps the documentation co-located with the field it describes, which is more useful than a separate reference doc.

3. **Placeholder values are realistic but obviously fake** — Placeholder strings use descriptive text that communicates the field's purpose (e.g. `"Your Page Title"` not `"string"`). Enum fields show the default/most-common value with all options listed in the comment. This lets authors copy-paste and edit rather than construct from scratch.

4. **Superset approach for discriminated unions** — The Character template shows all fields from all branches of the union in a single file, with comments explaining the conditional logic (`agentSlug` required when `type: agent`). This avoids multiple template files per type and matches how YAML authors actually work.

5. **Dialogue template shows structural variety** — The Dialogue template includes multiple example lines demonstrating different shapes: a simple line, a line with choices, a line with an action, and a line with a condition. This teaches the structure through example rather than abstract description.

6. **README references templates, doesn't duplicate them** — The Field Reference section in the README points authors to the template files rather than reproducing every field matrix. This avoids drift between the README and templates.

7. **MDX body placeholder uses a comment** — MDX templates include a brief placeholder body section after the frontmatter to remind authors that the body maps to the `content` field. The placeholder is valid MDX.

## Architecture

```
content/
├── README.md                        ← Authoring guide (R3)
├── pages/
│   └── _template.mdx                ← Page template (R1)
├── projects/
│   └── _template.mdx                ← Project template (R1)
├── blog/
│   └── _template.mdx                ← BlogPost template (R1)
├── services/
│   └── _template.mdx                ← Service template (R1)
├── agents/
│   └── _template.yaml               ← Agent template (R2)
├── locations/
│   └── _template.yaml               ← Location template (R2)
├── characters/
│   └── _template.yaml               ← Character template (R2)
└── dialogues/
    └── _template.yaml               ← Dialogue template (R2)
```

All template files sit alongside real content files in their respective directories. The `_` prefix visually separates them in directory listings and provides the exclusion hook for the content loader.

## Components and Interfaces

### MDX Template Structure (R1)

Each MDX template follows this structure:

```
---
# [Content Type] Template
# Copy this file, rename to your-slug.mdx, and fill in the fields.

field: placeholder          # REQUIRED — description
optionalField: placeholder  # OPTIONAL — description
---

<!-- Body content goes here (maps to the "content" field) -->
```

Structural constraints:
- Each field has an inline comment: `REQUIRED` or `OPTIONAL`, followed by format/constraint info
- Nested objects (e.g. `links`, `cta`) are shown with their sub-fields using the same comment pattern
- Enum fields list all valid options in the comment
- Branded types include format hints in comments (e.g. "kebab-case", "ISO 8601")
- Body section after `---` contains a placeholder for the `content` field

Editorial choices (field ordering, comment header wording, array syntax style) are left to implementation.

### YAML Template Structure (R2)

Each YAML template follows this structure:

```yaml
# [Content Type] Template
# Copy this file, rename to your-slug.yaml, and fill in the fields.

field: placeholder          # REQUIRED — description
optionalField: placeholder  # OPTIONAL — description
```

Structural constraints:
- Same comment annotation pattern as MDX (`REQUIRED`/`OPTIONAL` + format info)
- Conditional fields (like `agentSlug` in Character) include a comment explaining the condition
- Nested arrays of objects (like `lines` in Dialogue) show representative examples of different shapes

Editorial choices (indentation style, field ordering, object syntax) are left to implementation.

### Content README Structure (R3)

The README follows a fixed section order matching R3's required sections:

1. **Directory Structure** — Tree listing of all 8 subdirectories with one-line descriptions
2. **Naming Conventions** — Filename, slug, location, action type, and character type conventions
3. **Authoring Workflow** — Step-by-step: copy template → rename → fill required → add optional
4. **Field Reference** — Per-type summary pointing to the template file for full details
5. **Slug & Date Formats** — Slug format rules and ISO 8601 date format
6. **Cross-Reference Pattern** — Slug-based references, never file paths

### Template-TypeScript Alignment Rules (R4)

These rules govern how TypeScript interfaces map to template fields:

| TS Concept | Template Representation |
|---|---|
| Required field (`field: Type`) | Field with `# REQUIRED` comment |
| Optional field (`field?: Type`) | Field with `# OPTIONAL` comment |
| `string` | Descriptive placeholder string |
| `Slug` | Kebab-case example with format note |
| `IsoDateString` | `"2025-01-15"` with ISO 8601 note |
| `AssetPath` | Path example with format note |
| `DialogueId` / `LineId` | ID example with format note |
| `string[]` | YAML list with example items |
| `Slug[]` | YAML list with kebab-case examples |
| String literal union | One value shown, all values in comment |
| `boolean` | `true` or `false` with note |
| `number` | `0` with note |
| Nested object (`{ ... }`) | Indented YAML block |
| Optional nested object (`field?: { ... }`) | Indented block with `# OPTIONAL` on parent |
| `content: string` (MDX types) | MDX body section, not in frontmatter |
| Discriminated union | Superset of all branches, conditions in comments |

### Build Compatibility (R6)

Templates must not break `pnpm build`:
- MDX templates contain syntactically valid YAML frontmatter (proper `---` delimiters, valid YAML between them)
- YAML templates contain syntactically valid YAML (proper indentation, quoting where needed, valid list syntax)
- No template imports or references any code module
- Templates are inert files — they exist on disk but are not consumed by any build step

## Data Models

This spec creates no new data models. It produces documentation files that mirror the existing TypeScript interfaces defined in the content-entity-types spec. The field matrices in the requirements document (R1, R2) are the authoritative mapping between TS interfaces and template fields.

### File Inventory

| File | Format | Source Interface | Field Count |
|---|---|---|---|
| `content/pages/_template.mdx` | MDX | `Page` | 3 frontmatter + body |
| `content/projects/_template.mdx` | MDX | `Project` | 12 frontmatter + body |
| `content/blog/_template.mdx` | MDX | `BlogPost` | 9 frontmatter + body |
| `content/services/_template.mdx` | MDX | `Service` | 6 frontmatter + body |
| `content/agents/_template.yaml` | YAML | `Agent` | 14 fields |
| `content/locations/_template.yaml` | YAML | `Location` | 14+ fields |
| `content/characters/_template.yaml` | YAML | `Character` | 11 fields |
| `content/dialogues/_template.yaml` | YAML | `Dialogue` | 14+ fields |
| `content/README.md` | Markdown | — | — |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Template-TypeScript field set alignment

*For any* content type and its corresponding template file, the set of field names in the template SHALL exactly equal the set of field names in the TypeScript interface (excluding `content` for MDX types, which maps to the MDX body). No fields may be missing from the template, and no fields may be present in the template that are absent from the interface.

**Validates: Requirements 1.1, 4.1**

### Property 2: Optionality annotation correctness

*For any* field in any template file, if the corresponding TypeScript interface marks the field as optional (`?`), the template comment SHALL mark it `OPTIONAL`. If the interface marks the field as required (no `?`), the template comment SHALL mark it `REQUIRED`.

**Validates: Requirements 4.2**

### Property 3: Enum and branded type documentation completeness

*For any* field in any template whose TypeScript type is a string literal union, the template comment SHALL list every member of that union. *For any* field whose TypeScript type is a branded type (`Slug`, `IsoDateString`, `AssetPath`, `DialogueId`, `LineId`), the template comment SHALL document the expected format.

**Validates: Requirements 4.3**

### Property 4: Template naming convention

*For any* template file created by this spec, the filename SHALL be `_template.mdx` for MDX content types (Page, Project, BlogPost, Service) and `_template.yaml` for YAML content types (Agent, Location, Character, Dialogue). All template filenames start with `_`.

**Validates: Requirements 5.1, 5.2**

### Property 5: Syntactic YAML validity

*For any* template file, the YAML content SHALL parse without errors. For MDX templates, the YAML frontmatter between `---` delimiters SHALL be syntactically valid YAML. For YAML templates, the entire file (excluding comment-only lines) SHALL be syntactically valid YAML.

**Validates: Requirements 6.2, 6.3**

### Property 6: MDX body presence

*For any* MDX template file, there SHALL be non-empty content after the closing frontmatter delimiter (`---`), representing the placeholder for the `content` field.

**Validates: Requirements 1.2**

## Error Handling

No runtime error handling applies — templates are static documentation files. Potential failure modes and mitigations:

| Failure Mode | Mitigation |
|---|---|
| Template field drifts from TS interface after a type change | Manual review; future CI check could diff template fields against TS exports |
| YAML syntax error in template breaks build | Validated by Property 5; `pnpm build` catches this |
| Author copies template but misses renaming `_` prefix | Content loader (future) skips `_`-prefixed files; author gets no content loaded, which is a clear signal |
| Author fills template with wrong enum value | Content loader (future) validates at build time; template comments list all valid values |

## Testing Strategy

This spec produces static documentation files (templates + README) with no runtime logic. The testing approach is lightweight and appropriate for the problem.

### Primary Verification: Build Gate

```bash
pnpm build    # Verifies templates don't break compilation (validates P5, R6.1)
```

A successful `pnpm build` is the primary gate. It confirms that MDX frontmatter and YAML files are syntactically valid and that no build step chokes on the template files.

### Unit Tests (Specific Examples)

Unit tests verify concrete, one-off checks that don't benefit from randomized input:

| Criterion | Test |
|---|---|
| R2.1: Character union branches | Parse `_template.yaml`, verify `agentSlug` field exists with conditional comment |
| R2.2: Dialogue sub-structures | Parse `_template.yaml`, verify `choices`, `action`, `condition` appear in `lines` |
| R3.1: README sections | Parse `content/README.md`, verify all 6 required section headings exist |
| R3.2: README location | Verify file exists at `content/README.md` |
| R6.1: Build passes | `pnpm build` exits with code 0 |

### Parameterized Tests (Correctness Properties)

The correctness properties (P1–P6) are verified as parameterized unit tests iterating over the fixed set of 8 content types. This is not a random-input PBT scenario — the domain is small and enumerable — but parameterization keeps tests DRY and makes adding future content types automatic.

| Property | Test Approach |
|---|---|
| P1: Field set alignment | For each content type, extract field names from TS interface and from template. Assert exact set equality (minus `content` for MDX). |
| P2: Optionality correctness | For each content type, extract optionality from TS interface. Parse template comments for REQUIRED/OPTIONAL. Assert match. |
| P3: Enum/branded completeness | For each enum field, extract union members from TS. Parse template comment. Assert all members listed. For branded types, assert format hint present. |
| P4: Naming convention | For each template file path, assert filename matches `_template.{mdx\|yaml}` with correct extension. |
| P5: YAML validity | For each template, parse YAML content. Assert no parse errors. |
| P6: MDX body presence | For each MDX template, assert non-empty content after closing `---`. |

### What NOT to Test

- Placeholder value quality or comment wording (subjective, design decisions)
- README prose quality (not machine-verifiable)
- Content loader exclusion of `_`-prefixed files (deferred to content-loader spec)
- Runtime field validation (deferred to content-loader spec)
