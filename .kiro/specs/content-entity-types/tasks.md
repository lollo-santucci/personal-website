# Implementation Plan: Content Entity Types

## Overview

Create TypeScript type definitions for all content entities under `src/lib/types/`. Pure type-only module — no runtime logic. Branded type aliases for semantic intent, discriminated union for Character agent narrowing, string literal unions for all union types. Verification via `tsc --noEmit` and type-level tests with `expectTypeOf` from Vitest.

## Tasks

- [x] 1. Set up types directory and shared utility types
  - [x] 1.1 Create `src/lib/types/common.ts` with all shared utility types
    - Define branded type aliases: `Slug`, `IsoDateString`, `AssetPath`, `DialogueId`, `LineId` using `string & { readonly __brand: unique symbol }` pattern
    - Define `Position2D` interface with required `x` (number) and `y` (number)
    - Define `TransitionDirection` string literal union: `'north' | 'south' | 'east' | 'west' | 'up' | 'down'`
    - Export all types with `export type` or `export interface`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Implement entity type files (no cross-entity imports)
  - [x] 2.1 Create `src/lib/types/page.ts`
    - Define `Page` interface: required `title` (string), `slug` (Slug), `content` (string); optional `description` (string)
    - Import `Slug` from `./common`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Create `src/lib/types/project.ts`
    - Define `Project` interface: required `title`, `slug`, `description`, `content`, `stack` (string[]), `categories` (string[]), `status` (`'completed' | 'in-progress' | 'ongoing'`), `highlight` (boolean)
    - Optional: `links` (object with optional `live`, `github`, `demo` strings), `image` (AssetPath), `order` (number)
    - Import `Slug`, `AssetPath` from `./common`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.3 Create `src/lib/types/blog-post.ts`
    - Define `BlogPost` interface: required `title`, `slug`, `excerpt`, `content`, `date` (IsoDateString), `categories` (string[]), `tags` (string[])
    - Optional: `image` (AssetPath), `relatedProjects` (Slug[]), `relatedAgents` (Slug[])
    - Import `Slug`, `IsoDateString`, `AssetPath` from `./common`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.4 Create `src/lib/types/agent.ts`
    - Define `Agent` interface: required `name`, `slug`, `role`, `personality`, `capabilities` (string[]), `status` (`'active' | 'coming-soon' | 'experimental'`)
    - Optional: `portrait` (AssetPath), `world` (nested object: required `location` (Slug), optional `sprite` (AssetPath), `position` (Position2D), `dialogueId` (DialogueId)), `software` (nested object: required `availability` (`'available' | 'disabled' | 'coming-soon'`), optional `model`, `systemPrompt`, `tools` (string[]))
    - Import `Slug`, `AssetPath`, `Position2D`, `DialogueId` from `./common`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.5 Create `src/lib/types/service.ts`
    - Define `Service` interface: required `title`, `slug`, `description`, `content`
    - Optional: `relatedProjects` (Slug[]), `cta` (object with required `text` and `href` strings), `order` (number)
    - Import `Slug` from `./common`
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 3. Implement dialogue types
  - [x] 3.1 Create `src/lib/types/dialogue.ts`
    - Define `ActionType` string literal union: `'open_page' | 'open_project' | 'start_dialogue' | 'start_chat' | 'open_agent_profile'`
    - Define `DialogueAction` interface: required `type` (ActionType), `target` (Slug)
    - Define `DialogueChoice` interface: required `text` (string); optional `nextLineId` (LineId), `action` (DialogueAction)
    - Define `DialogueLine` interface: required `id` (LineId), `speaker` (Slug), `text` (string); optional `nextLineId` (LineId), `choices` (DialogueChoice[]), `action` (DialogueAction), `condition` (string)
    - Define `Dialogue` interface: required `id` (DialogueId), `speaker` (Slug), `lines` (DialogueLine[])
    - Add JSDoc comment on `condition` field: expression grammar deferred to dialogue engine spec
    - Add JSDoc comment on `speaker` fields: uses `Slug` because all speakers are currently Characters
    - Import `Slug`, `DialogueId`, `LineId` from `./common`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 10.7, 10.8_

