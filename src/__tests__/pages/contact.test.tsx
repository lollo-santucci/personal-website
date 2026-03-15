// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Page } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  renderMDX: vi.fn(),
  getBlogPosts: vi.fn(),
  getProjects: vi.fn(),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));
vi.mock('@/components/ui/Prose', () => ({
  default: ({ children }: any) => <div data-testid="prose">{children}</div>,
}));

import { getPageBySlug, renderMDX, getBlogPosts, getProjects } from '@/lib/content';
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

function setupMocks(page: Page | null = makePage()) {
  vi.mocked(getPageBySlug).mockResolvedValue(page);
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX content</p>);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('Contact Page', () => {
  it('displays entity title when contact entity is present', async () => {
    setupMocks(makePage({ title: 'Get in Touch' }));
    const el = await ContactPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Get in Touch' })).toBeInTheDocument();
  });

  it('displays "Contact" fallback when entity is absent', async () => {
    setupMocks(null);
    const el = await ContactPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Contact' })).toBeInTheDocument();
  });

  it('renders MDX content via Prose when entity exists', async () => {
    setupMocks();
    const el = await ContactPage();
    render(el);
    expect(screen.getByTestId('prose')).toBeInTheDocument();
  });
});

describe('Contact Page generateMetadata', () => {
  it('returns entity title and description when entity is present', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(
      makePage({ title: 'Get in Touch', description: 'Contact Lorenzo for work' }),
    );
    const meta = await generateMetadata();
    expect(meta.title).toBe('Get in Touch');
    expect(meta.description).toBe('Contact Lorenzo for work');
  });

  it('returns fallback title "Contact" when entity is absent', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);
    const meta = await generateMetadata();
    expect(meta.title).toBe('Contact');
  });

  it('includes canonical URL', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);
    const meta = await generateMetadata();
    expect(meta.alternates?.canonical).toBe('/contact');
  });
});
