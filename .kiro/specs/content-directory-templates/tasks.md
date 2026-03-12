# Implementation Plan: Content Directory Templates

## Overview

Create 9 static documentation files (4 MDX templates, 4 YAML templates, 1 README) in the `content/` directory. Each template mirrors its corresponding TypeScript interface from `src/lib/types/`, annotated with inline comments for required/optional status, type formats, and enum values. Parameterized unit tests verify template-TypeScript alignment across all 8 content types.

## Tasks

- [x] 1. Create MDX templates for Page, Project, BlogPost, and Service
  - [x] 1.1 Create `content/pages/_template.mdx` for the Page type
    - Add YAML frontmatter with all fields from `Page` interface (`title`, `slug`, `description`)
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints, and branded type notes
    - Include MDX body placeholder after closing `---` for the `content` field
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.2_

  - [x] 1.2 Create `content/projects/_template.mdx` for the Project type
    - Add YAML frontmatter with all fields from `Project` interface (`title`, `slug`, `description`, `stack`, `categories`, `status`, `highlight`, `links`, `image`, `order`)
    - Show nested `links` object with `live`, `github`, `demo` sub-fields
    - List all `status` enum values (`completed`, `in-progress`, `ongoing`) in comment
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - Include MDX body placeholder after closing `---`
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.2_

  - [x] 1.3 Create `content/blog/_template.mdx` for the BlogPost type
    - Add YAML frontmatter with all fields from `BlogPost` interface (`title`, `slug`, `excerpt`, `date`, `categories`, `tags`, `image`, `relatedProjects`, `relatedAgents`)
    - Document `IsoDateString` format for `date`, `Slug[]` format for cross-references
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - Include MDX body placeholder after closing `---`
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.2_

  - [x] 1.4 Create `content/services/_template.mdx` for the Service type
    - Add YAML frontmatter with all fields from `Service` interface (`title`, `slug`, `description`, `relatedProjects`, `cta`, `order`)
    - Show nested `cta` object with `text` and `href` sub-fields
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - Include MDX body placeholder after closing `---`
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.2_

- [x] 2. Checkpoint — Verify MDX templates
  - Ensure all 4 MDX templates have syntactically valid YAML frontmatter
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create YAML templates for Agent, Location, Character, and Dialogue
  - [x] 3.1 Create `content/agents/_template.yaml` for the Agent type
    - Add all fields from `Agent` interface (`name`, `slug`, `role`, `personality`, `capabilities`, `status`, `portrait`, `world`, `software`)
    - Show nested `world` object with `location`, `sprite`, `position`, `dialogueId` sub-fields
    - Show nested `software` object with `availability`, `model`, `systemPrompt`, `tools` sub-fields
    - List all enum values for `status` (`active`, `coming-soon`, `experimental`) and `software.availability` (`available`, `disabled`, `coming-soon`)
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.3_

  - [x] 3.2 Create `content/locations/_template.yaml` for the Location type
    - Add all fields from `Location` interface (`name`, `slug`, `description`, `type`, `tileset`, `characters`, `objects`, `transitions`, `contentSection`)
    - Show nested `objects` array with `id`, `name`, `position`, `action` sub-fields
    - Show nested `transitions` array with `target`, `position`, `direction` sub-fields
    - List all enum values for `type` (`interior`, `exterior`, `transition`), action `type`, and `direction`
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.3_

  - [x] 3.3 Create `content/characters/_template.yaml` for the Character type
    - Add all fields from `Character` type (superset of both union branches)
    - Document discriminated union: `agentSlug` required when `type: agent`, optional otherwise
    - List all enum values for `type` (`player`, `companion`, `agent`, `npc`, `merchant`) and `behavior` (`controllable`, `follower`, `stationary`, `patrol`)
    - Annotate each field with `# REQUIRED` or `# OPTIONAL` / `# CONDITIONAL`, type format hints
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.3_

  - [x] 3.4 Create `content/dialogues/_template.yaml` for the Dialogue type
    - Add all fields from `Dialogue` interface (`id`, `speaker`, `lines`)
    - Show multiple example lines demonstrating different shapes: simple line, line with choices, line with action, line with condition
    - Show nested `choices` array with `text`, `nextLineId`, `action` sub-fields
    - Show nested `action` objects with `type` and `target` sub-fields
    - List all `action.type` enum values (`open_page`, `open_project`, `start_dialogue`, `start_chat`, `open_agent_profile`)
    - Annotate each field with `# REQUIRED` or `# OPTIONAL`, type format hints
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.3_

