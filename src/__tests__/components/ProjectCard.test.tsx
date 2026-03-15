// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    title: 'Test Project',
    slug: 'test-project' as unknown as Slug,
    description: 'A test project description',
    content: '# Project content',
    stack: ['TypeScript', 'React'],
    categories: ['web'],
    status: 'completed' as const,
    highlight: false,
    ...overrides,
  } as Project;
}

describe('ProjectCard (design-system-native)', () => {
  it('renders a link to /projects/{slug}', () => {
    const { container } = render(
      <ProjectCard project={makeProject({ slug: 'my-proj' as unknown as Slug })} />,
    );
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/projects/my-proj');
  });

  it('renders the project title', () => {
    const { container } = render(
      <ProjectCard project={makeProject({ title: 'Cool Project' })} />,
    );
    expect(container.textContent).toContain('Cool Project');
  });

  it('renders the project description', () => {
    const { container } = render(
      <ProjectCard project={makeProject({ description: 'Does cool things' })} />,
    );
    expect(container.textContent).toContain('Does cool things');
  });

  it('renders tech badges for each stack item', () => {
    const { container } = render(
      <ProjectCard project={makeProject({ stack: ['Go', 'Rust', 'Zig'] })} />,
    );
    expect(container.textContent).toContain('Go');
    expect(container.textContent).toContain('Rust');
    expect(container.textContent).toContain('Zig');
  });

  it('renders project image when present', () => {
    const { container } = render(
      <ProjectCard
        project={makeProject({ image: '/assets/screenshot.png' as unknown as AssetPath })}
      />,
    );
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/screenshot.png');
  });

  it('renders placeholder when no image', () => {
    const { container } = render(
      <ProjectCard project={makeProject({ image: undefined })} />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeInTheDocument();
    expect(container.textContent).toContain('No preview');
  });

  it('renders an ArrowUpRight icon next to the title', () => {
    const { container } = render(<ProjectCard project={makeProject()} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('wraps the entire card in an article element', () => {
    const { container } = render(<ProjectCard project={makeProject()} />);
    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
