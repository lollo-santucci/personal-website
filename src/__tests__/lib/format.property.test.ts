// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  formatDateDDMMYYYY,
  calculateReadTime,
  formatAgentIndex,
  isRecentPost,
} from '@/lib/format';

describe('formatDateDDMMYYYY', () => {
  /**
   * Feature: design-system-application, Property 1: Date formatting round trip produces DD.MM.YYYY
   * Validates: Requirements 9.3, 10.4
   */
  it('produces DD.MM.YYYY for any valid ISO date string', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 2000, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 28 }),
        ),
        ([year, month, day]) => {
          const mm = String(month).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const isoDate = `${year}-${mm}-${dd}`;

          const result = formatDateDDMMYYYY(isoDate);

          // Must match DD.MM.YYYY pattern
          expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);

          // Parse back and verify components
          const [resultDD, resultMM, resultYYYY] = result.split('.');
          expect(resultDD).toBe(dd);
          expect(resultMM).toBe(mm);
          expect(resultYYYY).toBe(String(year));
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('calculateReadTime', () => {
  /**
   * Feature: design-system-application, Property 2: Read time is always a positive integer
   * Validates: Requirements 10.4
   */
  it('returns a positive integer for any non-empty string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (content) => {
          const result = calculateReadTime(content);
          expect(result).toBeGreaterThanOrEqual(1);
          expect(Number.isInteger(result)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns 1 for the empty string', () => {
    expect(calculateReadTime('')).toBe(1);
  });
});

describe('formatAgentIndex', () => {
  /**
   * Feature: design-system-application, Property 3: Agent index formatting produces zero-padded 3-digit string
   * Validates: Requirements 11.3
   */
  it('produces a 3-character digit-only string whose numeric value equals n', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        (n) => {
          const result = formatAgentIndex(n);

          expect(result).toHaveLength(3);
          expect(result).toMatch(/^\d{3}$/);
          expect(Number(result)).toBe(n);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('isRecentPost', () => {
  /**
   * Feature: design-system-application, Property 12: isRecentPost threshold check
   * Validates: Requirements 9.3
   */
  it('returns true iff the date is within thresholdDays of now (inclusive)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }),
        fc.integer({ min: 0, max: 400 }),
        (thresholdDays, daysAgo) => {
          // Build an ISO date string `daysAgo` days in the past.
          // The implementation parses as midnight (T00:00:00) and compares to
          // Date.now(), so the actual diff is daysAgo + fraction-of-today.
          // Avoid the exact boundary (daysAgo === thresholdDays) where the
          // time-of-day makes the result non-deterministic.
          if (daysAgo === thresholdDays) return;

          const now = new Date();
          const target = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          const isoDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;

          const result = isRecentPost(isoDate, thresholdDays);

          if (daysAgo < thresholdDays) {
            expect(result).toBe(true);
          } else {
            expect(result).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