- [x] 4. Checkpoint — Verify YAML templates
  - Ensure all 4 YAML templates contain syntactically valid YAML
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create Content README
  - [x] 5.1 Create `content/README.md` with all 6 required sections
    - **Directory Structure**: list all 8 content subdirectories with one-line descriptions
    - **Naming Conventions**: kebab-case filenames, `_` prefix for templates, Italian location slugs, snake_case action types, lowercase character types
    - **Authoring Workflow**: copy template → rename → fill required → add optional
    - **Field Reference**: per-type summary pointing to template files (do not duplicate field matrices)
    - **Slug & Date Formats**: slug format rules and ISO 8601 date format
    - **Cross-Reference Pattern**: slug-based references, never file paths
    - _Requirements: 3.1, 3.2_

- [x] 6. Write parameterized unit tests for template-TypeScript alignment
  - [x] 6.1 Set up test infrastructure for template parsing
    - Create test file at an appropriate location under `src/` or alongside content tests
    - Implement helpers to extract field names from TypeScript interfaces (via AST or type metadata)
    - Implement helpers to parse YAML frontmatter from MDX files and fields from YAML files
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 6.2 Write parameterized test for Property 1: field set alignment
    - **Property 1: Template-TypeScript field set alignment**
    - For each of the 8 content types, extract field names from TS interface and from template
    - Assert exact set equality (excluding `content` for MDX types)
    - **Validates: Requirements 1.1, 4.1**

  - [x] 6.3 Write parameterized test for Property 2: optionality annotation correctness
    - **Property 2: Optionality annotation correctness**
    - For each content type, extract optionality from TS interface and parse template REQUIRED/OPTIONAL comments
    - Assert optionality matches for every field
    - **Validates: Requirements 4.2**

  - [x] 6.4 Write parameterized test for Property 3: enum and branded type completeness
    - **Property 3: Enum and branded type documentation completeness**
    - For each enum field, extract union members from TS and parse template comment
    - Assert all enum members are listed; assert branded types have format hints
    - **Validates: Requirements 4.3**

  - [x] 6.5 Write parameterized test for Property 4: template naming convention
    - **Property 4: Template naming convention**
    - For each template file, assert filename is `_template.mdx` or `_template.yaml` with correct extension per content type
    - **Validates: Requirements 5.1, 5.2**

  - [x] 6.6 Write parameterized test for Property 5: syntactic YAML validity
    - **Property 5: Syntactic YAML validity**
    - For each template, parse YAML content and assert no parse errors
    - For MDX templates, parse frontmatter between `---` delimiters
    - **Validates: Requirements 6.2, 6.3**

  - [x] 6.7 Write parameterized test for Property 6: MDX body presence
    - **Property 6: MDX body presence**
    - For each MDX template, assert non-empty content exists after closing `---`
    - **Validates: Requirements 1.2**

- [x] 7. Write unit tests for specific acceptance criteria
  - [x] 7.1 Write unit test for Character discriminated union (R2.1)
    - Parse `content/characters/_template.yaml`, verify `agentSlug` field exists with conditional comment explaining `type: agent` requirement
    - **Validates: Requirements 2.1**

  - [x] 7.2 Write unit test for Dialogue sub-structures (R2.2)
    - Parse `content/dialogues/_template.yaml`, verify `choices`, `action`, `condition` appear within `lines`
    - **Validates: Requirements 2.2**

  - [x] 7.3 Write unit test for README sections (R3.1)
    - Parse `content/README.md`, verify all 6 required section headings exist
    - **Validates: Requirements 3.1**

- [x] 8. Final checkpoint — Build verification and test pass
  - Run `pnpm build` to verify no build breakage from added files
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 6.1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All templates are documentation artifacts — no runtime code is created
- TypeScript interfaces in `src/lib/types/` are the authoritative source of truth for field names, types, and optionality
- Editorial choices (field ordering, comment wording, YAML syntax style) are deferred to implementation per design doc
- Testing uses parameterized unit tests over the fixed set of 8 content types, not property-based testing with random inputs
