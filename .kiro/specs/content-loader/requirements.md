# Requirements Document

## Introduction

The content loader is the runtime bridge between raw content files (`content/`) and typed TypeScript objects consumed by Server Components. It reads MDX and YAML files, parses frontmatter and structured data, validates required fields and basic type shape against the TypeScript interfaces from Spec 2, and exposes typed getter functions. The loader replaces the abandoned Contentlayer2 with a simple, file-based approach using `gray-matter`, `js-yaml`, and `next-mdx-remote`.

This spec covers backlog tasks P3-T03 (content loading layer) and P2-T10 (seed content).

## Out of Scope

- Client Component usage (loaders use Node.js `fs` — Server Components only)
- Caching layer (Next.js static generation handles caching)
- World engine content types at full implementation (Location, Character, Dialogue are stubs)
- Cross-reference slug resolution (validating that a `relatedProjects` slug points to an existing project — deferred to a future validation pass)
- MDX custom components or plugins (deferred to UI component spec)
- Content hot-reloading in development

## Source of Truth Precedence

When sources conflict on field names, types, or optionality:

1. **TypeScript interfaces in `src/lib/types/`** (Spec 2) — authoritative for field names, types, and optionality
2. **Content templates in `content/`** (Spec 3) — authoritative for frontmatter field names and structure
3. **`.kiro/steering/content-system.md`** — authoritative for content conventions
4. **`.kiro/steering/structure.md`** — authoritative for directory paths and naming conventions
5. **This spec** — illustrative only where examples are given; interfaces win on conflict

## Glossary

- **Content_Loader**: A module in `src/lib/content/` that reads, parses, and validates content files, returning typed objects for Server Components.
- **Content_System**: The overall content layer comprising files in `content/`, TypeScript types in `src/lib/types/`, and loaders in `src/lib/content/`.
- **MDX_Loader**: A Content_Loader for MDX-based content types (Page, Project, BlogPost, Service). Parses frontmatter with `gray-matter`.
- **YAML_Loader**: A Content_Loader for YAML-based content types (Agent). Parses files with `js-yaml`.
- **Stub_Loader**: A Content_Loader that returns empty arrays and null values. Used for world engine types (Location, Character, Dialogue) deferred to a future spec.
- **Frontmatter**: YAML metadata block at the top of an MDX file, delimited by `---`.
- **Slug**: A URL-safe kebab-case content identifier (branded type).
- **IsoDateString**: A date in ISO 8601 format, e.g. `2025-01-15` (branded type).
- **AssetPath**: A file path referencing a visual asset (branded type).
- **Seed_Content**: Real (non-placeholder) content files used to verify the loader works end-to-end.
- **Server_Component**: A Next.js App Router component that runs on the server and can use Node.js APIs.
- **Barrel_Export**: A single `index.ts` that re-exports all public functions from a module.

## Requirements

### Requirement 1: Runtime Dependencies

**User Story:** As a developer, I want the necessary parsing libraries installed, so that the content loader can parse MDX frontmatter and YAML files.

#### Acceptance Criteria

1. THE Content_System SHALL have `gray-matter` installed as a production dependency for parsing MDX frontmatter.
2. THE Content_System SHALL have `js-yaml` installed as a production dependency for parsing YAML files.
3. THE Content_System SHALL have `@types/js-yaml` installed as a development dependency for TypeScript type definitions.
4. THE Content_System SHALL have `next-mdx-remote` installed as a production dependency for rendering MDX in Server Components.
5. WHEN dependencies are installed, THE project SHALL compile with `pnpm build` without errors.

### Requirement 2: MDX Content Loaders

**User Story:** As a developer, I want typed loader functions for each MDX content type, so that Server Components can retrieve content as typed objects without manual file parsing.

#### Loader Function Signatures

By-slug functions accept `string` (not `Slug`) as parameter type. This is an intentional API ergonomics choice: callers (route params, URL segments) provide plain strings, and requiring branded `Slug` at the call site would force unnecessary casting in every consumer. The loader handles branding internally.

| Module | List function | Single function |
|---|---|---|
| `src/lib/content/pages.ts` | `getPages(): Promise<Page[]>` | `getPageBySlug(slug: string): Promise<Page \| null>` |
| `src/lib/content/projects.ts` | `getProjects(): Promise<Project[]>` | `getProjectBySlug(slug: string): Promise<Project \| null>` |
| `src/lib/content/blog.ts` | `getBlogPosts(): Promise<BlogPost[]>` | `getBlogPostBySlug(slug: string): Promise<BlogPost \| null>` |
| `src/lib/content/services.ts` | `getServices(): Promise<Service[]>` | `getServiceBySlug(slug: string): Promise<Service \| null>` |

