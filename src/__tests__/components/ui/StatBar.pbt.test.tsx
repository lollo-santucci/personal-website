// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import StatBar from '@/components/ui/StatBar';

describe('Feature: design-system-foundations', () => {
  /**
   * Property 4: StatBar filled and empty rectangle count
   *
   * For any integer value v where 1 ≤ v ≤ 5, StatBar renders exactly v
   * filled rectangles (bg-lime) and exactly 5-v empty rectangles (bg-surface).
   *
   * **Validates: Requirements 12.1, 12.2**
   */
  it('Property 4: StatBar filled and empty rectangle count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (value) => {
          const { container } = render(<StatBar label="Test" value={value} />);
          const filled = container.querySelectorAll('.bg-lime');
          const empty = container.querySelectorAll('.bg-surface');
          expect(filled).toHaveLength(value);
          expect(empty).toHaveLength(5 - value);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: StatBar aria-label format
   *
   * For any string label and integer value where 1 ≤ value ≤ 5, StatBar
   * exposes aria-label equal to "{label}: {value} out of 5".
   *
   * **Validates: Requirements 12.6, 18.4**
   */
  it('Property 5: StatBar aria-label format', () => {
    fc.assert(
      fc.property(
        fc.record({
          label: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          value: fc.integer({ min: 1, max: 5 }),
        }),
        ({ label, value }) => {
          const { container } = render(<StatBar label={label} value={value} />);
          const bar = container.querySelector('[role="img"]');
          expect(bar).not.toBeNull();
          expect(bar!.getAttribute('aria-label')).toBe(
            `${label}: ${value} out of 5`,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
