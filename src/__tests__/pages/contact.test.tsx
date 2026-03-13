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
import ContactPage, { generateMetadata } from '@/app/contact/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    title: 'Get in Touch',
    slug: 'contact' as unknown as Slug,
    content: '# Contact me',
    ...overrides,
  } as Page;
}

describe('Contact Page', () => {
  // --- P7: Entity title display and fallback ---

  describe('P7: entity title display', () => {
    it('displays entity title when contact entity is present', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(makePage({ title: 'Get in Touch' }));
      vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX content</p>);

      const el = await ContactPage();
      render(el);

      expect(screen.getByRole('heading', { level: 1, name: 'Get in Touch' })).toBeInTheDocument();
    });

    it('displays "Contact" fallback when entity is absent', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(null);

      const el = await ContactPage();
      render(el);

      expect(screen.getByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument();
    });
  });

  // --- Metadata ---

  describe('generateMetadata', () => {
    it('returns entity title and description when entity is present', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(
        makePage({ title: 'Get in Touch', description: 'Contact Lorenzo for work' }),
      );

      const meta = await generateMetadata();

      expect(meta.title).toBe('Get in Touch');
      expect(meta.description).toBe('Contact Lorenzo for work');
    });

    it('returns fallback title "Contact" and no description when entity is absent', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(null);

      const meta = await generateMetadata();

      expect(meta.title).toBe('Contact');
      expect(meta).not.toHaveProperty('description');
    });

    it('returns entity title without description when entity has no description', async () => {
      vi.mocked(getPageBySlug).mockResolvedValue(makePage({ title: 'Contact Me' }));

      const meta = await generateMetadata();

      expect(meta.title).toBe('Contact Me');
      expect(meta).not.toHaveProperty('description');
    });
  });
});
