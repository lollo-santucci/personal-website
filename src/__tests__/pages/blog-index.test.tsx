// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { BlogPost } from '@/lib/types';
import type { Slug, IsoDateString } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
  getAgents: vi.fn(),
  getProjects: vi.fn(),
}));
vi.mock('@/lib/content/agent-utils', () => ({
  sortAgentsByIndex: vi.fn((agents: any[]) => [...agents].sort((a: any, b: any) => a.index - b.index)),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));
vi.mock('@/components/ui/CollectionContainer', () => ({
  default: ({ children }: any) => <div data-testid="collection">{children}</div>,
}));
vi.mock('@/components/ui/CollectionRow', () => ({
  default: ({ children, action }: any) => (
    <div data-testid="collection-row">{children}{action}</div>
  ),
}));
vi.mock('@/components/ui/Badge', () => ({
  default: ({ children, variant }: any) => <span data-testid={`badge-${variant}`}>{children}</span>,
}));
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, href, ...props }: any) =>
    href ? <a href={href} {...props}>{children}</a> : <button {...props}>{children}</button>,
}));
vi.mock('@/components/ui/RPGSelector', () => ({
  default: () => <span>&gt;</span>,
}));

import { getBlogPosts, getAgents, getProjects } from '@/lib/content';
import BlogPage, { metadata } from '@/app/blog/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post' as unknown as Slug,
    excerpt: 'A test excerpt',
    content: '# Post',
    date: '2025-01-15' as unknown as IsoDateString,
    categories: ['tech'],
    tags: ['typescript'],
    ...overrides,
  } as BlogPost;
}

function setupMocks(posts: BlogPost[] = []) {
  vi.mocked(getBlogPosts).mockResolvedValue(posts);
  vi.mocked(getAgents).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('Blog Index', () => {
  it('renders heading "Blog"', async () => {
    setupMocks([makePost()]);
    const el = await BlogPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument();
  });

  it('renders posts as collection rows with formatted dates', async () => {
    setupMocks([
      makePost({ title: 'First Post', slug: 'first' as unknown as Slug, date: '2025-03-01' as unknown as IsoDateString }),
      makePost({ title: 'Second Post', slug: 'second' as unknown as Slug, date: '2025-02-15' as unknown as IsoDateString }),
    ]);
    const el = await BlogPage();
    render(el);

    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
    expect(screen.getByText('01.03.2025')).toBeInTheDocument();
    expect(screen.getByText('15.02.2025')).toBeInTheDocument();
  });

  it('renders "Read" buttons linking to post detail pages', async () => {
    setupMocks([makePost({ slug: 'my-post' as unknown as Slug })]);
    const el = await BlogPage();
    render(el);

    const readLink = screen.getByRole('link', { name: 'Read' });
    expect(readLink).toHaveAttribute('href', '/blog/my-post');
  });

  it('displays empty state message when no posts exist', async () => {
    setupMocks([]);
    const el = await BlogPage();
    render(el);
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });

  it('has static metadata with title "Blog"', () => {
    expect(metadata.title).toBe('Blog');
    expect(typeof metadata.description).toBe('string');
    expect(metadata.alternates?.canonical).toBe('/blog');
  });
});