#### Acceptance Criteria

1. WHEN a list function is called, THE MDX_Loader SHALL read all `.mdx` files from the corresponding `content/<type>/` directory.
2. WHEN reading files, THE MDX_Loader SHALL skip files whose filename starts with `_` (template files).
3. WHEN an MDX file is read, THE MDX_Loader SHALL parse frontmatter using `gray-matter` and return a typed object matching the corresponding TypeScript interface from `src/lib/types/`.
4. THE MDX_Loader SHALL populate the `content` field with the raw MDX body string (the portion after frontmatter).
5. WHEN a by-slug function is called with a slug that matches no file, THE MDX_Loader SHALL return `null`.
6. WHEN a by-slug function is called with a slug that matches a file, THE MDX_Loader SHALL return the typed object for that file.

### Requirement 3: MDX Content Sorting

**User Story:** As a developer, I want list functions to return content in a predictable order, so that views can render content without additional sorting logic.

#### Sort Order Matrix

| Content type | Primary sort | Secondary sort | Direction |
|---|---|---|---|
| BlogPost | `date` | — | descending (newest first) |
| Project | `order` (if present) | `title` | ascending |
| Service | `order` (if present) | `title` | ascending |
| Page | `title` | — | ascending |

#### Sorting Rules

- `order` values: `0` is a valid order value and sorts before `1`. Items without `order` (undefined) sort after all items with `order`.
- `title` comparison: case-insensitive (`localeCompare` with default locale).
- `date` tiebreaker: when two blog posts share the same `date`, they SHALL be sorted by `title` ascending as tiebreaker.

#### Acceptance Criteria

1. WHEN `getBlogPosts()` is called, THE MDX_Loader SHALL return blog posts sorted by `date` descending, then by `title` ascending (case-insensitive) as tiebreaker.
2. WHEN `getProjects()` is called, THE MDX_Loader SHALL return projects sorted by `order` ascending (`0` is valid; items without `order` placed after items with `order`), then by `title` ascending (case-insensitive).
3. WHEN `getServices()` is called, THE MDX_Loader SHALL return services sorted by `order` ascending (`0` is valid; items without `order` placed after items with `order`), then by `title` ascending (case-insensitive).
4. WHEN `getPages()` is called, THE MDX_Loader SHALL return pages sorted by `title` ascending (case-insensitive).

### Requirement 4: YAML Content Loader for Agents

**User Story:** As a developer, I want a typed loader for Agent entities, so that Server Components can retrieve agent data from YAML files.

#### Acceptance Criteria

1. WHEN `getAgents()` is called, THE YAML_Loader SHALL read all `.yaml` and `.json` files from `content/agents/`.
2. WHEN reading files, THE YAML_Loader SHALL skip files whose filename starts with `_`.
3. WHEN a YAML or JSON file is read, THE YAML_Loader SHALL parse it using `js-yaml` (for `.yaml`) or `JSON.parse` (for `.json`) and return a typed `Agent` object.

4. WHEN `getAgentBySlug()` is called with a slug that matches no file, THE YAML_Loader SHALL return `null`.
5. WHEN `getAgentBySlug()` is called with a slug that matches a file, THE YAML_Loader SHALL return the typed `Agent` object for that file.

### Requirement 5: Stub Loaders for World Engine Types

**User Story:** As a developer, I want stub loader files for Location, Character, and Dialogue, so that the module structure is complete and imports resolve, even though implementation is deferred to the world engine phase.

#### Acceptance Criteria

1. THE Stub_Loader for locations (`src/lib/content/locations.ts`) SHALL export `getLocations(): Promise<Location[]>` returning an empty array and `getLocationBySlug(slug: string): Promise<Location | null>` returning `null`.
2. THE Stub_Loader for characters (`src/lib/content/characters.ts`) SHALL export `getCharacters(): Promise<Character[]>` returning an empty array and `getCharacterBySlug(slug: string): Promise<Character | null>` returning `null`.
3. THE Stub_Loader for dialogues (`src/lib/content/dialogues.ts`) SHALL export `getDialogues(): Promise<Dialogue[]>` returning an empty array and `getDialogueBySlug(slug: string): Promise<Dialogue | null>` returning `null`.
4. Each Stub_Loader SHALL include a code comment indicating that implementation is deferred to the world engine spec.

### Requirement 6: Content Validation

**User Story:** As a developer, I want the loader to validate content at build time, so that missing, malformed, or incorrectly typed content is caught before deployment.

#### Validation Scope

