/**
 * Character type definitions for the world engine.
 *
 * Characters are world inhabitants with a sprite, name, and presence in a
 * location. The `Character` type uses a discriminated union: when
 * `type === 'agent'`, the `agentSlug` field is required. For all other
 * character types, `agentSlug` is optional.
 */

import type { AssetPath, Position2D, Slug } from './common';

/** Character role in the world. */
export type CharacterType =
  | 'player'
  | 'companion'
  | 'agent'
  | 'npc'
  | 'merchant';

/** Character movement/interaction behavior. */
export type BehaviorType =
  | 'controllable'
  | 'follower'
  | 'stationary'
  | 'patrol';

/** Shared shape for all character types. */
interface BaseCharacter {
  name: string;
  slug: Slug;
  type: CharacterType;
  behavior: BehaviorType;
  sprite?: AssetPath;
  animations?: string[];
  position?: Position2D;
  location?: Slug;
  dialogueIds?: string[];
}

/** Character with `type: 'agent'` — `agentSlug` is required. */
export interface AgentCharacter extends BaseCharacter {
  type: 'agent';
  agentSlug: Slug;
}

/** Character with any non-agent type — `agentSlug` is optional. */
export interface NonAgentCharacter extends BaseCharacter {
  type: Exclude<CharacterType, 'agent'>;
  agentSlug?: Slug;
}

/** World inhabitant — discriminated on `type` for agent narrowing. */
export type Character = AgentCharacter | NonAgentCharacter;
