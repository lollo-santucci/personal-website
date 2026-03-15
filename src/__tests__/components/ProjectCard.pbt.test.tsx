// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

function makeProject(slug: string): Project {
  return {
    title: `Project ${slug}`,
    slug: slug as unknown as Slug,
    description: 'A test project',
    content: 'Some content',
    stack: ['TypeScript'],
    categories: ['web'],
    status: 'completed',
    highlight: false,
  };
}

describe('ProjectCard', () => {
  /**
   * Feature: design-system-application, Property 6: Project card links to correct slug path
   * Validates: Requirements 14.5
   */
  it('Property 6: Project card links to correct slug path', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)),
        (slug) => {
          const project = makeProject(slug);
          const { container } = render(<ProjectCard project={project} />);

          const link = container.querySelector('a');
          expect(link).not.toBeNull();
          expect(link!.getAttribute('href')).toBe(`/projects/${slug}`);
        },
      ),
      { numRuns: 100 },
    );
  });
});
