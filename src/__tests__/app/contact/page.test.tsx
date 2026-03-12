// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));

import { getPageBySlug, renderMDX } from '@/lib/content';
import ContactPage from '@/app/contact/page';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Contact page', () => {
  it('renders page title and MDX content when content exists', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue({
      title: 'Get in Touch',
      slug: 'contact' as never,
      content: 'Contact MDX content',
      description: 'Contact description',
    });
    vi.mocked(renderMDX).mockResolvedValue(
      <div data-testid="mdx-content">rendered</div>,
    );

    const element = await ContactPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Get in Touch' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
    expect(renderMDX).toHaveBeenCalledWith('Contact MDX content');
  });

  it('renders fallback "Contact" heading without crashing when content is null', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);

    const element = await ContactPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Contact' }),
    ).toBeInTheDocument();
    expect(renderMDX).not.toHaveBeenCalled();
  });
});
