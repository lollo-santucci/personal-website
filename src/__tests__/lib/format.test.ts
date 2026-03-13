import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatDate } from '@/lib/format';

describe('formatDate', () => {
  /**
   * Feature: core-content-pages, Property 1: Date formatting produces en-US long format
   * Validates: Requirements 5.5, 6.2
   */
  it('produces en-US long format for any valid ISO date', () => {
    const expectedFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 2000, max: 2030 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 28 }),
        ),
        ([year, month, day]) => {
          const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const result = formatDate(isoDate);
          const expected = expectedFormatter.format(
            new Date(year, month - 1, day),
          );
          expect(result).toBe(expected);
        },
      ),
    );
  });
});
