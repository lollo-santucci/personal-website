/**
 * Property-based tests and unit tests for content sorting comparators.
 * Tests sort invariants across randomly generated inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  compareBlogPosts,
  compareProjects,
  compareServices,
  comparePages,
} from '../utils/sorting';
import type { BlogPost } from '@/lib/types/blog-post';
import type { Project } from '@/lib/types/project';
import type { Service } from '@/lib/types/service';
import type { Page } from '@/lib/types/page';

describe('Property 5: Blog post date-then-title sorting', () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * For any set of blog posts with random dates and titles,
   * sorting with compareBlogPosts SHALL produce date descending order,
   * with title ascending (case-insensitive) as tiebreaker.
   */
  it('sorts by date descending, then title ascending', async () => {
    await fc.assert(
      fc.property(
        fc.array(
          fc.record({
            date: fc
              .tuple(
                fc.integer({ min: 2000, max: 2030 }),
                fc.integer({ min: 1, max: 12 }),
                fc.integer({ min: 1, max: 28 }),
              )
              .map(
                ([y, m, d]) =>
                  `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
              ),
            title: fc.string({ minLength: 1, maxLength: 50 }),
          }),
        ),
        (items) => {
          const posts = items.map(
            (item) => item as unknown as BlogPost,
          );
          const sorted = [...posts].sort(compareBlogPosts);

          for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i + 1];
            if (a.date !== b.date) {
              // date descending
              expect(a.date >= b.date).toBe(true);
            } else {
              // same date → title ascending (case-insensitive)
              expect(
                a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
              ).toBeLessThanOrEqual(0);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 6: Project order-then-title sorting', () => {
  /**
   * **Validates: Requirements 3.2**
   *
   * For any set of projects with random order values (including 0 and undefined)
   * and random titles, sorting with compareProjects SHALL produce order ascending
   * (0 before 1, undefined last), with title ascending (case-insensitive) as tiebreaker.
   */
  it('sorts by order ascending (0 valid, undefined last), then title ascending', async () => {
    await fc.assert(
      fc.property(
        fc.array(
          fc.record({
            order: fc.option(fc.nat(100), { nil: undefined }),
            title: fc.string({ minLength: 1, maxLength: 50 }),
          }),
        ),
        (items) => {
          const projects = items.map(
            (item) => item as unknown as Project,
          );
          const sorted = [...projects].sort(compareProjects);

          for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i + 1];
            const aOrder = a.order ?? Infinity;
            const bOrder = b.order ?? Infinity;
            if (aOrder !== bOrder) {
              expect(aOrder).toBeLessThanOrEqual(bOrder);
            } else {
              expect(
                a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
              ).toBeLessThanOrEqual(0);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 7: Service order-then-title sorting', () => {
  /**
   * **Validates: Requirements 3.3**
   *
   * For any set of services with random order values (including 0 and undefined)
   * and random titles, sorting with compareServices SHALL produce order ascending
   * (0 before 1, undefined last), with title ascending (case-insensitive) as tiebreaker.
   */
  it('sorts by order ascending (0 valid, undefined last), then title ascending', async () => {
    await fc.assert(
      fc.property(
        fc.array(
          fc.record({
            order: fc.option(fc.nat(100), { nil: undefined }),
            title: fc.string({ minLength: 1, maxLength: 50 }),
          }),
        ),
        (items) => {
          const services = items.map(
            (item) => item as unknown as Service,
          );
          const sorted = [...services].sort(compareServices);

          for (let i = 0; i < sorted.length - 1; i++) {
            const a = sorted[i];
            const b = sorted[i + 1];
            const aOrder = a.order ?? Infinity;
            const bOrder = b.order ?? Infinity;
            if (aOrder !== bOrder) {
              expect(aOrder).toBeLessThanOrEqual(bOrder);
            } else {
              expect(
                a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
              ).toBeLessThanOrEqual(0);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 8: Page title sorting', () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * For any set of pages with random titles, sorting with comparePages
   * SHALL produce title ascending order using case-insensitive comparison.
   */
  it('sorts by title ascending (case-insensitive)', async () => {
    await fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
          }),
        ),
        (items) => {
          const pages = items.map(
            (item) => item as unknown as Page,
          );
          const sorted = [...pages].sort(comparePages);

          for (let i = 0; i < sorted.length - 1; i++) {
            expect(
              sorted[i].title.localeCompare(sorted[i + 1].title, undefined, {
                sensitivity: 'base',
              }),
            ).toBeLessThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Order 0 edge case', () => {
  /**
   * Validates: Requirements 3.2, 3.3
   *
   * Verify order: 0 sorts before order: 1, and order: undefined sorts last.
   */
  it('compareProjects: order 0 before order 1, undefined last', () => {
    const items = [
      { order: undefined, title: 'No Order' },
      { order: 1, title: 'One' },
      { order: 0, title: 'Zero' },
    ] as unknown as Project[];

    const sorted = [...items].sort(compareProjects);

    expect(sorted[0].order).toBe(0);
    expect(sorted[1].order).toBe(1);
    expect(sorted[2].order).toBeUndefined();
  });

  it('compareServices: order 0 before order 1, undefined last', () => {
    const items = [
      { order: undefined, title: 'No Order' },
      { order: 1, title: 'One' },
      { order: 0, title: 'Zero' },
    ] as unknown as Service[];

    const sorted = [...items].sort(compareServices);

    expect(sorted[0].order).toBe(0);
    expect(sorted[1].order).toBe(1);
    expect(sorted[2].order).toBeUndefined();
  });
});
