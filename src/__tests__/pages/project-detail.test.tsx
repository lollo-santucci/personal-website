// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Project } from '@/lib/types';
import type { Slug, AssetPath } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
  getAgents: vi.fn(),
  getBlogPosts: vi.fn(),
  renderMDX: vi.fn(),
}));
vi.mock('@/lib/content/agent-utils', () => ({
  sortAgentsByIndex: vi.fn((agents: any[]) => [...agents].sort((a: any, b: any) => a.index - b.index)),
}));
class NotFoundError extends Error {
  constructor() { super('NEXT_NOT_FOUND'); }
}
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new NotFoundError(); }),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div><h1>{title}</h1><div>{children}</div></div>
  ),
}));
vi.mock('@/components/Breadcrumb', () => ({
  default: ({ items, current }: any) => (
    <nav aria-label="Breadcrumb">
      {items.map((i: any) => <a key={i.href} href={i.href}>{i.label}</a>)}
      <span>{current}</span>
    </nav>
  ),
}));
vi.mock('@/components/ui/Prose', () => ({
  default: ({ children }: any) => <div data-testid="prose">{children}</div>,
}));
vi.mock('@/components/ui/Badge', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ProjectMetadataPanel', () => ({
  default: ({ stack, liveUrl }: any) => (
    <div data-testid="metadata-panel">
      {stack?.map((t: string) => <span key={t}>{t}</span>)}
      {liveUrl && <a href={liveUrl}>Launch</a>}
    </div>
  ),
}));

import { getProjects, getProjectBySlug, getAgents, getBlogPosts, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import ProjectDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/projects/[slug]/page';

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

function setupMocks(project: Project | null = makeProject()) {
  vi.mocked(getProjectBySlug).mockResolvedValue(project);
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);
  vi.mocked(getAgents).mockResolvedValue([]);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
}

describe('Project Detail Page', () => {
  it('renders project title as h1', async () => {
    setupMocks(makeProject({ title: 'Cool Project' }));
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Cool Project' })).toBeInTheDocument();
  });

  it('renders breadcrumb with link to /projects', async () => {
    setupMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('href', '/projects');
  });

  it('renders hero image when project has image', async () => {
    setupMocks(makeProject({ image: '/assets/screenshot.png' as unknown as AssetPath }));
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    const { container } = render(el);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/screenshot.png');
  });

  it('renders tech badges', async () => {
    setupMocks(makeProject({ stack: ['Go', 'Rust'] }));
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    expect(screen.getAllByText('Go').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Rust').length).toBeGreaterThanOrEqual(1);
  });

  it('renders MDX content via Prose', async () => {
    setupMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    expect(screen.getByTestId('prose')).toBeInTheDocument();
  });

  it('renders ProjectMetadataPanel', async () => {
    setupMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    expect(screen.getByTestId('metadata-panel')).toBeInTheDocument();
  });

  it('still renders title when renderMDX throws', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeProject({ title: 'Resilient Project' }));
    vi.mocked(renderMDX).mockRejectedValue(new Error('MDX compilation failed'));
    vi.mocked(getAgents).mockResolvedValue([]);
    vi.mocked(getBlogPosts).mockResolvedValue([]);

    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Resilient Project' })).toBeInTheDocument();
    expect(screen.getByText('Content could not be rendered.')).toBeInTheDocument();
  });

  it('calls notFound() when project does not exist', async () => {
    setupMocks(null);
    await expect(
      ProjectDetailPage({ params: Promise.resolve({ slug: 'nonexistent' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

describe('Project Detail generateStaticParams', () => {
  it('returns all project slugs', async () => {
    vi.mocked(getProjects).mockResolvedValue([
      makeProject({ slug: 'alpha' as unknown as Slug }),
      makeProject({ slug: 'beta' as unknown as Slug }),
    ]);
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: 'alpha' }, { slug: 'beta' }]);
  });

  it('returns empty array when no projects exist', async () => {
    vi.mocked(getProjects).mockResolvedValue([]);
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });
});

describe('Project Detail generateMetadata', () => {
  it('returns project title and description', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(
      makeProject({ title: 'My Project', description: 'A great project' }),
    );
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'my-project' }) });
    expect(meta.title).toBe('My Project');
    expect(meta.description).toBe('A great project');
  });

  it('returns empty object when project not found', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(null);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
    expect(meta).toEqual({});
  });

  it('includes canonical URL', async () => {
    vi.mocked(getProjectBySlug).mockResolvedValue(makeProject());
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'test-project' }) });
    expect(meta.alternates?.canonical).toBe('/projects/test-project');
  });
});
