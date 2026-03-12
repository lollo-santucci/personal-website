# Requirements Document

## Introduction

Content directory templates provide self-documenting authoring guides for every content type in the system. Each template file shows the complete frontmatter schema — required fields, optional fields, allowed values, and format conventions — so that adding new content is a configuration task that requires no code knowledge. A companion README documents the directory structure, naming conventions, and cross-reference patterns.

Templates are documentation artifacts, not code. They are never loaded by the content system. The `_` filename prefix establishes the convention that future content loaders must skip these files.

## Out of Scope

- Content loader implementation (deferred to content-loader spec)
- Runtime validation of field values or types
- Sample/seed content files (real content only at launch)
- Frontmatter parsing logic
- Template enforcement tooling (linting, CI checks)

## Source of Truth Precedence

When sources conflict on field names, types, or optionality, the following precedence applies:

1. **TypeScript interfaces in `src/lib/types/`** (Spec 2) — authoritative for field names, types, and optionality
2. **`.kiro/steering/structure.md`** — authoritative for naming conventions and directory paths
3. **`.kiro/steering/content-system.md`** — authoritative for content conventions and frontmatter formatting
4. **`context/docs/content-model.md`** — authoritative for conceptual descriptions and domain context
5. **Examples in this spec** — illustrative only; if an example contradicts a TS interface, the interface wins

Templates SHALL NOT invent fields that do not exist in the corresponding TypeScript interface.

## Glossary

- **Template**: A `_template.mdx` or `_template.yaml` file that documents the frontmatter/field schema for a content type. Never loaded by the content system.
- **Content_System**: The content layer that loads, validates, and serves content entities to views.
- **Frontmatter**: YAML metadata block at the top of an MDX file, delimited by `---`.
- **Slug**: A URL-safe kebab-case content identifier (branded type in TypeScript).
- **IsoDateString**: A date in ISO 8601 format, e.g. `2025-01-15`.
- **AssetPath**: A file path referencing a visual asset (sprite, portrait, tileset, image).
- **DialogueId**: A unique identifier for a dialogue entity.
- **LineId**: A unique identifier for a dialogue line within a dialogue.
- **Content_README**: The `content/README.md` file documenting directory structure and authoring conventions.

## Requirements

### Requirement 1: MDX Templates for Page, Project, Blog Post, and Service

**User Story:** As a content author, I want template files for each MDX content type, so that I can see all available frontmatter fields, their formats, and whether they are required or optional without consulting the TypeScript source.

#### Field Matrix

