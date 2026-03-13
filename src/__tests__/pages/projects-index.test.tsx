// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Project } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getProjects } from '@/lib/content';
import ProjectsPage from '@/app/projects/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    title: 'Test Project',
    slug: 'test-project' as unknown as Slug,
    description: 'A test project',
    content: '# Project',
    stack: ['TypeScript'],
    categories: ['web'],
    status: 'completed' as const,
    highlight: false,
    ...overrides,
  } as Project;
}

describe('Projects Index', () => {
  // --- P10: DOM order matches loader order ---

  describe('P10: sort order preservation', () => {
    it('renders projects in the same order as the content loader', async () => {
      const projects = [
        makeProject({ title: 'Alpha Project', slug: 'alpha' as unknown as Slug }),
        makeProject({ title: 'Beta Project', slug: 'beta' as unknown as Slug }),
        makeProject({ title: 'Gamma Project', slug: 'gamma' as unknown as Slug }),
      ];
      vi.mocked(getProjects).mockResolvedValue(projects);

      const el = await ProjectsPage();
      const { container } = render(el);

      // ProjectCard articles are nested inside the grid div, skip the page-level <article> wrapper
      const grid = container.querySelector('.grid')!;
      const cardArticles = grid.querySelectorAll('article');
      expect(cardArticles).toHaveLength(3);
      expect(within(cardArticles[0] as HTMLElement).getByText('Alpha Project')).toBeInTheDocument();
      expect(within(cardArticles[1] as HTMLElement).getByText('Beta Project')).toBeInTheDocument();
      expect(within(cardArticles[2] as HTMLElement).getByText('Gamma Project')).toBeInTheDocument();
    });
  });

  // --- Empty state ---

  describe('Empty state', () => {
    it('displays empty state message when no projects exist', async () => {
      vi.mocked(getProjects).mockResolvedValue([]);

      const el = await ProjectsPage();
      render(el);

      expect(screen.getByText('No projects yet.')).toBeInTheDocument();
    });

    it('renders no ProjectCard articles when empty', async () => {
      vi.mocked(getProjects).mockResolvedValue([]);

      const el = await ProjectsPage();
      const { container } = render(el);

      // No grid rendered when empty, so no ProjectCard articles inside it
      const grid = container.querySelector('.grid');
      expect(grid).toBeNull();
    });
  });
});