The Content_Loader validates presence of required fields and basic type shape. It does NOT perform deep runtime type-checking of every field (e.g. no regex validation of IsoDateString format, no enum membership checks for `status`). The scope is: required field presence + required fields are non-null/non-undefined + array-typed fields are arrays + parseable file format.

A required field is considered "present and valid" only if:
- It exists in the parsed data, AND
- Its value is not `null` or `undefined`

A field that is present but set to `null` is treated as missing. The loader does NOT validate that a string field contains a string vs. a number, or that `highlight: "true"` is a boolean — YAML/frontmatter parsers handle most type coercion naturally, and deeper shape validation is out of scope for this spec.

#### Error Behavior in List Functions

List functions use a fail-fast strategy: when processing multiple files, the loader throws on the first invalid file encountered. No partial results are returned. This ensures content errors are caught during development rather than silently producing incomplete data.

#### Required Fields per Type

| Content type | Required fields |
|---|---|
| Page | `title`, `slug` |
| Project | `title`, `slug`, `description`, `stack`, `categories`, `status`, `highlight` |
| BlogPost | `title`, `slug`, `excerpt`, `date`, `categories`, `tags` |
| Agent | `name`, `slug`, `role`, `personality`, `capabilities`, `status` |
| Service | `title`, `slug`, `description` |

#### Array-Typed Fields per Type

| Content type | Array fields |
|---|---|
| Project | `stack`, `categories` |
| BlogPost | `categories`, `tags` |
| Agent | `capabilities` |

#### Acceptance Criteria

1. WHEN a content file is missing a required field, THE Content_Loader SHALL throw an error with a message identifying the file path and the missing field name.
2. THE validation error message for missing fields SHALL follow the format: `Content validation error: <file-path> is missing required field "<field-name>"`.
3. WHEN a required field that should be an array (per the Array-Typed Fields table) is present but is not an array, THE Content_Loader SHALL throw an error with the format: `Content validation error: <file-path> field "<field-name>" must be an array`.
4. WHEN a YAML file cannot be parsed (malformed YAML), THE Content_Loader SHALL throw an error with the format: `Content parse error: <file-path> — <parser-error-message>`.
5. WHEN a JSON file cannot be parsed (malformed JSON), THE Content_Loader SHALL throw an error with the format: `Content parse error: <file-path> — <parser-error-message>`.
6. WHEN an MDX file has invalid frontmatter (unparseable by `gray-matter`), THE Content_Loader SHALL throw an error with the format: `Content parse error: <file-path> — <parser-error-message>`.
7. WHEN a required field is present but its value is `null` or `undefined`, THE Content_Loader SHALL treat it as missing and throw the missing-field error (AC 2).
8. WHEN a content file has all required fields present, non-null, and array fields correctly shaped, THE Content_Loader SHALL return the parsed object without error.
9. THE Content_Loader SHALL validate every file processed by list functions and by-slug functions.
10. WHEN a list function encounters an invalid file, THE Content_Loader SHALL fail fast on the first error (no partial results returned).

### Requirement 7: Branded Type Casting

**User Story:** As a developer, I want the loader to cast raw string values to branded types (Slug, IsoDateString, AssetPath), so that downstream code receives properly typed objects without manual casting.

#### Acceptance Criteria

1. WHEN a content file is parsed, THE Content_Loader SHALL cast the `slug` field value to the `Slug` branded type.
2. WHEN a BlogPost is parsed, THE Content_Loader SHALL cast the `date` field value to the `IsoDateString` branded type.
3. WHEN a content file contains `AssetPath` fields (`image`, `portrait`), THE Content_Loader SHALL cast those values to the `AssetPath` branded type.
4. WHEN a content file contains `Slug[]` fields (`relatedProjects`, `relatedAgents`, `characters`), THE Content_Loader SHALL cast each element to the `Slug` branded type.

### Requirement 8: MDX Rendering Utility

**User Story:** As a developer, I want a shared utility for rendering MDX content in Server Components, so that all views use a consistent rendering approach.

#### Acceptance Criteria

1. THE Content_System SHALL provide an MDX rendering utility at `src/lib/content/mdx.ts`.
2. THE MDX rendering utility SHALL use `next-mdx-remote/rsc` for Server Component compatible MDX rendering.
3. THE MDX rendering utility SHALL export a function or component that accepts a raw MDX string and returns rendered output.

### Requirement 9: Barrel Export

**User Story:** As a developer, I want a single import path for all content loader functions, so that consumers do not need to know the internal file structure.

#### Acceptance Criteria