**Page** (`content/pages/_template.mdx` ← `Page` interface in `src/lib/types/page.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `title` | yes | string | `"Page Title"` | |
| `slug` | yes | Slug | `"about"` | kebab-case, URL-safe |
| `description` | no | string | `"Brief page description"` | |
| _(body)_ | — | MDX | — | Maps to `content` field; not in frontmatter |

**Project** (`content/projects/_template.mdx` ← `Project` interface in `src/lib/types/project.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `title` | yes | string | `"Project Title"` | |
| `slug` | yes | Slug | `"project-slug"` | kebab-case |
| `description` | yes | string | `"Short pitch"` | |
| `stack` | yes | string[] | `["TypeScript", "Next.js"]` | tech stack tags |
| `categories` | yes | string[] | `["web", "ai"]` | |
| `status` | yes | enum | `"completed"` | `completed` \| `in-progress` \| `ongoing` |
| `highlight` | yes | boolean | `false` | `true` = featured project |
| `links` | no | object | see below | |
| `links.live` | no | string | `"https://example.com"` | nested inside `links` |
| `links.github` | no | string | `"https://github.com/..."` | nested inside `links` |
| `links.demo` | no | string | `"https://demo.example.com"` | nested inside `links` |
| `image` | no | AssetPath | `"/assets/projects/slug.png"` | hero image |
| `order` | no | number | `0` | display order |
| _(body)_ | — | MDX | — | Maps to `content` field |

**BlogPost** (`content/blog/_template.mdx` ← `BlogPost` interface in `src/lib/types/blog-post.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `title` | yes | string | `"Post Title"` | |
| `slug` | yes | Slug | `"post-slug"` | kebab-case |
| `excerpt` | yes | string | `"Brief summary for listings"` | |
| `date` | yes | IsoDateString | `"2026-01-15"` | ISO 8601 |
| `categories` | yes | string[] | `["tech"]` | |
| `tags` | yes | string[] | `["typescript", "nextjs"]` | |
| `image` | no | AssetPath | `"/assets/blog/slug.png"` | hero image |
| `relatedProjects` | no | Slug[] | `["project-slug"]` | project slugs |
| `relatedAgents` | no | Slug[] | `["agent-slug"]` | agent slugs |
| _(body)_ | — | MDX | — | Maps to `content` field |

**Service** (`content/services/_template.mdx` ← `Service` interface in `src/lib/types/service.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `title` | yes | string | `"Service Title"` | |
| `slug` | yes | Slug | `"service-slug"` | kebab-case |
| `description` | yes | string | `"What this service is"` | |
| `relatedProjects` | no | Slug[] | `["project-slug"]` | proof of capability |
| `cta` | no | object | see below | |
| `cta.text` | yes (if cta) | string | `"Get in touch"` | required within `cta` object |
| `cta.href` | yes (if cta) | string | `"/contact"` | required within `cta` object |
| `order` | no | number | `0` | display order |
| _(body)_ | — | MDX | — | Maps to `content` field |

#### Acceptance Criteria

1. Each template SHALL contain YAML frontmatter covering every field in the corresponding field matrix above, annotated with inline `#` comments marking required/optional status and constraints.
2. Each MDX template SHALL include a placeholder body section (maps to the `content` field in the TS interface).
3. Specific placeholder values, comment wording, and nested structure formatting are deferred to the design doc.

### Requirement 2: YAML Templates for Agent, Location, Character, and Dialogue

**User Story:** As a content author, I want template files for each YAML content type, so that I can see the complete field structure including nested objects, allowed enum values, and cross-reference conventions.

#### Field Matrix

**Agent** (`content/agents/_template.yaml` ← `Agent` interface in `src/lib/types/agent.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `name` | yes | string | `"Agent Name"` | |
| `slug` | yes | Slug | `"agent-slug"` | kebab-case |
| `role` | yes | string | `"Brief role description"` | |
| `personality` | yes | string | `"Personality description"` | |
| `capabilities` | yes | string[] | `["Capability one"]` | |
| `status` | yes | enum | `"active"` | `active` \| `coming-soon` \| `experimental` |
| `portrait` | no | AssetPath | `"/assets/agents/slug.png"` | pixel-art portrait |
| `world` | no | object | see below | world presence (play view) |
| `world.location` | yes (if world) | Slug | `"ufficio"` | location slug (Italian) |
| `world.sprite` | no | AssetPath | `"agent-slug-sprite"` | |
| `world.position` | no | Position2D | `{ x: 0, y: 0 }` | |
| `world.dialogueId` | no | DialogueId | `"agent-slug-intro"` | |
| `software` | no | object | see below | agent platform config |
| `software.availability` | yes (if software) | enum | `"available"` | `available` \| `disabled` \| `coming-soon` |
| `software.model` | no | string | `"claude-sonnet-4-6"` | |
| `software.systemPrompt` | no | string | `"You are..."` | |
| `software.tools` | no | string[] | `[]` | |

**Location** (`content/locations/_template.yaml` ← `Location` interface in `src/lib/types/location.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `name` | yes | string | `"Location Name"` | |
| `slug` | yes | Slug | `"ufficio"` | Italian names: casa, edicola, shop, ufficio, piazza |
| `description` | yes | string | `"What this place is"` | |
| `type` | yes | LocationType | `"interior"` | `interior` \| `exterior` \| `transition` |
| `tileset` | no | AssetPath | `"location-tileset"` | |
| `characters` | no | Slug[] | `["character-slug"]` | character slugs present here |
| `objects` | no | InteractiveObject[] | see below | interactive objects |
| `objects[].id` | yes (if object) | string | `"object-id"` | |
| `objects[].name` | yes (if object) | string | `"Object Name"` | |
| `objects[].position` | yes (if object) | Position2D | `{ x: 0, y: 0 }` | |
| `objects[].action` | yes (if object) | DialogueAction | see below | |
| `objects[].action.type` | yes | ActionType | `"open_page"` | `open_page` \| `open_project` \| `start_dialogue` \| `start_chat` \| `open_agent_profile` |
| `objects[].action.target` | yes | Slug | `"page-slug"` | |
| `transitions` | no | LocationTransition[] | see below | connections to other locations |
| `transitions[].target` | yes (if transition) | Slug | `"other-location-slug"` | |
| `transitions[].position` | yes (if transition) | Position2D | `{ x: 0, y: 0 }` | |
| `transitions[].direction` | no | TransitionDirection | `"north"` | `north` \| `south` \| `east` \| `west` \| `up` \| `down` |
| `contentSection` | no | string | `"about"` | linked content section |

**Character** (`content/characters/_template.yaml` ← `Character` type in `src/lib/types/character.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `name` | yes | string | `"Character Name"` | |
| `slug` | yes | Slug | `"character-slug"` | kebab-case |
| `type` | yes | CharacterType | `"npc"` | `player` \| `companion` \| `agent` \| `npc` \| `merchant` |
| `behavior` | yes | BehaviorType | `"stationary"` | `controllable` \| `follower` \| `stationary` \| `patrol` |
| `sprite` | no | AssetPath | `"character-sprite"` | |
| `animations` | no | string[] | `["idle", "walk"]` | |
| `position` | no | Position2D | `{ x: 0, y: 0 }` | |
| `location` | no | Slug | `"ufficio"` | location slug (Italian) |
| `dialogueIds` | no | string[] | `["dialogue-id"]` | |
| `agentSlug` | conditional | Slug | `"agent-slug"` | Required when `type` is `agent`; optional otherwise |

**Dialogue** (`content/dialogues/_template.yaml` ← `Dialogue` interface in `src/lib/types/dialogue.ts`):

| Field | Required? | Type | Example | Notes |
|---|---|---|---|---|
| `id` | yes | DialogueId | `"dialogue-id"` | unique |
| `speaker` | yes | Slug | `"character-slug"` | primary speaker (Character slug) |
| `lines` | yes | DialogueLine[] | see below | |
| `lines[].id` | yes | LineId | `"line-1"` | unique within dialogue |
| `lines[].speaker` | yes | Slug | `"character-slug"` | |
| `lines[].text` | yes | string | `"Hello! Welcome."` | |
| `lines[].nextLineId` | no | LineId | `"line-2"` | next line to display |
| `lines[].choices` | no | DialogueChoice[] | see below | branching options |
| `lines[].choices[].text` | yes (if choice) | string | `"Tell me about projects"` | |
| `lines[].choices[].nextLineId` | no | LineId | `"line-3"` | |
| `lines[].choices[].action` | no | DialogueAction | see below | |
| `lines[].choices[].action.type` | yes (if action) | ActionType | `"open_page"` | `open_page` \| `open_project` \| `start_dialogue` \| `start_chat` \| `open_agent_profile` |
| `lines[].choices[].action.target` | yes (if action) | Slug | `"projects"` | |
| `lines[].action` | no | DialogueAction | see below | auto-trigger action |
| `lines[].action.type` | yes (if action) | ActionType | `"open_project"` | same enum as above |
| `lines[].action.target` | yes (if action) | Slug | `"project-slug"` | |
| `lines[].condition` | no | string | `"hasVisited:shop"` | runtime expression (grammar deferred to dialogue engine spec) |

#### Discriminated Union Handling

WHEN a TypeScript type uses a discriminated union (e.g. `Character = AgentCharacter | NonAgentCharacter`), THE template SHALL document all branches in a single file. The template shows the superset of all fields across branches, with inline comments explaining which branch each conditional field belongs to. It does NOT create separate template files per branch.

#### Acceptance Criteria

1. The Character template SHALL document both union branches: `agentSlug` required when `type` is `agent`, optional otherwise.
2. The Dialogue template SHALL document all optional sub-structures (`choices`, `action`, `condition`) within a single `lines` array showing the different line shapes.
3. Specific placeholder values, comment wording, and nested structure formatting are deferred to the design doc.

### Requirement 3: Content README

**User Story:** As a content author, I want a README in the content directory, so that I have a single reference for directory structure, naming conventions, and authoring workflow.

#### Required Sections

The Content_README SHALL include the following sections (verifiable checklist):

1. **Directory Structure** — lists all eight content subdirectories (`pages`, `projects`, `blog`, `services`, `agents`, `locations`, `characters`, `dialogues`) with a one-line description of what each contains.
2. **Naming Conventions** — documents: kebab-case filenames, `_` prefix for templates, Italian location slugs (`casa`, `edicola`, `shop`, `ufficio`, `piazza`), snake_case action types (`open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`), lowercase character types (`player`, `companion`, `agent`, `npc`, `merchant`).
3. **Authoring Workflow** — documents the steps: copy the template, rename with kebab-case slug, fill in required fields, add optional fields as needed.
4. **Field Reference** — distinguishes required fields from optional fields for each content type (may reference templates rather than duplicate them).
5. **Slug & Date Formats** — documents slug format (kebab-case, URL-safe, matches filename without extension) and date format (ISO 8601, e.g. `2025-01-15`).
6. **Cross-Reference Pattern** — documents that content references other content by slug, never by file path.

#### Acceptance Criteria

1. THE Content_README SHALL include all six sections listed above.
2. THE Content_README SHALL be located at `content/README.md`.

### Requirement 4: Template-TypeScript Field Alignment

**User Story:** As a developer, I want template fields to exactly match the TypeScript interfaces from `src/lib/types/`, so that templates remain a reliable authoring guide.

#### Acceptance Criteria

1. Each template SHALL include every field defined in the corresponding TypeScript interface (excluding `content` for MDX types, which is the MDX body). Templates SHALL NOT include any field absent from the interface.
2. Optional fields (TS `?`) SHALL be marked optional; required fields SHALL be marked required.
3. Enum unions SHALL list all allowed values. Branded types (Slug, IsoDateString, AssetPath, DialogueId, LineId) SHALL document the expected format.

### Requirement 5: Template Naming and Exclusion Convention

**User Story:** As a developer, I want templates to follow a consistent naming convention that prevents them from being loaded as content, so that they remain documentation-only artifacts.

#### Acceptance Criteria

1. All template files SHALL use a `_` prefix (`_template.mdx` or `_template.yaml`).
2. MDX content type templates SHALL use the `.mdx` extension; YAML content type templates SHALL use the `.yaml` extension.
3. The `_` prefix exclusion convention is a dependency on the future content loader: the content loader spec SHALL implement skipping files with a `_` prefix. This spec documents the convention; enforcement is deferred.

### Requirement 6: Build Compatibility

**User Story:** As a developer, I want the addition of template files and README to not break the build, so that the project remains deployable.

#### Acceptance Criteria

1. WHEN template files and the Content_README are added to the content directories, THE project SHALL compile with `pnpm build` without errors.
2. THE MDX template files SHALL contain syntactically valid YAML frontmatter.
3. THE YAML template files SHALL contain syntactically valid YAML.

#### Dependency Note

`pnpm build` verifies general compilation but cannot verify that templates are excluded from content loading, since the content loader does not yet exist. Template exclusion (via `_` prefix) is a convention established here and enforced by the future content-loader spec. This spec is not fully self-sufficient on that guarantee.
