// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Page } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getPageBySlug, renderMDX } from '@/lib/content';
import AboutPage, { generateMetadata } from '@/app/about/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    title: 'About Lorenzo',
    slug: 'about' as unknown as Slug,
    content: '# About me',
    ...overrides,
  } as Page;
}

describe('About Page', () => {
  // --- P7: Entity title display and fallback ---

  describe('P7: entity title display', () => {
    it('displays entity title when about entity is present', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(makePage({ title: 'About Lorenzo' }));
      vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX content</p>);

      const el = await AboutPage();
      render(el);

      expect(screen.getByRole('heading', { level: 1, name: 'About Lorenzo' })).toBeInTheDocument();
    });

    it('displays "About" fallback when entity is absent', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(null);

      const el = await AboutPage();
      render(el);

      expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
    });
  });

  // --- Metadata ---

  describe('generateMetadata', () => {
    it('returns entity title and description when entity is present', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(
        makePage({ title: 'About Lorenzo', description: 'Background and skills' }),
      );

      const meta = await generateMetadata();

      expect(meta.title).toBe('About Lorenzo');
      expect(meta.description).toBe('Background and skills');
    });

    it('returns fallback title "About" and no description when entity is absent', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(null);

      const meta = await generateMetadata();

      expect(meta.title).toBe('About');
      expect(meta).not.toHaveProperty('description');
    });

    it('returns entity title without description when entity has no description', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(makePage({ title: 'My About Page' }));

      const meta = await generateMetadata();

      expect(meta.title).toBe('My About Page');
      expect(meta).not.toHaveProperty('description');
    });
  });
});
