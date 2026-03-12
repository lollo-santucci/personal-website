# Requirements Document

## Introduction

This spec defines TypeScript interfaces for all content entity types in the project. These types form the data contract between the content system and all presentation layers (classic view, play view). They are content data contracts — not database models — and must match the conceptual fields defined in the project documentation.

## Out of Scope

The following concerns are explicitly excluded by design. These types represent content shape, not persistence or lifecycle:

- No `id` fields on entity types (Dialogue and DialogueLine use `id` as content identifiers for line referencing, not database primary keys)
- No `createdAt` / `updatedAt` timestamps
- No `draft` / `published` status or visibility flags
- No SEO metadata fields (title tags, meta descriptions, Open Graph)
- No permissions or access control fields
- No versioning or revision history
- No runtime state (loading, error, selected)

These concerns belong in the content loader layer, CMS integration, or application state — not in the content type definitions.

## Glossary

- **Content_System**: The shared layer of structured content that feeds all views. The source of truth for all content entities.
- **Page**: A static or semi-static content entry representing a major site section (Home, About, Contact, Services).
- **Project**: A portfolio entry representing work Lorenzo has built, including description, stack, links, and visuals.
- **Blog_Post**: An article, essay, or tutorial written by Lorenzo, with metadata and cross-references.
- **Agent**: An entity with triple nature: content profile (agentdex), world character (play view), and software entity (chat/tools).
- **Character**: Any entity with a sprite, name, and presence in the world. Base type for all world inhabitants.
- **Location**: A defined area in the world — an interior, an exterior zone, or a transition area.
- **Dialogue**: Structured conversation content used by the world's dialogue system, composed of lines, choices, and actions.
- **Service**: A description of what Lorenzo offers professionally, with conversion-oriented content.
- **Action**: A system behavior triggered by world interaction. Types: `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`.
- **Barrel_Export**: A TypeScript index file that re-exports all types from individual module files.
- **Slug**: A branded type alias for URL-safe content identifiers (kebab-case strings).
- **IsoDateString**: A branded type alias for ISO 8601 date strings (e.g. `2025-01-15`).
- **Position2D**: A reusable type representing a 2D coordinate with `x` and `y` number fields.
- **AssetPath**: A branded type alias for file paths referencing visual assets (sprites, portraits, tilesets, images).
- **DialogueId**: A semantic type alias for dialogue content identifiers, used in `Dialogue.id`, `Agent.world.dialogueId`, and dialogue cross-references.
- **LineId**: A semantic type alias for dialogue line identifiers, used in `DialogueLine.id`, `nextLineId` references, and `DialogueChoice.nextLineId`.
- **TransitionDirection**: A union type of valid spatial directions for location transitions: `north`, `south`, `east`, `west`, `up`, `down`.
- **CharacterType**: A union of character roles: `player`, `companion`, `agent`, `npc`, `merchant`.
- **BehaviorType**: A union of character behaviors: `controllable`, `follower`, `stationary`, `patrol`.
- **LocationType**: A union of location categories: `interior`, `exterior`, `transition`.
- **ActionType**: A union of system action identifiers using snake_case: `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`.

## Requirements

### Requirement 1: Shared Utility Types

**User Story:** As a developer, I want reusable semantic type aliases for common field patterns, so that the type system communicates intent and prevents accidental misuse of raw strings.

#### Acceptance Criteria

