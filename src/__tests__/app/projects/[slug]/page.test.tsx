// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

import * as fc from 'fast-check';
import { getProjects, getProjectBySlug, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import ProjectDetailPage, {
  generateStaticParams,
} from '@/app/projects/[slug]/page';

const mockProject = {
  title: 'Project A',
  slug: 'project-a',
  description: 'Description A',
  content: 'Project MDX content',
  stack: [],
  categories: [],
  status: 'completed' as const,
  highlight: false,
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Project detail page', () => {
  it('renders project title and MDX content when project exists', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(mockProject as never);
    vi.mocked(renderMDX).mockResolvedValue(
      <div data-testid="mdx-content">rendered project</div>,
    );

    const element = await ProjectDetailPage({
      params: Promise.resolve({ slug: 'project-a' }),
    });
    render(element as React.ReactElement);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Project A' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
    expect(renderMDX).toHaveBeenCalledWith('Project MDX content');
  });

  it('calls notFound() when getProjectBySlug returns null', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    await expect(
      ProjectDetailPage({
        params: Promise.resolve({ slug: 'nonexistent' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });
});

describe('Property 4: generateStaticParams covers all known project slugs', () => {
  /**
   * Validates: Requirements 6.4
   *
   * For any array of projects, generateStaticParams() returns params
   * for every slug and no extras.
   */
  it('returns params matching every project slug exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
            title: fc.constant('T'),
            description: fc.constant('D'),
            content: fc.constant(''),
            stack: fc.constant([]),
            categories: fc.constant([]),
            status: fc.constant('completed' as const),
            highlight: fc.constant(false),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        async (projects) => {
          vi.mocked(getProjects).mockResolvedValue(projects as never);

          const params = await generateStaticParams();

          const inputSlugs = projects.map((p) => String(p.slug));
          const outputSlugs = params.map((p) => p.slug);

          expect(outputSlugs).toHaveLength(inputSlugs.length);
          expect(outputSlugs).toEqual(expect.arrayContaining(inputSlugs));
          expect(inputSlugs).toEqual(expect.arrayContaining(outputSlugs));
        },
      ),
      { numRuns: 100 },
    );
  });
});
