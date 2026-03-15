// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Project } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
  getBlogPosts: vi.fn(),
  getAgents: vi.fn(),
}));
vi.mock('@/lib/content/agent-utils', () => ({
  sortAgentsByIndex: vi.fn((agents: any[]) => [...agents].sort((a: any, b: any) => a.index - b.index)),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div><h1>{title}</h1><div>{children}</div></div>
  ),
}));
vi.mock('@/components/ProjectCard', () => ({
  default: ({ project }: any) => (
    <article data-testid="project-card">
      <a href={`/projects/${project.slug}`}>{project.title}</a>
      <p>{project.description}</p>
    </article>
  ),
}));

import { getProjects, getBlogPosts, getAgents } from '@/lib/content';
import ProjectsPage, { metadata } from '@/app/projects/page';

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

function setupMocks(projects: Project[] = []) {
  vi.mocked(getProjects).mockResolvedValue(projects);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
  vi.mocked(getAgents).mockResolvedValue([]);
}

describe('Projects Index', () => {
  it('renders heading "Projects"', async () => {
    setupMocks([makeProject()]);
    const el = await ProjectsPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
  });

  it('renders projects via ProjectCard', async () => {
    setupMocks([
      makeProject({ title: 'Alpha Project', slug: 'alpha' as unknown as Slug }),
      makeProject({ title: 'Beta Project', slug: 'beta' as unknown as Slug }),
    ]);
    const el = await ProjectsPage();
    render(el);

    const cards = screen.getAllByTestId('project-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Alpha Project')).toBeInTheDocument();
    expect(screen.getByText('Beta Project')).toBeInTheDocument();
  });

  it('renders project links to correct paths', async () => {
    setupMocks([makeProject({ slug: 'my-proj' as unknown as Slug, title: 'My Proj' })]);
    const el = await ProjectsPage();
    render(el);
    const link = screen.getByRole('link', { name: 'My Proj' });
    expect(link).toHaveAttribute('href', '/projects/my-proj');
  });

  it('displays empty state message when no projects exist', async () => {
    setupMocks([]);
    const el = await ProjectsPage();
    render(el);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('does not render project cards when empty', async () => {
    setupMocks([]);
    const el = await ProjectsPage();
    render(el);
    expect(screen.queryByTestId('project-card')).not.toBeInTheDocument();
  });

  it('has static metadata with title "Projects"', () => {
    expect(metadata.title).toBe('Projects');
    expect(typeof metadata.description).toBe('string');
    expect(metadata.alternates?.canonical).toBe('/projects');
  });
});
