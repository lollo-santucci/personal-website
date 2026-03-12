/**
 * Type-level tests for Property 2: Character agent type narrowing.
 *
 * Verifies that when `type === 'agent'`, `agentSlug` is required (Slug),
 * and for non-agent character types, `agentSlug` is optional (Slug | undefined).
 *
 * **Validates: Requirements 10.1**
 */

import { describe, it, expectTypeOf } from 'vitest';
import type {
  Slug,
  AgentCharacter,
  NonAgentCharacter,
  Character,
} from '@/lib/types';

describe('Property 2: Character agent type narrowing', () => {
  describe('AgentCharacter requires agentSlug', () => {
    it('AgentCharacter.type is literally "agent"', () => {
      expectTypeOf<AgentCharacter['type']>().toEqualTypeOf<'agent'>();
    });

    it('AgentCharacter.agentSlug is Slug (required, not optional)', () => {
      expectTypeOf<AgentCharacter['agentSlug']>().toEqualTypeOf<Slug>();
    });
  });

  describe('NonAgentCharacter has optional agentSlug', () => {
    it('NonAgentCharacter.type excludes "agent"', () => {
      expectTypeOf<NonAgentCharacter['type']>().toEqualTypeOf<
        'player' | 'companion' | 'npc' | 'merchant'
      >();
    });

    it('NonAgentCharacter.agentSlug is Slug | undefined (optional)', () => {
      expectTypeOf<NonAgentCharacter['agentSlug']>().toEqualTypeOf<
        Slug | undefined
      >();
    });
  });

  describe('Character union narrows correctly', () => {
    it('Character is the union of AgentCharacter and NonAgentCharacter', () => {
      expectTypeOf<AgentCharacter>().toMatchTypeOf<Character>();
      expectTypeOf<NonAgentCharacter>().toMatchTypeOf<Character>();
    });

    it('narrowing on type === "agent" yields required agentSlug', () => {
      type Narrowed = Extract<Character, { type: 'agent' }>;
      expectTypeOf<Narrowed['agentSlug']>().toEqualTypeOf<Slug>();
    });

    it('narrowing on type !== "agent" yields optional agentSlug', () => {
      type Narrowed = Extract<Character, { type: 'npc' }>;
      // agentSlug is optional on non-agent characters — verify it's NOT just Slug
      // (i.e. it includes undefined, unlike the agent case which is exactly Slug)
      expectTypeOf<Narrowed['agentSlug']>().not.toEqualTypeOf<Slug>();
    });
  });
});
