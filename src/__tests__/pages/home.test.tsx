// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import fc from 'fast-check';
import type { Page, Project, BlogPost } from '@/lib/types';
import type { Slug, IsoDateString, AssetPath } from '@/lib/types/common';

vi.mock('@/lib/content/pages', () => ({ getPageBySlug: vi.fn() }));
vi.mock('@/lib/content/projects', () => ({ getProjects: vi.fn() }));
vi.mock('@/lib/content/blog', () => ({ getBlogPosts: vi.fn() }));
vi.mock('@/lib/content/mdx', () => ({ renderMDX: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getPageBySlug } from '@/lib/content/pages';
import { getProjects } from '@/lib/content/projects';
import { getBlogPosts } from '@/lib/content/blog';
import { renderMDX } from '@/lib/content/mdx';
import HomePage from '@/app/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --- Helpers ---

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    title: 'Home Title',
    slug: 'home' as unknown as Slug,
    content: '# Hello',
    ...overrides,
  } as Page;
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    title: 'Test Project',
    slug: 'test-project' as unknown as Slug,
    description: 'A test project',
    content: '# Project',
    stack: ['TypeScript'],
    categories: ['web'],
    status: 'completed' as const,
    highlight: false,
    ...overrides,
  } as Project;
}

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post' as unknown as Slug,
    excerpt: 'A test excerpt',
    content: '# Post',
    date: '2025-01-15' as unknown as IsoDateString,
    categories: ['dev'],
    tags: ['typescript'],
    ...overrides,
  } as BlogPost;
}

function setupMocks(opts: {
  page?: Page | null;
  projects?: Project[];
  posts?: BlogPost[];
} = {}) {
  vi.mocked(getPageBySlug).mockResolvedValue(opts.page ?? null);
  vi.mocked(getProjects).mockResolvedValue(opts.projects ?? []);
  vi.mocked(getBlogPosts).mockResolvedValue(opts.posts ?? []);
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX content</p>);
}

// --- PBT generators ---

const wordArb = fc.stringMatching(/^[A-Za-z0-9]+$/, {
  minLength: 1,
  maxLength: 20,
});

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

const blogPostArb: fc.Arbitrary<BlogPost> = fc
  .record({
    title: wordArb.map((s) => `Post ${s}`),
    slug: fc
      .stringMatching(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        minLength: 1,
        maxLength: 30,
      })
      .filter((s) => s.length > 0),
    excerpt: wordArb.map((s) => `Excerpt ${s}`),
    content: fc.constant('# Content'),
    date: isoDateArb,
    categories: fc.array(wordArb, { minLength: 1, maxLength: 3 }),
    tags: fc.uniqueArray(wordArb.map((s) => `Tag ${s}`), { minLength: 1, maxLength: 3 }),
    image: fc.option(
      wordArb.map((s) => s as unknown as AssetPath),
      { nil: undefined },
    ),
    relatedProjects: fc.constant(undefined),
    relatedAgents: fc.constant(undefined),
  })
  .map((raw) => ({
    ...raw,
    slug: raw.slug as unknown as Slug,
    date: raw.date as unknown as IsoDateString,
  }));

