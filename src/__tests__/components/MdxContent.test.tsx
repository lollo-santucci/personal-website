// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import MdxContent from '@/components/MdxContent';

describe('MdxContent', () => {
  /**
   * Feature: core-content-pages, Property 4: MdxContent wrapper applies prose typography classes
   * Validates: Requirements 8.4, 11.1
   */
  it('applies prose class to the outermost element for any children', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (text) => {
        const { container } = render(
          <MdxContent>
            <p>{text}</p>
          </MdxContent>,
        );

        const wrapper = container.firstElementChild;
        expect(wrapper).not.toBeNull();
        expect(wrapper).toHaveClass('prose');

        // cleanup for next iteration
        container.innerHTML = '';
      }),
    );
  });
});
