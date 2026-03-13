// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import type { Project } from '@/lib/types';
import type { Slug, AssetPath } from '@/lib/types/common';
import ProjectCard from '@/components/ProjectCard';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const STATUS_LABELS: Record<Project['status'], string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  ongoing: 'Ongoing',
};

/**
 * Alphanumeric-only generators with unique prefixes per field type.
 * No consecutive spaces — avoids textContent normalization mismatches.
 */
const wordArb = fc.stringMatching(/^[A-Za-z0-9]+$/, {
  minLength: 1,
  maxLength: 20,
});

const titleArb = wordArb.map((s) => `Title ${s}`);
const descArb = wordArb.map((s) => `Desc ${s}`);
const stackItemArb = wordArb.map((s) => `Tech ${s}`);

/** Unique non-empty stack array to avoid duplicate key issues. */
const uniqueStackArb = fc.uniqueArray(stackItemArb, {
  minLength: 1,
  maxLength: 8,
});

/** Arbitrary for a valid Project entity. */
const projectArb: fc.Arbitrary<Project> = fc
  .record({
    title: titleArb,
    slug: fc
      .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        minLength: 1,
        maxLength: 40,
      })
      .filter((s) => s.length > 0),
    description: descArb,
    content: fc.string({ minLength: 1, maxLength: 100 }),
    stack: uniqueStackArb,
    categories: fc.array(wordArb, { minLength: 1, maxLength: 5 }),
    status: fc.constantFrom(
      'completed' as const,
      'in-progress' as const,
      'ongoing' as const,
    ),
    highlight: fc.boolean(),
    links: fc.option(
      fc.record({
        live: fc.option(fc.webUrl(), { nil: undefined }),
        github: fc.option(fc.webUrl(), { nil: undefined }),
        demo: fc.option(fc.webUrl(), { nil: undefined }),
      }),
      { nil: undefined },
    ),
    image: fc.option(
      wordArb.map((s) => s as unknown as AssetPath),
      { nil: undefined },
    ),
    order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  })
  .map((raw) => ({
    ...raw,
    slug: raw.slug as unknown as Slug,
  }));

describe('ProjectCard', () => {
  /**
   * Feature: core-content-pages, Property 2: ProjectCard renders all required fields and correct link
   * Validates: Requirements 8.1, 3.2, 3.3, 1.9
   */
  it('renders all required fields and correct link for any valid Project', () => {
    fc.assert(
      fc.property(projectArb, (project) => {
        cleanup();
        const { container } = render(<ProjectCard project={project} />);
        const article = container.querySelector('article')!;
        const scope = within(article);

        // Title is rendered inside a link with correct href
        const link = scope.getByRole('link');
        expect(link.textContent).toBe(project.title);
        expect(link).toHaveAttribute('href', `/projects/${project.slug}`);

        // Description is rendered
        expect(scope.getByText(project.description)).toBeInTheDocument();

        // Each stack tag is rendered
        for (const tech of project.stack) {
          expect(scope.getByText(tech)).toBeInTheDocument();
        }

        // Status label is rendered
        const expectedLabel = STATUS_LABELS[project.status];
        expect(scope.getByText(expectedLabel)).toBeInTheDocument();

        cleanup();
      }),
    );
  });
});
