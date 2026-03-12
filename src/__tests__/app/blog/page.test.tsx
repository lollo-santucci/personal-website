// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
}));

import { getBlogPosts } from '@/lib/content';
import BlogPage from '@/app/blog/page';

const mockPosts = [
  {
    title: 'Post A',
    slug: 'post-a',
    excerpt: 'Excerpt A',
    date: '2024-06-15',
    content: '',
    categories: [],
    tags: [],
  },
  {
    title: 'Post B',
    slug: 'post-b',
    excerpt: 'Excerpt B',
    date: '2024-07-20',
    content: '',
    categories: [],
    tags: [],
  },
];

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Blog index page', () => {
  it('renders heading "Blog"', async () => {
    vi.mocked(getBlogPosts).mockResolvedValue(mockPosts as never);

    const element = await BlogPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeInTheDocument();
  });

  it('renders each post title as a link, formatted date, and excerpt', async () => {
    vi.mocked(getBlogPosts).mockResolvedValue(mockPosts as never);

    const element = await BlogPage();
    render(element);

    const linkA = screen.getByRole('link', { name: 'Post A' });
    expect(linkA).toBeInTheDocument();
    expect(linkA).toHaveAttribute('href', '/blog/post-a');
    expect(screen.getByText('June 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Excerpt A')).toBeInTheDocument();

    const linkB = screen.getByRole('link', { name: 'Post B' });
    expect(linkB).toBeInTheDocument();
    expect(linkB).toHaveAttribute('href', '/blog/post-b');
    expect(screen.getByText('July 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('Excerpt B')).toBeInTheDocument();
  });

  it('renders empty list when getBlogPosts returns []', async () => {
    vi.mocked(getBlogPosts).mockResolvedValue([]);

    const element = await BlogPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Blog' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
