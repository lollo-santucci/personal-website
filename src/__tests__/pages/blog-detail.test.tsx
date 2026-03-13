// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import type { BlogPost } from '@/lib/types';
import type { Slug, IsoDateString, AssetPath } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
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

import { getBlogPosts, getBlogPostBySlug, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import BlogDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/blog/[slug]/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --- Helpers ---

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post' as unknown as Slug,
    excerpt: 'A test post excerpt',
    content: '# Post content',
    date: '2025-01-15' as unknown as IsoDateString,
    categories: ['web'],
    tags: ['typescript'],
    ...overrides,
  } as BlogPost;
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

const isoDateArb = fc
  .tuple(
    fc.integer({ min: 2000, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(
    ([y, m, d]) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  );

const blogPostArb: fc.Arbitrary<BlogPost> = fc
  .record({
    title: wordArb.map((s) => `Post ${s}`),
    slug: slugArb,
    excerpt: wordArb.map((s) => `Excerpt ${s}`),
    content: fc.constant('# Content'),
    date: isoDateArb,
    categories: fc.array(wordArb, { minLength: 1, maxLength: 3 }),
    tags: fc.array(wordArb, { minLength: 0, maxLength: 4 }),
    image: fc.option(
      wordArb.map((s) => `/assets/${s}.png` as unknown as AssetPath),
      { nil: undefined },
    ),
  })
  .map((raw) => ({
    ...raw,
    slug: raw.slug as unknown as Slug,
    date: raw.date as unknown as IsoDateString,
  }));

describe('Blog Post Detail Page', () => {
  // --- P8 (PBT): Dynamic route metadata includes entity title and summary ---

  /**
   * Feature: core-content-pages, Property 8: Dynamic route metadata includes entity title and summary
   * Validates: Requirements 6.7, 12.1, 12.3
   */
  it('P8: generateMetadata returns post title and excerpt for any blog post', async () => {
    await fc.assert(
      fc.asyncProperty(blogPostArb, async (post) => {
        vi.mocked(getBlogPostBySlug).mockResolvedValue(post);

        const meta = await generateMetadata({
          params: Promise.resolve({ slug: String(post.slug) }),
        });

        expect(meta.title).toBe(post.title);
        expect(meta.description).toBe(post.excerpt);
      }),
    );
  });

  it('P8: generateMetadata returns empty object when post not found', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'nonexistent' }),
    });

    expect(meta).toEqual({});
  });

  // --- P9 (unit): generateStaticParams returns all slugs ---

  describe('P9: generateStaticParams', () => {
    it('returns all blog post slugs from the content loader', async () => {
      const posts = [
        makePost({ slug: 'alpha' as unknown as Slug }),
        makePost({ slug: 'beta' as unknown as Slug }),
        makePost({ slug: 'gamma' as unknown as Slug }),
      ];
      vi.mocked(getBlogPosts).mockResolvedValue(posts);

      const params = await generateStaticParams();

      expect(params).toEqual([
        { slug: 'alpha' },
        { slug: 'beta' },
        { slug: 'gamma' },
      ]);
    });

    it('returns empty array when no blog posts exist', async () => {
      vi.mocked(getBlogPosts).mockResolvedValue([]);

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });
  });

  // --- P12 (PBT): Blog post detail conditionally displays optional image ---

  /**
   * Feature: core-content-pages, Property 12: Blog post detail conditionally displays optional image
   * Validates: Requirements 6.4
   */
  describe('P12: conditional optional image', () => {
    it('conditionally renders image based on blog post data', async () => {
      await fc.assert(
        fc.asyncProperty(blogPostArb, async (post) => {
          cleanup();
          vi.mocked(getBlogPostBySlug).mockResolvedValue(post);
          vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);

          const el = await BlogDetailPage({
            params: Promise.resolve({ slug: String(post.slug) }),
          });
          const { container } = render(el);

          const img = container.querySelector('img');
          if (post.image) {
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', String(post.image));
          } else {
            expect(img).not.toBeInTheDocument();
          }

          cleanup();
        }),
      );
    });
  });

  // --- P13 (unit): MDX render failure does not crash the page ---

  describe('P13: MDX render failure resilience', () => {
    it('still renders the post title when renderMDX throws', async () => {
      const post = makePost({ title: 'Resilient Post' });
      vi.mocked(getBlogPostBySlug).mockResolvedValue(post);
      vi.mocked(renderMDX).mockRejectedValue(
        new Error('MDX compilation failed'),
      );

      const el = await BlogDetailPage({
        params: Promise.resolve({ slug: 'test-post' }),
      });
      render(el);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Resilient Post' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Content could not be rendered.'),
      ).toBeInTheDocument();
    });
  });

  // --- 404: notFound() called when post doesn't exist ---

  describe('404 behavior', () => {
    it('calls notFound() when blog post slug does not match', async () => {
      vi.mocked(getBlogPostBySlug).mockResolvedValue(null);

      await expect(
        BlogDetailPage({
          params: Promise.resolve({ slug: 'nonexistent' }),
        }),
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(notFound).toHaveBeenCalled();
    });
  });

  // --- Back navigation: link to /blog ---

  describe('Back navigation', () => {
    it('renders a link back to /blog', async () => {
      vi.mocked(getBlogPostBySlug).mockResolvedValue(makePost());
      vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);

      const el = await BlogDetailPage({
        params: Promise.resolve({ slug: 'test-post' }),
      });
      render(el);

      const backLink = screen.getByRole('link', { name: /back to blog/i });
      expect(backLink).toHaveAttribute('href', '/blog');
    });
  });
});