1. THE Content_System SHALL provide a barrel export at `src/lib/content/index.ts`.
2. THE barrel export SHALL re-export all list and by-slug functions from: `pages.ts`, `projects.ts`, `blog.ts`, `agents.ts`, `services.ts`.
3. THE barrel export SHALL re-export the MDX rendering utility from `mdx.ts`.
4. THE barrel export SHALL re-export stub functions from: `locations.ts`, `characters.ts`, `dialogues.ts`.

### Requirement 10: Seed Content

**User Story:** As a developer, I want real seed content files, so that the loader can be verified end-to-end and the site has initial content at launch.

#### Seed Content Matrix

| File path | Content type | Key fields |
|---|---|---|
| `content/pages/about.mdx` | Page | Lorenzo's about page, real biographical content |
| `content/projects/personal-website.mdx` | Project | This project; `status: in-progress`, `highlight: true` |
| `content/blog/hello-world.mdx` | BlogPost | First blog post, real content |
| `content/agents/sales-agent.yaml` | Agent | Sales/estimation agent; `status: coming-soon` |
| `content/services/fullstack-development.mdx` | Service | Full-stack development service offering |

#### Verifiability Criteria

"Real content" is verified by: (a) all required fields present and valid per Requirement 6, (b) MDX body is non-empty (at least 50 characters of non-whitespace text after frontmatter), (c) body does not contain the substrings "lorem ipsum", "placeholder", "TODO", or "TBD" (case-insensitive).

#### Acceptance Criteria

1. Each seed content file SHALL pass the content validation defined in Requirement 6 (all required fields present, non-null, array fields correctly shaped).
2. Each MDX seed content file SHALL have a non-empty MDX body (at least 50 characters of non-whitespace text after frontmatter).
3. Each seed content file SHALL have a filename matching its `slug` field value (kebab-case, no `_` prefix), per Requirement 12.
4. WHEN the Content_Loader reads the seed content files, THE loader SHALL return typed objects without validation errors.
5. THE seed content files SHALL NOT overwrite or conflict with existing template files (templates use `_` prefix).

### Requirement 11: Server Component Compatibility

**User Story:** As a developer, I want all loader functions to work in Next.js Server Components, so that content is loaded at build time or request time on the server.

#### Acceptance Criteria

1. THE Content_Loader SHALL use only Node.js APIs (`fs`, `path`) and server-safe libraries for file operations.
2. THE Content_Loader SHALL resolve content paths using `process.cwd()` as the base directory.
3. THE Content_Loader modules SHALL NOT import or depend on any client-side APIs (browser globals, React hooks, `window`, `document`).
4. WHEN a Content_Loader module is imported in a Server Component, THE import SHALL resolve without errors.

### Requirement 12: Directory Resilience

**User Story:** As a developer, I want the loader to handle missing or empty content directories gracefully, so that the site builds even when a content type has no entries yet.

#### Acceptance Criteria

1. WHEN a content directory does not exist (e.g. `content/blog/` is missing), THE list function SHALL return an empty array (not throw an error).
2. WHEN a content directory exists but contains no matching content files (only `.gitkeep` or templates), THE list function SHALL return an empty array.
3. WHEN a by-slug function is called and the content directory does not exist, THE function SHALL return `null`.

### Requirement 13: File Discovery and Slug Convention

**User Story:** As a developer, I want the loader to follow consistent file discovery and slug rules, so that content authoring is predictable and slug identity is unambiguous.

#### Slug Identity Rule

The filename (without extension) is the canonical slug. The content's declared `slug` field (frontmatter for MDX, top-level field for YAML/JSON) is required and must match the filename-derived slug exactly. This avoids ambiguity between filename and declared slug as sources.

#### Accepted Extensions

YAML content files use `.yaml` extension only. `.yml` is intentionally not supported — this avoids ambiguity and aligns with the project's content templates (Spec 3) which use `.yaml` exclusively.

#### Acceptance Criteria

1. WHEN discovering MDX content files, THE Content_Loader SHALL match files with the `.mdx` extension only.
2. WHEN discovering YAML content files, THE Content_Loader SHALL match files with `.yaml` or `.json` extensions only (`.yml` is not supported).
3. THE Content_Loader SHALL skip files whose filename starts with `_` (template convention from Spec 3).
4. THE Content_Loader SHALL skip `.gitkeep` files.
5. THE Content_Loader SHALL derive the canonical slug from the filename (filename without extension).
6. WHEN the content's declared `slug` field does not match the filename-derived slug, THE Content_Loader SHALL throw an error with the format: `Content validation error: <file-path> declared slug "<declared-slug>" does not match filename-derived slug "<filename-slug>"`.
7. WHEN a by-slug function is called, THE Content_Loader SHALL look up content by filename-derived slug (not by scanning content fields).