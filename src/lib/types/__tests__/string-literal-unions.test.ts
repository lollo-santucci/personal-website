/**
 * Type-level tests for Property 3: String literal unions only.
 *
 * Verifies all union types are defined as string literal unions (not enums),
 * accept valid string literals, and reject invalid ones. Also covers status
 * fields on entities (Project.status, Agent.status, Agent.software.availability).
 *
 * **Validates: Requirements 10.2, 12.3**
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  CharacterType,
  BehaviorType,
  LocationType,
  ActionType,
  TransitionDirection,
  Project,
  Agent,
} from '@/lib/types';

describe('Property 3: String literal unions only', () => {
  describe('CharacterType', () => {
    it('equals the expected string literal union', () => {
      expectTypeOf<CharacterType>().toEqualTypeOf<
        'player' | 'companion' | 'agent' | 'npc' | 'merchant'
      >();
    });

    it('accepts valid values', () => {
      expectTypeOf<'player'>().toMatchTypeOf<CharacterType>();
      expectTypeOf<'companion'>().toMatchTypeOf<CharacterType>();
      expectTypeOf<'agent'>().toMatchTypeOf<CharacterType>();
      expectTypeOf<'npc'>().toMatchTypeOf<CharacterType>();
      expectTypeOf<'merchant'>().toMatchTypeOf<CharacterType>();
    });

    it('rejects invalid values', () => {
      expectTypeOf<'enemy'>().not.toMatchTypeOf<CharacterType>();
      expectTypeOf<string>().not.toMatchTypeOf<CharacterType>();
    });
  });

  describe('BehaviorType', () => {
    it('equals the expected string literal union', () => {
      expectTypeOf<BehaviorType>().toEqualTypeOf<
        'controllable' | 'follower' | 'stationary' | 'patrol'
      >();
    });

    it('accepts valid values', () => {
      expectTypeOf<'controllable'>().toMatchTypeOf<BehaviorType>();
      expectTypeOf<'follower'>().toMatchTypeOf<BehaviorType>();
      expectTypeOf<'stationary'>().toMatchTypeOf<BehaviorType>();
      expectTypeOf<'patrol'>().toMatchTypeOf<BehaviorType>();
    });

    it('rejects invalid values', () => {
      expectTypeOf<'wander'>().not.toMatchTypeOf<BehaviorType>();
      expectTypeOf<string>().not.toMatchTypeOf<BehaviorType>();
    });
  });

  describe('LocationType', () => {
    it('equals the expected string literal union', () => {
      expectTypeOf<LocationType>().toEqualTypeOf<
        'interior' | 'exterior' | 'transition'
      >();
    });

    it('accepts valid values', () => {
      expectTypeOf<'interior'>().toMatchTypeOf<LocationType>();
      expectTypeOf<'exterior'>().toMatchTypeOf<LocationType>();
      expectTypeOf<'transition'>().toMatchTypeOf<LocationType>();
    });

    it('rejects invalid values', () => {
      expectTypeOf<'underground'>().not.toMatchTypeOf<LocationType>();
      expectTypeOf<string>().not.toMatchTypeOf<LocationType>();
    });
  });

  describe('ActionType', () => {
    it('equals the expected string literal union', () => {
      expectTypeOf<ActionType>().toEqualTypeOf<
        | 'open_page'
        | 'open_project'
        | 'start_dialogue'
        | 'start_chat'
        | 'open_agent_profile'
      >();
    });

    it('accepts valid values', () => {
      expectTypeOf<'open_page'>().toMatchTypeOf<ActionType>();
      expectTypeOf<'open_project'>().toMatchTypeOf<ActionType>();
      expectTypeOf<'start_dialogue'>().toMatchTypeOf<ActionType>();
      expectTypeOf<'start_chat'>().toMatchTypeOf<ActionType>();
      expectTypeOf<'open_agent_profile'>().toMatchTypeOf<ActionType>();
    });

    it('rejects invalid values', () => {
      expectTypeOf<'close_page'>().not.toMatchTypeOf<ActionType>();
      expectTypeOf<string>().not.toMatchTypeOf<ActionType>();
    });
  });

  describe('TransitionDirection', () => {
    it('equals the expected string literal union', () => {
      expectTypeOf<TransitionDirection>().toEqualTypeOf<
        'north' | 'south' | 'east' | 'west' | 'up' | 'down'
      >();
    });

    it('accepts valid values', () => {
      expectTypeOf<'north'>().toMatchTypeOf<TransitionDirection>();
      expectTypeOf<'south'>().toMatchTypeOf<TransitionDirection>();
      expectTypeOf<'east'>().toMatchTypeOf<TransitionDirection>();
      expectTypeOf<'west'>().toMatchTypeOf<TransitionDirection>();
      expectTypeOf<'up'>().toMatchTypeOf<TransitionDirection>();
      expectTypeOf<'down'>().toMatchTypeOf<TransitionDirection>();
    });

    it('rejects invalid values', () => {
      expectTypeOf<'northeast'>().not.toMatchTypeOf<TransitionDirection>();
      expectTypeOf<string>().not.toMatchTypeOf<TransitionDirection>();
    });
  });

  describe('status fields on entities', () => {
    it('Project.status is a string literal union', () => {
      expectTypeOf<Project['status']>().toEqualTypeOf<
        'completed' | 'in-progress' | 'ongoing'
      >();
    });

    it('Project.status rejects invalid values', () => {
      expectTypeOf<'archived'>().not.toMatchTypeOf<Project['status']>();
      expectTypeOf<string>().not.toMatchTypeOf<Project['status']>();
    });

    it('Agent.status is a string literal union', () => {
      expectTypeOf<Agent['status']>().toEqualTypeOf<
        'active' | 'coming-soon' | 'experimental'
      >();
    });

    it('Agent.status rejects invalid values', () => {
      expectTypeOf<'disabled'>().not.toMatchTypeOf<Agent['status']>();
      expectTypeOf<string>().not.toMatchTypeOf<Agent['status']>();
    });

    it('Agent.software.availability is a string literal union', () => {
      // Extract the non-optional software type, then check availability
      type SoftwareAvailability = NonNullable<
        Agent['software']
      >['availability'];
      expectTypeOf<SoftwareAvailability>().toEqualTypeOf<
        'available' | 'disabled' | 'coming-soon'
      >();
    });

    it('Agent.software.availability rejects invalid values', () => {
      type SoftwareAvailability = NonNullable<
        Agent['software']
      >['availability'];
      expectTypeOf<'offline'>().not.toMatchTypeOf<SoftwareAvailability>();
      expectTypeOf<string>().not.toMatchTypeOf<SoftwareAvailability>();
    });
  });
});