- [x] 4. Implement character and location types (cross-entity imports)
  - [x] 4.1 Create `src/lib/types/character.ts` with discriminated union
    - Define `CharacterType` string literal union: `'player' | 'companion' | 'agent' | 'npc' | 'merchant'`
    - Define `BehaviorType` string literal union: `'controllable' | 'follower' | 'stationary' | 'patrol'`
    - Define a base character shape with required `name`, `slug`, `type`, `behavior` and optional `sprite`, `animations`, `position`, `location`, `dialogueIds`
    - Define `AgentCharacter` type: base shape with `type: 'agent'` and required `agentSlug` (Slug)
    - Define `NonAgentCharacter` type: base shape with `type: Exclude<CharacterType, 'agent'>` and optional `agentSlug` (Slug)
    - Export `Character` as union of `AgentCharacter | NonAgentCharacter`
    - Import `Slug`, `AssetPath`, `Position2D` from `./common`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.1_

  - [x] 4.2 Create `src/lib/types/location.ts`
    - Import `DialogueAction` from `./dialogue` (one-way cross-entity dependency)
    - Import `Slug`, `AssetPath`, `Position2D`, `TransitionDirection` from `./common`
    - Define `LocationType` string literal union: `'interior' | 'exterior' | 'transition'`
    - Define `InteractiveObject` interface: required `id` (string), `name` (string), `position` (Position2D), `action` (DialogueAction)
    - Define `LocationTransition` interface: required `target` (Slug), `position` (Position2D); optional `direction` (TransitionDirection)
    - Define `Location` interface: required `name`, `slug`, `description`, `type` (LocationType); optional `tileset` (AssetPath), `characters` (Slug[]), `objects` (InteractiveObject[]), `transitions` (LocationTransition[]), `contentSection` (string)
    - Add JSDoc comment on `InteractiveObject.action`: uses full `ActionType` set, no subset restriction
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.7_

- [x] 5. Create barrel export and verify compilation
  - [x] 5.1 Create `src/lib/types/index.ts` barrel export
    - Re-export all types from: `common.ts`, `page.ts`, `project.ts`, `blog-post.ts`, `agent.ts`, `character.ts`, `dialogue.ts`, `location.ts`, `service.ts`
    - Ensure every exported type from individual files is importable from `@/lib/types`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 5.2 Verify TypeScript compilation
    - Run `tsc --noEmit` — zero errors under strict mode
    - Run `pnpm build` — zero errors
    - Run `pnpm lint` — zero errors in type files
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 6. Checkpoint — Compilation and lint pass
  - Ensure `tsc --noEmit`, `pnpm build`, and `pnpm lint` all pass with zero errors.
  - Verify no circular imports (location.ts → dialogue.ts is the only cross-entity import).
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Install Vitest and write type-level tests
  - [x] 7.1 Install Vitest and configure for type testing
    - Add `vitest` as a dev dependency: `pnpm add -D vitest`
    - Create minimal `vitest.config.ts` at project root
    - Add `"test"` script to `package.json`
    - _Requirements: (testing infrastructure for type verification)_

  - [x] 7.2 Write type-level test: branded type alias consistency (Property 1)
    - **Property 1: Semantic type alias consistency**
    - Use `expectTypeOf` to verify branded types are not assignable from raw `string`
    - Verify `Slug`, `IsoDateString`, `AssetPath`, `DialogueId`, `LineId` fields reject plain strings
    - Verify `Position2D` fields use the interface, not inline `{ x: number; y: number }`
    - Create test file at `src/lib/types/__tests__/type-correctness.test.ts`
    - **Validates: Requirements 1.9, 1.10, 1.11, 1.12, 1.13, 1.14**

  - [x] 7.3 Write type-level test: Character agent narrowing (Property 2)
    - **Property 2: Character agent type narrowing**
    - Use `expectTypeOf` to verify that when `type === 'agent'`, `agentSlug` is required
    - Verify that for non-agent character types, `agentSlug` is optional
    - **Validates: Requirements 10.1**

  - [x] 7.4 Write type-level test: string literal unions (Property 3)
    - **Property 3: String literal unions only**
    - Verify all union types accept valid string literals and reject invalid ones
    - Cover: `CharacterType`, `BehaviorType`, `LocationType`, `ActionType`, `TransitionDirection`, status fields
    - **Validates: Requirements 10.2, 12.3**

  - [x] 7.5 Write type-level test: barrel export completeness (Property 4)
    - **Property 4: Barrel export completeness**
    - Import all types from `@/lib/types` (barrel) and verify each is defined
    - Verify types match the individual module exports
    - **Validates: Requirements 11.1**

  - [x] 7.6 Write type-level test: export syntax correctness (Property 7)
    - **Property 7: Export syntax correctness**
    - Verify no runtime values are exported from type files (type-only modules)
    - Verify all exports use `export interface` or `export type`
    - **Validates: Requirements 12.5**

- [x] 8. Final checkpoint — All gates pass
  - Run `tsc --noEmit` — zero errors
  - Run `pnpm build` — zero errors
  - Run `pnpm lint` — zero errors
  - Run `pnpm test` (if Vitest installed) — all type-level tests pass
  - Run `pnpm format:check` — exits zero
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- No fast-check/PBT — these are pure type definitions with no runtime logic
- Property 5 (no circular dependencies) is verified by `tsc --noEmit` and manual import inspection in task 6
- Property 6 (strict mode compilation) is verified by `tsc --noEmit` in tasks 5.2 and 8
- The content loader (future spec) handles runtime validation of branded types and cross-references
- Vitest installation is included because the project doesn't have a test runner yet