1. THE Content_System SHALL define a `Slug` type alias representing a URL-safe kebab-case content identifier. `Slug` is a semantic type alias at compile time — it improves readability and intent but does not enforce format at the type level. Format validation (kebab-case) SHALL be performed by the content loader or schema parser, as defined in the content-loader spec.
2. THE Content_System SHALL define an `IsoDateString` type alias representing an ISO 8601 date string. `IsoDateString` is a semantic type alias at compile time — it improves readability and intent but does not enforce format at the type level. Format validation (ISO 8601) SHALL be performed by the content loader or schema parser, as defined in the content-loader spec.
3. THE Content_System SHALL define a `Position2D` type with required `x` (number) and `y` (number) fields.
4. THE Content_System SHALL define an `AssetPath` type alias representing a file path to a visual asset. `AssetPath` is a semantic type alias at compile time — it improves readability and intent but does not enforce format at the type level. Format validation (valid asset path) SHALL be performed by the content loader or schema parser, as defined in the content-loader spec.
5. THE Content_System SHALL define a `DialogueId` type alias representing a dialogue content identifier. `DialogueId` is a semantic type alias at compile time. Format validation SHALL be performed by the content loader.
6. THE Content_System SHALL define a `LineId` type alias representing a dialogue line identifier. `LineId` is a semantic type alias at compile time. Format validation SHALL be performed by the content loader.
7. THE Content_System SHALL define a `TransitionDirection` union type with values: `north`, `south`, `east`, `west`, `up`, `down`.
8. THE Content_System SHALL export all shared utility types from a dedicated `common.ts` file under `src/lib/types/`.
9. THE Content_System SHALL use `Slug` in place of raw `string` for all slug fields across all entity types.
10. THE Content_System SHALL use `IsoDateString` in place of raw `string` for all date fields across all entity types.
11. THE Content_System SHALL use `Position2D` in place of inline `{ x: number; y: number }` objects across all entity types.
12. THE Content_System SHALL use `AssetPath` in place of raw `string` for all asset reference fields (image, sprite, portrait, tileset) across all entity types.
13. THE Content_System SHALL use `DialogueId` in place of raw `string` for all dialogue identifier fields (`Dialogue.id`, `Agent.world.dialogueId`).
14. THE Content_System SHALL use `LineId` in place of raw `string` for all dialogue line identifier fields (`DialogueLine.id`, `nextLineId` in DialogueLine and DialogueChoice).

---

### Requirement 2: Page Type Definition

**User Story:** As a developer, I want a Page type that represents static site sections, so that the content system can provide structured page data to all views.

#### Acceptance Criteria

1. THE Content_System SHALL define a Page interface with required fields: `title` (string), `slug` (Slug), and `content` (string for raw MDX).
2. THE Content_System SHALL define the Page interface with an optional `description` field (string).
3. THE Content_System SHALL export the Page interface from a dedicated `page.ts` file under `src/lib/types/`.

---

### Requirement 3: Project Type Definition

**User Story:** As a developer, I want a Project type that represents portfolio entries, so that projects can be displayed consistently across classic view and play view.

#### Acceptance Criteria

1. THE Content_System SHALL define a Project interface with required fields: `title` (string), `slug` (Slug), `description` (string), `content` (string), `stack` (string array), `categories` (string array), `status` (union of `completed`, `in-progress`, `ongoing`), and `highlight` (boolean).
2. THE Content_System SHALL define the Project interface with optional fields: `links` (object with optional `live`, `github`, `demo` string fields), `image` (AssetPath), and `order` (number).
3. THE Content_System SHALL export the Project interface from a dedicated `project.ts` file under `src/lib/types/`.

---

### Requirement 4: Blog Post Type Definition

**User Story:** As a developer, I want a BlogPost type that represents articles and tutorials, so that blog content can be loaded and rendered by any view.

#### Acceptance Criteria

1. THE Content_System SHALL define a BlogPost interface with required fields: `title` (string), `slug` (Slug), `excerpt` (string), `content` (string), `date` (IsoDateString), `categories` (string array), and `tags` (string array).
2. THE Content_System SHALL define the BlogPost interface with optional fields: `image` (AssetPath), `relatedProjects` (Slug array of project slugs), and `relatedAgents` (Slug array of agent slugs).
3. THE Content_System SHALL export the BlogPost interface from a dedicated `blog-post.ts` file under `src/lib/types/`.

---

### Requirement 5: Agent Type Definition (Triple Nature)

**User Story:** As a developer, I want an Agent type that captures the triple nature of agents (content profile, world character, software entity), so that a single agent definition can produce all three representations.

#### Acceptance Criteria

