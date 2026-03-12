// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
}));

import { getProjects } from '@/lib/content';
import ProjectsPage from '@/app/projects/page';

const mockProjects = [
  {
    title: 'Project A',
    slug: 'project-a',
    description: 'Description A',
    content: '',
    stack: [],
    categories: [],
    status: 'completed' as const,
    highlight: false,
  },
  {
    title: 'Project B',
    slug: 'project-b',
    description: 'Description B',
    content: '',
    stack: [],
    categories: [],
    status: 'completed' as const,
    highlight: false,
  },
];

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Projects index page', () => {
  it('renders heading "Projects"', async () => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects as never);

    const element = await ProjectsPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeInTheDocument();
  });

  it('renders each project title as a link and description', async () => {
    vi.mocked(getProjects).mockResolvedValue(mockProjects as never);

    const element = await ProjectsPage();
    render(element);

    const linkA = screen.getByRole('link', { name: 'Project A' });
    expect(linkA).toBeInTheDocument();
    expect(linkA).toHaveAttribute('href', '/projects/project-a');
    expect(screen.getByText('Description A')).toBeInTheDocument();

    const linkB = screen.getByRole('link', { name: 'Project B' });
    expect(linkB).toBeInTheDocument();
    expect(linkB).toHaveAttribute('href', '/projects/project-b');
    expect(screen.getByText('Description B')).toBeInTheDocument();
  });

  it('renders empty list when getProjects returns []', async () => {
    vi.mocked(getProjects).mockResolvedValue([]);

    const element = await ProjectsPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
