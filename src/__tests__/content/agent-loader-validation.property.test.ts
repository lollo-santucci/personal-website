// @vitest-environment node
/**
 * Property 7: Agent loader rejects data missing required fields
 *
 * For any agent data object that is missing one or more of the required fields
 * (name, slug, role, personality, capabilities, status, index, mission, bestFor,
 * toneOfVoice), the agent content loader shall throw an error during validation.
 *
 * **Validates: Requirements 17.4**
 *
 * Feature: design-system-application, Property 7: Agent loader rejects data missing required fields
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateContent } from '@/lib/content/utils/validation';

const AGENT_REQUIRED_FIELDS = [
  'name',
  'slug',
  'role',
  'personality',
  'capabilities',
  'status',
  'index',
  'mission',
  'bestFor',
  'toneOfVoice',
] as const;

const AGENT_VALIDATION_CONFIG = {
  requiredFields: [...AGENT_REQUIRED_FIELDS],
  arrayFields: ['capabilities', 'bestFor'],
};

/** Build a complete agent data object with all required fields present. */
function buildCompleteAgentData(): Record<string, unknown> {
  return {
    name: 'Test Agent',
    slug: 'test-agent',
    role: 'Tester',
    personality: 'Thorough and precise',
    capabilities: ['testing', 'validation'],
    status: 'active',
    index: 1,
    mission: 'Ensure correctness',
    bestFor: ['quality assurance'],
    toneOfVoice: { warm: 3, direct: 4, playful: 2, formal: 3, calm: 5 },
  };
}

/**
 * Arbitrary that generates a non-empty subset of required field indices to remove.
 * Uses subarray with minLength 1 to guarantee at least one field is missing.
 */
const fieldsToRemoveArb = fc.subarray(
  AGENT_REQUIRED_FIELDS.map((_, i) => i),
  { minLength: 1 },
);

describe('Property 7: Agent loader rejects data missing required fields', () => {
  it('validateContent throws when any required agent field is missing', () => {
    fc.assert(
      fc.property(fieldsToRemoveArb, (indicesToRemove) => {
        const data = buildCompleteAgentData();

        // Remove the selected fields
        for (const idx of indicesToRemove) {
          delete data[AGENT_REQUIRED_FIELDS[idx]];
        }

        expect(() =>
          validateContent(data, 'content/agents/test-agent.yaml', 'test-agent', AGENT_VALIDATION_CONFIG),
        ).toThrow('Content validation error');
      }),
      { numRuns: 100 },
    );
  });
});
