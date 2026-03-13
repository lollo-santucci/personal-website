// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import type { BlogPost } from '@/lib/types';
import type { Slug, IsoDateString, AssetPath } from '@/lib/types/common';
import BlogPostCard from '@/components/BlogPostCard';
import { formatDate } from '@/lib/format';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/**
 * Alphanumeric-only generators with unique prefixes per field type.
 * Prefixes avoid text collisions in DOM queries.
 */
const wordArb = fc.stringMatching(/^[A-Za-z0-9]+$/, {
  minLength: 1,
  maxLength: 20,
});

const titleArb = wordArb.map((s) => `Title ${s}`);
const excerptArb = wordArb.map((s) => `Excerpt ${s}`);
const tagArb = wordArb.map((s) => `Tag ${s}`);

/** Unique non-empty tag array to avoid duplicate key issues. */
const uniqueTagsArb = fc.uniqueArray(tagArb, { minLength: 1, maxLength: 8 });

/**
 * ISO date generator from integer components (year/month/day).
 * Avoids fc.date() which can produce invalid Date objects in fast-check v4.
 */
const isoDateArb = fc
  .tuple(
    fc.integer({ min: 2000, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(([y, m, d]) => {
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  });

/** Arbitrary for a valid BlogPost entity. */
const blogPostArb: fc.Arbitrary<BlogPost> = fc
  .record({
    title: titleArb,
    slug: fc
      .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        minLength: 1,
        maxLength: 40,
      })
      .filter((s) => s.length > 0),
    excerpt: excerptArb,
    content: fc.string({ minLength: 1, maxLength: 100 }),
    date: isoDateArb,
    categories: fc.array(wordArb, { minLength: 1, maxLength: 5 }),
    tags: uniqueTagsArb,
    image: fc.option(
      wordArb.map((s) => s as unknown as AssetPath),
      { nil: undefined },
    ),
    relatedProjects: fc.option(
      fc.array(
        fc
          .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
            minLength: 1,
            maxLength: 20,
          })
          .filter((s) => s.length > 0)
          .map((s) => s as unknown as Slug),
        { minLength: 0, maxLength: 3 },
      ),
      { nil: undefined },
    ),
    relatedAgents: fc.option(
      fc.array(
        fc
          .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
            minLength: 1,
            maxLength: 20,
          })
          .filter((s) => s.length > 0)
          .map((s) => s as unknown as Slug),
        { minLength: 0, maxLength: 3 },
      ),
      { nil: undefined },
    ),
  })
  .map((raw) => ({
    ...raw,
    slug: raw.slug as unknown as Slug,
    date: raw.date as unknown as IsoDateString,
  }));

describe('BlogPostCard', () => {
  /**
   * Feature: core-content-pages, Property 3: BlogPostCard renders all required fields and correct link
   * Validates: Requirements 8.2, 5.2, 5.3, 1.10
   */
  it('renders all required fields and correct link for any valid BlogPost', () => {
    fc.assert(
      fc.property(blogPostArb, (post) => {
        cleanup();
        const { container } = render(<BlogPostCard post={post} />);
        const article = container.querySelector('article')!;
        const scope = within(article);

        // Title is rendered inside a link with correct href
        const link = scope.getByRole('link');
        expect(link.textContent).toBe(post.title);
        expect(link).toHaveAttribute('href', `/blog/${post.slug}`);

        // Excerpt is rendered
        expect(scope.getByText(post.excerpt)).toBeInTheDocument();

        // Formatted date is rendered
        const expectedDate = formatDate(post.date);
        expect(scope.getByText(expectedDate)).toBeInTheDocument();

        // Each tag is rendered
        for (const tag of post.tags) {
          expect(scope.getByText(tag)).toBeInTheDocument();
        }

        cleanup();
      }),
    );
  });
});
