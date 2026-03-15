// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { BlogPost } from '@/lib/types';
import type { Slug, IsoDateString } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  getAgents: vi.fn(),
  getProjects: vi.fn(),
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
  default: ({ children, variant }: any) => <span data-testid={`badge-${variant}`}>{children}</span>,
}));

import { getBlogPosts, getBlogPostBySlug, getAgents, getProjects, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import BlogDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/blog/[slug]/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post' as unknown as Slug,
    excerpt: 'A test post excerpt',
    content: '# Post content with some words for read time calculation',
    date: '2025-01-15' as unknown as IsoDateString,
    categories: ['web'],
    tags: ['typescript'],
    ...overrides,
  } as BlogPost;
}

function setupMocks(post: BlogPost | null = makePost()) {
  vi.mocked(getBlogPostBySlug).mockResolvedValue(post);
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);
  vi.mocked(getAgents).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('Blog Post Detail Page', () => {
  it('renders post title as h1', async () => {
    setupMocks(makePost({ title: 'My Great Post' }));
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'My Great Post' })).toBeInTheDocument();
  });

  it('renders breadcrumb with link to /blog', async () => {
    setupMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    const blogLink = screen.getByRole('link', { name: 'Blog' });
    expect(blogLink).toHaveAttribute('href', '/blog');
  });

  it('renders formatted date in DD.MM.YYYY format', async () => {
    setupMocks(makePost({ date: '2025-03-15' as unknown as IsoDateString }));
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByText('15.03.2025')).toBeInTheDocument();
  });

  it('renders read time', async () => {
    setupMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('renders category badges', async () => {
    setupMocks(makePost({ categories: ['web', 'ai'] }));
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByText('web')).toBeInTheDocument();
    expect(screen.getByText('ai')).toBeInTheDocument();
  });

  it('renders tag badges', async () => {
    setupMocks(makePost({ tags: ['typescript', 'react'] }));
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('renders MDX content via Prose', async () => {
    setupMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByTestId('prose')).toBeInTheDocument();
  });

  it('still renders title when renderMDX throws', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(makePost({ title: 'Resilient Post' }));
    vi.mocked(renderMDX).mockRejectedValue(new Error('MDX compilation failed'));
    vi.mocked(getAgents).mockResolvedValue([]);
    vi.mocked(getProjects).mockResolvedValue([]);

    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Resilient Post' })).toBeInTheDocument();
    expect(screen.getByText('Content could not be rendered.')).toBeInTheDocument();
  });

  it('calls notFound() when post does not exist', async () => {
    setupMocks(null);
    await expect(
      BlogDetailPage({ params: Promise.resolve({ slug: 'nonexistent' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

describe('Blog Detail generateStaticParams', () => {
  it('returns all blog post slugs', async () => {
    vi.mocked(getBlogPosts).mockResolvedValue([
      makePost({ slug: 'alpha' as unknown as Slug }),
      makePost({ slug: 'beta' as unknown as Slug }),
    ]);
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: 'alpha' }, { slug: 'beta' }]);
  });

  it('returns empty array when no posts exist', async () => {
    vi.mocked(getBlogPosts).mockResolvedValue([]);
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });
});

describe('Blog Detail generateMetadata', () => {
  it('returns post title and excerpt', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(
      makePost({ title: 'My Post', excerpt: 'A great post' }),
    );
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'my-post' }) });
    expect(meta.title).toBe('My Post');
    expect(meta.description).toBe('A great post');
  });

  it('returns empty object when post not found', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
    expect(meta).toEqual({});
  });

  it('includes canonical URL', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(makePost());
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'test-post' }) });
    expect(meta.alternates?.canonical).toBe('/blog/test-post');
  });
});