1. THE Content_System SHALL define an Agent interface with required fields: `name` (string), `slug` (Slug), `role` (string), `personality` (string), `capabilities` (string array), and `status` (union of `active`, `coming-soon`, `experimental`).
2. THE Content_System SHALL define the Agent interface with an optional `portrait` field (AssetPath) for the pixel-art portrait asset.
3. THE Content_System SHALL define the Agent interface with an optional `world` field containing: `location` (Slug, required), and optional `sprite` (AssetPath), `position` (Position2D), and `dialogueId` (DialogueId).
4. THE Content_System SHALL define the Agent interface with an optional `software` field containing: `availability` (union of `available`, `disabled`, `coming-soon`, required), and optional `model` (string), `systemPrompt` (string), and `tools` (string array).
5. THE Content_System SHALL export the Agent interface from a dedicated `agent.ts` file under `src/lib/types/`.

---

### Requirement 6: Character Type Definition

**User Story:** As a developer, I want a Character type with a discriminated type field, so that the world engine can handle different character behaviors based on their role.

#### Acceptance Criteria

1. THE Content_System SHALL define a CharacterType union type with values: `player`, `companion`, `agent`, `npc`, `merchant`.
2. THE Content_System SHALL define a BehaviorType union type with values: `controllable`, `follower`, `stationary`, `patrol`.
3. THE Content_System SHALL define a Character interface with required fields: `name` (string), `slug` (Slug), `type` (CharacterType), and `behavior` (BehaviorType).
4. THE Content_System SHALL define the Character interface with optional fields: `sprite` (AssetPath), `animations` (string array), `position` (Position2D), `location` (Slug), `dialogueIds` (string array), and `agentSlug` (Slug for linking to an Agent entity).
5. THE Content_System SHALL export the CharacterType, BehaviorType, and Character types from a dedicated `character.ts` file under `src/lib/types/`.

---

### Requirement 7: Location Type Definition

**User Story:** As a developer, I want a Location type with support for interactive objects and transitions, so that the world engine can build navigable locations from content configuration.

#### Acceptance Criteria

1. THE Content_System SHALL define a LocationType union type with values: `interior`, `exterior`, `transition`.
2. THE Content_System SHALL define an InteractiveObject interface with required fields: `id` (string), `name` (string), `position` (Position2D), and `action` (DialogueAction).
3. THE Content_System SHALL define a LocationTransition interface with required fields: `target` (Slug) and `position` (Position2D), and an optional `direction` (TransitionDirection) field.
4. THE Content_System SHALL define a Location interface with required fields: `name` (string), `slug` (Slug), `description` (string), and `type` (LocationType).
5. THE Content_System SHALL define the Location interface with optional fields: `tileset` (AssetPath), `characters` (Slug array of character slugs), `objects` (InteractiveObject array), `transitions` (LocationTransition array), and `contentSection` (string).
6. THE Content_System SHALL export the LocationType, InteractiveObject, LocationTransition, and Location types from a dedicated `location.ts` file under `src/lib/types/`.

---

### Requirement 8: Dialogue Type Definition

**User Story:** As a developer, I want a Dialogue type with lines, choices, and action hooks, so that the world's dialogue system can render branching conversations that trigger content access.

#### Acceptance Criteria

