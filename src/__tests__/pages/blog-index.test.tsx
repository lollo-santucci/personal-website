// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { BlogPost } from '@/lib/types';
import type { Slug, IsoDateString } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getBlogPosts } from '@/lib/content';
import BlogPage from '@/app/blog/page';

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

describe('Blog Index', () => {
  // --- P10: DOM order matches loader order ---

  describe('P10: sort order preservation', () => {
    it('renders posts in the same order as the content loader', async () => {
      const posts = [
        makePost({ title: 'First Post', slug: 'first' as unknown as Slug, date: '2025-03-01' as unknown as IsoDateString }),
        makePost({ title: 'Second Post', slug: 'second' as unknown as Slug, date: '2025-02-01' as unknown as IsoDateString }),
        makePost({ title: 'Third Post', slug: 'third' as unknown as Slug, date: '2025-01-01' as unknown as IsoDateString }),
      ];
      vi.mocked(getBlogPosts).mockResolvedValue(posts);

      const el = await BlogPage();
      const { container } = render(el);

      const grid = container.querySelector('.grid')!;
      const cardArticles = grid.querySelectorAll('article');
      expect(cardArticles).toHaveLength(3);
      expect(within(cardArticles[0] as HTMLElement).getByText('First Post')).toBeInTheDocument();
      expect(within(cardArticles[1] as HTMLElement).getByText('Second Post')).toBeInTheDocument();
      expect(within(cardArticles[2] as HTMLElement).getByText('Third Post')).toBeInTheDocument();
    });
  });

  // --- Empty state ---

  describe('Empty state', () => {
    it('displays empty state message when no posts exist', async () => {
      vi.mocked(getBlogPosts).mockResolvedValue([]);

      const el = await BlogPage();
      render(el);

      expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    });

    it('renders no BlogPostCard articles when empty', async () => {
      vi.mocked(getBlogPosts).mockResolvedValue([]);

      const el = await BlogPage();
      const { container } = render(el);

      const grid = container.querySelector('.grid');
      expect(grid).toBeNull();
    });
  });
});
