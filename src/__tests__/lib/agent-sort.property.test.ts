// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import type { Agent } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

/**
 * Minimal agent arbitrary with distinct index values for sort testing.
 */
function makeAgent(index: number, name: string): Agent {
  return {
    name,
    slug: `agent-${index}` as unknown as Slug,
    role: 'test',
    personality: 'test',
    capabilities: ['test'],
    status: 'active',
    index,
    mission: 'test mission',
    bestFor: ['testing'],
    toneOfVoice: { warm: 3, direct: 3, playful: 3, formal: 3, calm: 3 },
  };
}

const distinctAgentsArb = fc
  .uniqueArray(fc.integer({ min: 0, max: 9999 }), {
    minLength: 0,
    maxLength: 20,
  })
  .map((indices) => indices.map((idx) => makeAgent(idx, `Agent ${idx}`)));

describe('sortAgentsByIndex', () => {
  /**
   * Feature: design-system-application, Property 4: Agent sort by index is monotonically non-decreasing
   * Validates: Requirements 11.4
   */
  it('returns agents sorted with each index <= the next', () => {
    fc.assert(
      fc.property(distinctAgentsArb, (agents) => {
        const sorted = sortAgentsByIndex(agents);

        for (let i = 0; i < sorted.length - 1; i++) {
          expect(sorted[i].index).toBeLessThanOrEqual(sorted[i + 1].index);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('preserves array length and elements', () => {
    fc.assert(
      fc.property(distinctAgentsArb, (agents) => {
        const sorted = sortAgentsByIndex(agents);

        expect(sorted).toHaveLength(agents.length);
        for (const agent of agents) {
          expect(sorted).toContain(agent);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('does not mutate the input array', () => {
    fc.assert(
      fc.property(distinctAgentsArb, (agents) => {
        const originalOrder = [...agents];
        sortAgentsByIndex(agents);
        expect(agents).toEqual(originalOrder);
      }),
      { numRuns: 100 },
    );
  });
});