describe('Home Page', () => {
  // --- P5: Featured projects section contains exactly highlighted projects ---

  describe('P5: Featured projects section', () => {
    it('shows only highlighted projects when some are highlighted', async () => {
      const highlighted = makeProject({
        title: 'Featured One',
        slug: 'featured-one' as unknown as Slug,
        highlight: true,
      });
      const notHighlighted = makeProject({
        title: 'Regular One',
        slug: 'regular-one' as unknown as Slug,
        highlight: false,
      });
      setupMocks({ projects: [highlighted, notHighlighted] });

      const el = await HomePage();
      render(el);

      const featuredHeading = screen.getByRole('heading', { name: 'Featured Projects' });
      const featuredSection = featuredHeading.closest('section')!;
      const scope = within(featuredSection);

      expect(scope.getByText('Featured One')).toBeInTheDocument();
      expect(scope.queryByText('Regular One')).not.toBeInTheDocument();
    });

    it('omits featured section when no projects are highlighted', async () => {
      setupMocks({
        projects: [
          makeProject({ highlight: false, slug: 'a' as unknown as Slug }),
          makeProject({ highlight: false, slug: 'b' as unknown as Slug }),
        ],
      });

      const el = await HomePage();
      render(el);

      expect(screen.queryByRole('heading', { name: 'Featured Projects' })).not.toBeInTheDocument();
    });

    it('shows all projects when all are highlighted', async () => {
      const p1 = makeProject({
        title: 'All Featured A',
        slug: 'all-a' as unknown as Slug,
        highlight: true,
      });
      const p2 = makeProject({
        title: 'All Featured B',
        slug: 'all-b' as unknown as Slug,
        highlight: true,
      });
      setupMocks({ projects: [p1, p2] });

      const el = await HomePage();
      render(el);

      const featuredHeading = screen.getByRole('heading', { name: 'Featured Projects' });
      const featuredSection = featuredHeading.closest('section')!;
      const scope = within(featuredSection);

      expect(scope.getByText('All Featured A')).toBeInTheDocument();
      expect(scope.getByText('All Featured B')).toBeInTheDocument();
    });
  });

  // --- P6 (PBT): Home page latest section contains at most 3 posts ---

  /**
   * Feature: core-content-pages, Property 6: Home page latest section contains at most 3 posts
   * Validates: Requirements 1.5, 1.6
   */
  it('P6: latest posts section contains at most 3 posts for any post list', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(blogPostArb, { minLength: 0, maxLength: 12 }),
        async (posts) => {
          cleanup();
          vi.mocked(getPageBySlug).mockResolvedValue(null);
          vi.mocked(getProjects).mockResolvedValue([]);
          vi.mocked(getBlogPosts).mockResolvedValue(posts);
          vi.mocked(renderMDX).mockResolvedValue(<p>MDX</p>);

          const el = await HomePage();
          const { container } = render(el);

          const expectedCount = Math.min(3, posts.length);

          if (expectedCount === 0) {
            expect(screen.queryByRole('heading', { name: 'Latest Posts' })).not.toBeInTheDocument();
          } else {
            const latestHeading = screen.getByRole('heading', { name: 'Latest Posts' });
            const latestSection = latestHeading.closest('section')!;
            const articles = latestSection.querySelectorAll('article');
            expect(articles.length).toBe(expectedCount);
          }

          cleanup();
        },
      ),
    );
  });

  // --- P7: Content-backed pages display entity title ---

  describe('P7: Home page entity title', () => {
    it('displays entity title as h1 when home entity is present', async () => {
      setupMocks({ page: makePage({ title: 'Welcome to My Site' }) });

      const el = await HomePage();
      render(el);

      expect(
        screen.getByRole('heading', { level: 1, name: 'Welcome to My Site' }),
      ).toBeInTheDocument();
    });

    it('omits value proposition section when home entity is absent', async () => {
      setupMocks({ page: null });

      const el = await HomePage();
      render(el);

      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });
  });

  // --- CTA: link to /contact ---

  it('renders a CTA link to /contact', async () => {
    setupMocks();

    const el = await HomePage();
    render(el);

    const ctaLink = screen.getByRole('link', { name: /get in touch/i });
    expect(ctaLink).toHaveAttribute('href', '/contact');
  });

  // --- Teaser: structural element, no interactive elements ---

  it('renders play mode teaser with no interactive elements', async () => {
    setupMocks();

    const el = await HomePage();
    render(el);

    const teaserText = screen.getByText(/Play View/);
    const teaserSection = teaserText.closest('section')!;

    expect(teaserSection).toBeInTheDocument();
    expect(teaserSection.querySelectorAll('a')).toHaveLength(0);
    expect(teaserSection.querySelectorAll('button')).toHaveLength(0);
  });
});