1. THE Content_System SHALL define an ActionType union type with exactly five values: `open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`.
2. THE Content_System SHALL define a DialogueAction interface with required fields: `type` (ActionType) and `target` (Slug).
3. THE Content_System SHALL define a DialogueChoice interface with required field `text` (string), and optional fields `nextLineId` (LineId) and `action` (DialogueAction).
4. WHEN a DialogueChoice has both `nextLineId` and `action` defined, THE Content_System SHALL treat them as coexisting: the action fires and then the dialogue continues to the referenced line.
5. THE Content_System SHALL define a DialogueLine interface with required fields: `id` (LineId), `speaker` (Slug, referencing a Character slug), and `text` (string), and optional fields: `nextLineId` (LineId), `choices` (DialogueChoice array), `action` (DialogueAction), and `condition` (string).
6. THE Content_System SHALL document the `condition` field as a simple expression string evaluated at runtime (e.g. `"hasVisited:shop"`, `"agentStatus:active"`), with the expression grammar to be defined in the dialogue engine spec.
7. THE Content_System SHALL define a Dialogue interface with required fields: `id` (DialogueId), `speaker` (Slug, referencing the primary speaker's Character slug), and `lines` (DialogueLine array).
8. THE Content_System SHALL export the ActionType, DialogueAction, DialogueChoice, DialogueLine, and Dialogue types from a dedicated `dialogue.ts` file under `src/lib/types/`.

---

### Requirement 9: Service Type Definition

**User Story:** As a developer, I want a Service type that represents professional offerings, so that services can be displayed and linked to related projects and CTAs.

#### Acceptance Criteria

1. THE Content_System SHALL define a Service interface with required fields: `title` (string), `slug` (Slug), `description` (string), and `content` (string).
2. THE Content_System SHALL define the Service interface with optional fields: `relatedProjects` (Slug array of project slugs), `cta` (object with required `text` and `href` string fields), and `order` (number).
3. THE Content_System SHALL export the Service interface from a dedicated `service.ts` file under `src/lib/types/`.

---

### Requirement 10: Inter-Type Invariants

**User Story:** As a developer, I want explicit, categorized constraints between entity types, so that each guarantee level (compile-time, runtime, documentation) is clear and enforceable at the appropriate layer.

#### Type-Level Guarantees (enforced at compile time by TypeScript)

1. WHEN a Character has `type` set to `'agent'`, THE Content_System SHALL require the `agentSlug` field to be present on that Character, enforced via TypeScript discriminated union or type narrowing — not documentation alone.
2. THE Content_System SHALL use string literal union types (not enums) for all union types, consistent with Requirement 12 AC 3.

#### Runtime Validation Guarantees (enforced by the content loader, deferred to content-loader spec)

3. THE Content_System SHALL document that all Slug cross-references (`relatedProjects`, `relatedAgents`, `characters`, `agentSlug`, `Dialogue.speaker`, `DialogueLine.speaker`, `Agent.world.location`, `Agent.world.dialogueId`) SHALL be validated by the content loader to reference existing entities.
4. THE Content_System SHALL document that `Slug`, `IsoDateString`, `AssetPath`, `DialogueId`, and `LineId` format validation SHALL be performed by the content loader or schema parser at load time, as defined in the content-loader spec.
5. THE Content_System SHALL document that the validation technology (e.g. Zod, custom parser, schema validation pipeline) is a content-loader implementation decision, not prescribed by this spec. This spec defines the semantic contracts; the content-loader spec defines how they are enforced at runtime.

#### Documentation-Only Invariants (conventions documented in code comments, not enforced by types or runtime)

6. THE Content_System SHALL document that the `Dialogue.condition` expression grammar is deferred to the dialogue engine spec.
7. THE Content_System SHALL document that `InteractiveObject.action` uses the full `ActionType` set, with no subset restriction at this time.
8. THE Content_System SHALL document that `Dialogue.speaker` and `DialogueLine.speaker` use `Slug` because all speakers are currently Characters. If future speakers exist outside the Character entity (e.g. system narrator), this constraint will be revisited.

---

### Requirement 11: Barrel Export and Module Organization

**User Story:** As a developer, I want all content types re-exported from a single index file, so that consumers can import any type from `@/lib/types` without knowing the internal file structure.

#### Acceptance Criteria

1. THE Content_System SHALL provide a barrel export file at `src/lib/types/index.ts` that re-exports all types from all entity type files including `common.ts`.
2. THE Content_System SHALL organize each entity type in its own dedicated file under `src/lib/types/`, using kebab-case filenames.
3. WHEN the Dialogue types (ActionType, DialogueAction) are needed by the Location type file, THE Content_System SHALL import them from the dialogue module to avoid duplication.
4. THE Content_System SHALL contain no circular dependencies between type files.

---

### Requirement 12: Type Correctness and Strictness

**User Story:** As a developer, I want all type definitions to compile without errors under TypeScript strict mode with zero tolerance for implicit any, so that the type system provides reliable contracts.

#### Acceptance Criteria

1. THE Content_System SHALL compile all type files with zero TypeScript errors under strict mode.
2. THE Content_System SHALL contain no `implicit any` in any type definition.
3. THE Content_System SHALL use string literal union types (not enums) for all discriminated unions (CharacterType, BehaviorType, LocationType, ActionType, TransitionDirection, and all status fields).
4. THE Content_System SHALL contain no circular imports between type files.
5. THE Content_System SHALL define all types using `export interface` or `export type` syntax.
