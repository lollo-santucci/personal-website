// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

import * as fc from 'fast-check';
import { getBlogPosts, getBlogPostBySlug, renderMDX } from '@/lib/content';
import { notFound } from 'next/navigation';
import BlogDetailPage, {
  generateStaticParams,
} from '@/app/blog/[slug]/page';

const mockPost = {
  title: 'Post A',
  slug: 'post-a',
  excerpt: 'Excerpt A',
  date: '2024-06-15',
  content: 'Blog MDX content',
  categories: [],
  tags: [],
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Blog detail page', () => {
  it('renders post title, formatted date, and MDX content when post exists', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(mockPost as never);
    vi.mocked(renderMDX).mockResolvedValue(
      <div data-testid="mdx-content">rendered blog post</div>,
    );

    const element = await BlogDetailPage({
      params: Promise.resolve({ slug: 'post-a' }),
    });
    render(element as React.ReactElement);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Post A' }),
    ).toBeInTheDocument();
    expect(screen.getByText('June 15, 2024')).toBeInTheDocument();
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
    expect(renderMDX).toHaveBeenCalledWith('Blog MDX content');
  });

  it('calls notFound() when getBlogPostBySlug returns null', async () => {
    vi.mocked(getBlogPostBySlug).mockResolvedValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    await expect(
      BlogDetailPage({
        params: Promise.resolve({ slug: 'nonexistent' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });
});

describe('Property 4: generateStaticParams covers all known blog post slugs', () => {
  /**
   * Validates: Requirements 7.4
   *
   * For any array of blog posts, generateStaticParams() returns params
   * for every slug and no extras.
   */
  it('returns params matching every blog post slug exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
            title: fc.constant('T'),
            excerpt: fc.constant('E'),
            date: fc.constant('2024-01-01'),
            content: fc.constant(''),
            categories: fc.constant([]),
            tags: fc.constant([]),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        async (posts) => {
          vi.mocked(getBlogPosts).mockResolvedValue(posts as never);

          const params = await generateStaticParams();

          const inputSlugs = posts.map((p) => String(p.slug));
          const outputSlugs = params.map((p) => p.slug);

          expect(outputSlugs).toHaveLength(inputSlugs.length);
          expect(outputSlugs).toEqual(expect.arrayContaining(inputSlugs));
          expect(inputSlugs).toEqual(expect.arrayContaining(outputSlugs));
        },
      ),
      { numRuns: 100 },
    );
  });
});
