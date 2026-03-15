// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import PixelImage from '@/components/ui/PixelImage';

describe('Feature: design-system-foundations', () => {
  /**
   * Property 6: PixelImage integer scaling
   *
   * For any source dimensions (width, height) where both are positive integers,
   * and for any scale factor in {2, 3, 4}, the rendered img has
   * width = width*scale and height = height*scale.
   *
   * **Validates: Requirements 14.3**
   */
  it('Property 6: PixelImage integer scaling', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 1, max: 512 }),
          height: fc.integer({ min: 1, max: 512 }),
          scale: fc.constantFrom(2 as const, 3 as const, 4 as const),
        }),
        ({ width, height, scale }) => {
          const { container } = render(
            <PixelImage
              src="/test.png"
              scale={scale}
              alt="Test"
              width={width}
              height={height}
            />,
          );
          const img = container.querySelector('img')!;
          expect(img).not.toBeNull();
          expect(img.getAttribute('width')).toBe(String(width * scale));
          expect(img.getAttribute('height')).toBe(String(height * scale));
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: PixelImage non-empty alt requirement
   *
   * For any render of PixelImage, the alt attribute on the rendered img
   * is a non-empty string.
   *
   * **Validates: Requirements 14.4, 18.3**
   */
  it('Property 7: PixelImage non-empty alt requirement', () => {
    fc.assert(
      fc.property(
        fc.record({
          alt: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          width: fc.integer({ min: 1, max: 512 }),
          height: fc.integer({ min: 1, max: 512 }),
          scale: fc.constantFrom(2 as const, 3 as const, 4 as const),
        }),
        ({ alt, width, height, scale }) => {
          const { container } = render(
            <PixelImage
              src="/test.png"
              scale={scale}
              alt={alt}
              width={width}
              height={height}
            />,
          );
          const img = container.querySelector('img')!;
          expect(img).not.toBeNull();
          const altAttr = img.getAttribute('alt');
          expect(altAttr).toBeTruthy();
          expect(altAttr!.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
