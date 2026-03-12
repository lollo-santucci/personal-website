/**
 * Barrel export for all content entity types.
 *
 * Consumers import from `@/lib/types` without knowing the internal file structure.
 * This is a type-only module — no runtime values are exported.
 */

// Shared utility types
export type {
  Slug,
  IsoDateString,
  AssetPath,
  DialogueId,
  LineId,
  TransitionDirection,
} from './common';
export type { Position2D } from './common';

// Entity types
export type { Page } from './page';
export type { Project } from './project';
export type { BlogPost } from './blog-post';
export type { Agent } from './agent';
export type {
  CharacterType,
  BehaviorType,
  AgentCharacter,
  NonAgentCharacter,
  Character,
} from './character';
export type {
  ActionType,
  DialogueAction,
  DialogueChoice,
  DialogueLine,
  Dialogue,
} from './dialogue';
export type {
  LocationType,
  InteractiveObject,
  LocationTransition,
  Location,
} from './location';
export type { Service } from './service';
