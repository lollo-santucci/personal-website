// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import type { Project } from '@/lib/types';
import type { Slug, AssetPath } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));
class NotFoundError extends Error {
  constructor() {
    super('NEXT_NOT_FOUND');
  }
}
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new NotFoundError();
  }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getProjects, getProjectBySlug, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import ProjectDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/projects/[slug]/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --- Helpers ---

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    title: 'Test Project',
    slug: 'test-project' as unknown as Slug,
    description: 'A test project description',
    content: '# Project content',
    stack: ['TypeScript'],
    categories: ['web'],
    status: 'completed' as const,
    highlight: false,
    ...overrides,
  } as Project;
}

// --- PBT generators ---

const wordArb = fc.stringMatching(/^[A-Za-z0-9]+$/, {
  minLength: 1,
  maxLength: 20,
});

const slugArb = fc
  .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    minLength: 1,
    maxLength: 30,
  })
  .filter((s) => s.length > 0);

const projectArb: fc.Arbitrary<Project> = fc
  .record({
    title: wordArb.map((s) => `Project ${s}`),
    slug: slugArb,
    description: wordArb.map((s) => `Description ${s}`),
    content: fc.constant('# Content'),
    stack: fc.array(wordArb, { minLength: 1, maxLength: 4 }),
    categories: fc.array(wordArb, { minLength: 1, maxLength: 3 }),
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
      wordArb.map((s) => `/assets/${s}.png` as unknown as AssetPath),
      { nil: undefined },
    ),
    order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
  })
  .map((raw) => ({
    ...raw,
    slug: raw.slug as unknown as Slug,
  }));

describe('Project Detail Page', () => {
  // --- P8 (PBT): Dynamic route metadata includes entity title and summary ---

  /**
   * Feature: core-content-pages, Property 8: Dynamic route metadata includes entity title and summary
   * Validates: Requirements 4.8, 12.1, 12.3
   */
  it('P8: generateMetadata returns project title and description for any project', async () => {
    await fc.assert(
      fc.asyncProperty(projectArb, async (project) => {
        vi.mocked(getProjectBySlug).mockResolvedValue(project);

        const meta = await generateMetadata({
          params: Promise.resolve({ slug: String(project.slug) }),
        });

        expect(meta.title).toBe(project.title);
        expect(meta.description).toBe(project.description);
      }),
    );
  });

  it('P8: generateMetadata returns empty object when project not found', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(null);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'nonexistent' }),
    });

    expect(meta).toEqual({});
  });

  // --- P9 (unit): generateStaticParams returns all slugs ---

  describe('P9: generateStaticParams', () => {
    it('returns all project slugs from the content loader', async () => {
      const projects = [
        makeProject({ slug: 'alpha' as unknown as Slug }),
        makeProject({ slug: 'beta' as unknown as Slug }),
        makeProject({ slug: 'gamma' as unknown as Slug }),
      ];
      vi.mocked(getProjects).mockResolvedValue(projects);

      const params = await generateStaticParams();

      expect(params).toEqual([
        { slug: 'alpha' },
        { slug: 'beta' },
        { slug: 'gamma' },
      ]);
    });

    it('returns empty array when no projects exist', async () => {
      vi.mocked(getProjects).mockResolvedValue([]);

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });
  });

  // --- P11 (PBT): Project detail conditionally displays optional fields ---

  /**
   * Feature: core-content-pages, Property 11: Project detail conditionally displays optional fields
   * Validates: Requirements 4.4, 4.5
   */
  describe('P11: conditional optional fields', () => {
    it('conditionally renders links and image based on project data', async () => {
      await fc.assert(
        fc.asyncProperty(projectArb, async (project) => {
          cleanup();
          vi.mocked(getProjectBySlug).mockResolvedValue(project);
          vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);

          const el = await ProjectDetailPage({
            params: Promise.resolve({ slug: String(project.slug) }),
          });
          const { container } = render(el);

          // Image: present if project.image is defined
          const img = container.querySelector('img');
          if (project.image) {
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', String(project.image));
          } else {
            expect(img).not.toBeInTheDocument();
          }

          // Links: present only if links object has at least one defined value
          const hasLinks =
            project.links &&
            (project.links.live || project.links.github || project.links.demo);

          if (hasLinks) {
            if (project.links!.live) {
              expect(
                screen.getByRole('link', { name: 'Live Site' }),
              ).toHaveAttribute('href', project.links!.live);
            }
            if (project.links!.github) {
              expect(
                screen.getByRole('link', { name: 'GitHub' }),
              ).toHaveAttribute('href', project.links!.github);
            }
            if (project.links!.demo) {
              expect(
                screen.getByRole('link', { name: 'Demo' }),
              ).toHaveAttribute('href', project.links!.demo);
            }
          } else {
            expect(
              screen.queryByRole('link', { name: 'Live Site' }),
            ).not.toBeInTheDocument();
            expect(
              screen.queryByRole('link', { name: 'GitHub' }),
            ).not.toBeInTheDocument();
            expect(
              screen.queryByRole('link', { name: 'Demo' }),
            ).not.toBeInTheDocument();
          }

          cleanup();
        }),
      );
    });
  });

  // --- P13 (unit): MDX render failure does not crash the page ---

  describe('P13: MDX render failure resilience', () => {
    it('still renders the project title when renderMDX throws', async () => {
      const project = makeProject({ title: 'Resilient Project' });
      vi.mocked(getProjectBySlug).mockResolvedValue(project);
      vi.mocked(renderMDX).mockRejectedValue(new Error('MDX compilation failed'));

      const el = await ProjectDetailPage({
        params: Promise.resolve({ slug: 'test-project' }),
      });
      render(el);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Resilient Project' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Content could not be rendered.'),
      ).toBeInTheDocument();
    });
  });

  // --- 404: notFound() called when project doesn't exist ---

  describe('404 behavior', () => {
    it('calls notFound() when project slug does not match', async () => {
      vi.mocked(getProjectBySlug).mockResolvedValue(null);

      await expect(
        ProjectDetailPage({
          params: Promise.resolve({ slug: 'nonexistent' }),
        }),
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(notFound).toHaveBeenCalled();
    });
  });

  // --- Back navigation: link to /projects ---

  describe('Back navigation', () => {
    it('renders a link back to /projects', async () => {
      vi.mocked(getProjectBySlug).mockResolvedValue(makeProject());
      vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);

      const el = await ProjectDetailPage({
        params: Promise.resolve({ slug: 'test-project' }),
      });
      render(el);

      const backLink = screen.getByRole('link', { name: /back to projects/i });
      expect(backLink).toHaveAttribute('href', '/projects');
    });
  });
});
