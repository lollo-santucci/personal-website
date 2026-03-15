// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  tottiTransition,
  type TottiState,
  type TottiEvent,
} from '@/components/TottiSprite';

const ALL_STATES: TottiState[] = ['sitting', 'barking', 'sleeping'];
const ALL_EVENTS: TottiEvent[] = [
  'bark_timer',
  'inactivity_timeout',
  'bark_complete',
  'user_interaction',
];

const stateArb = fc.constantFrom<TottiState>(...ALL_STATES);
const eventArb = fc.constantFrom<TottiEvent>(...ALL_EVENTS);

/**
 * Expected transition table — the single source of truth for the test.
 */
const TRANSITION_TABLE: Record<string, TottiState> = {
  'sitting|bark_timer': 'barking',
  'sitting|inactivity_timeout': 'sleeping',
  'barking|bark_complete': 'sitting',
  'sleeping|user_interaction': 'sitting',
};

function expectedNextState(state: TottiState, event: TottiEvent): TottiState {
  return TRANSITION_TABLE[`${state}|${event}`] ?? state;
}

describe('tottiTransition', () => {
  /**
   * Feature: design-system-application, Property 11: Totti state machine transitions
   * Validates: Requirements 6.2
   */
  it('produces the correct next state for any (state, event) pair', () => {
    fc.assert(
      fc.property(stateArb, eventArb, (state, event) => {
        const result = tottiTransition(state, event);
        const expected = expectedNextState(state, event);
        expect(result).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  it('non-matching (state, event) pairs return the same state (identity)', () => {
    fc.assert(
      fc.property(stateArb, eventArb, (state, event) => {
        const key = `${state}|${event}`;
        if (!(key in TRANSITION_TABLE)) {
          expect(tottiTransition(state, event)).toBe(state);
        }
      }),
      { numRuns: 100 },
    );
  });
});
