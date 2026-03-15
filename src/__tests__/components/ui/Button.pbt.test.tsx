// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import Button from '@/components/ui/Button';

const variant = fc.constantFrom('primary' as const, 'secondary' as const, 'dark' as const);
const size = fc.constantFrom('sm' as const, 'md' as const, 'lg' as const);

describe('Feature: design-system-foundations', () => {
  /**
   * Property 2: Button element type determined by href
   *
   * For any non-empty string href, Button renders an <a> element.
   * For any render without href (undefined), Button renders a <button> element.
   *
   * **Validates: Requirements 5.5**
   */
  it('Property 2: Button element type determined by href', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({
            href: fc.string({ minLength: 1 }),
            variant,
            size,
          }),
          fc.record({
            href: fc.constant(undefined),
            variant,
            size,
          }),
        ),
        ({ href, variant: v, size: s }) => {
          const { container } = render(
            <Button variant={v} size={s} href={href}>
              Label
            </Button>,
          );

          if (href !== undefined) {
            const anchor = container.querySelector('a');
            expect(anchor).not.toBeNull();
            expect(container.querySelector('button')).toBeNull();
          } else {
            const button = container.querySelector('button');
            expect(button).not.toBeNull();
            expect(container.querySelector('a')).toBeNull();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 3: Button accessible name
   *
   * For any non-empty children text, the rendered element has an accessible
   * name that includes that text.
   *
   * **Validates: Requirements 5.7**
   */
  it('Property 3: Button accessible name', () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          variant,
          size,
          hasHref: fc.boolean(),
        }),
        ({ text, variant: v, size: s, hasHref }) => {
          const href = hasHref ? '/test' : undefined;
          const { container } = render(
            <Button variant={v} size={s} href={href}>
              {text}
            </Button>,
          );

          const el = container.querySelector('a, button')!;
          expect(el).not.toBeNull();
          // The accessible name should contain the children text
          expect(el.textContent).toContain(text);
        },
      ),
      { numRuns: 100 },
    );
  });
});
