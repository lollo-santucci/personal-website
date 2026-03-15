import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getShortDescription,
  sortAgentsByName,
} from '@/lib/content/agent-utils';
import type { Agent } from '@/lib/types';
import type { AssetPath, Slug } from '@/lib/types/common';

/**
 * Shared fast-check arbitrary that produces valid Agent entities.
 * Includes mixed case, accented characters, and optional fields.
 */
const accentedChar = fc.mapToConstant(
  { num: 26, build: (v) => String.fromCharCode(0x61 + v) }, // a-z
  { num: 26, build: (v) => String.fromCharCode(0x41 + v) }, // A-Z
  { num: 1, build: () => 'é' },
  { num: 1, build: () => 'ñ' },
  { num: 1, build: () => 'ü' },
  { num: 1, build: () => 'ö' },
  { num: 1, build: () => 'à' },
  { num: 1, build: () => 'ç' },
  { num: 1, build: () => 'ø' },
  { num: 1, build: () => 'ß' },
);

const nameArb = fc
  .array(accentedChar, { minLength: 1, maxLength: 20 })
  .map((chars) => chars.join(''));

const kebabSlugArb = fc
  .array(fc.stringMatching(/^[a-z][a-z0-9]{0,7}$/), {
    minLength: 1,
    maxLength: 3,
  })
  .map((parts) => parts.join('-') as unknown as Slug);

const statusArb = fc.constantFrom(
  'active' as const,
  'coming-soon' as const,
  'experimental' as const,
);

const personalityArb = fc.oneof(
  fc.string({ minLength: 1 }).filter((s) => !s.includes('\n')),
  fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 0 })).map(
    ([a, b]) => `${a.replace(/\n/g, 'x')}\n${b}`,
  ),
);

export const agentArbitrary: fc.Arbitrary<Agent> = fc
  .record({
    name: nameArb,
    slug: kebabSlugArb,
    role: fc.string({ minLength: 1 }),
    personality: personalityArb,
    capabilities: fc.array(fc.string({ minLength: 1 }), {
      minLength: 1,
      maxLength: 5,
    }),
    status: statusArb,
    hasPortrait: fc.boolean(),
    hasWorld: fc.boolean(),
    hasSoftware: fc.boolean(),
  })
  .map(({ hasPortrait, hasWorld, hasSoftware, ...base }) => {
    const agent: Agent = { ...base };
    if (hasPortrait) {
      agent.portrait = '/assets/portrait.png' as unknown as AssetPath;
    }
    if (hasWorld) {
      agent.world = {
        location: 'ufficio' as unknown as Slug,
      };
    }
    if (hasSoftware) {
      agent.software = {
        availability: 'available' as const,
        model: 'test-model',
      };
    }
    return agent;
  });

describe('getShortDescription', () => {
  /** Feature: agentdex-shell, Property 2: Short description extraction */
  /** Validates: Requirements 2.3, 4.1 */

  it('returns substring before first \\n for strings containing \\n', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1 }),
          fc.string(),
        ),
        ([before, after]) => {
          // Ensure `before` has no newlines so it IS the first line
          const cleanBefore = before.replace(/\n/g, 'x');
          const personality = `${cleanBefore}\n${after}`;
          const result = getShortDescription(personality);
          expect(result).toBe(cleanBefore);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns full string when no \\n is present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0 }).filter((s) => !s.includes('\n')),
        (personality) => {
          const result = getShortDescription(personality);
          expect(result).toBe(personality);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('result never empty for non-empty input without leading \\n', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s[0] !== '\n'),
        (personality) => {
          const result = getShortDescription(personality);
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('result never contains \\n', () => {
    fc.assert(
      fc.property(fc.string(), (personality) => {
        const result = getShortDescription(personality);
        expect(result).not.toContain('\n');
      }),
      { numRuns: 100 },
    );
  });
});

describe('sortAgentsByName', () => {
  /** Feature: agentdex-shell, Property 1: Sort order is case-insensitive and locale-aware */
  /** Validates: Requirements 2.2 */

  it('output is sorted by localeCompare with sensitivity base', () => {
    fc.assert(
      fc.property(
        fc.array(agentArbitrary, { minLength: 0, maxLength: 20 }),
        (agents) => {
          const sorted = sortAgentsByName(agents);
          for (let i = 0; i < sorted.length - 1; i++) {
            const cmp = sorted[i].name.localeCompare(sorted[i + 1].name, undefined, {
              sensitivity: 'base',
            });
            expect(cmp).toBeLessThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('output has same length as input', () => {
    fc.assert(
      fc.property(
        fc.array(agentArbitrary, { minLength: 0, maxLength: 20 }),
        (agents) => {
          const sorted = sortAgentsByName(agents);
          expect(sorted).toHaveLength(agents.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('output contains same elements as input', () => {
    fc.assert(
      fc.property(
        fc.array(agentArbitrary, { minLength: 0, maxLength: 20 }),
        (agents) => {
          const sorted = sortAgentsByName(agents);
          // Every input element appears in output (by reference)
          for (const agent of agents) {
            expect(sorted).toContain(agent);
          }
          // Every output element appears in input (by reference)
          for (const agent of sorted) {
            expect(agents).toContain(agent);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('input array is not mutated', () => {
    fc.assert(
      fc.property(
        fc.array(agentArbitrary, { minLength: 0, maxLength: 20 }),
        (agents) => {
          const originalOrder = [...agents];
          sortAgentsByName(agents);
          expect(agents).toEqual(originalOrder);
        },
      ),
      { numRuns: 100 },
    );
  });
});
