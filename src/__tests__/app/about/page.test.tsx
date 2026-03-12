// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));

import { getPageBySlug, renderMDX } from '@/lib/content';
import AboutPage from '@/app/about/page';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('About page', () => {
  it('renders page title and MDX content when content exists', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue({
      title: 'About Me',
      slug: 'about' as never,
      content: 'Some MDX content',
      description: 'About description',
    });
    vi.mocked(renderMDX).mockResolvedValue(
      <div data-testid="mdx-content">rendered</div>,
    );

    const element = await AboutPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'About Me' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
    expect(renderMDX).toHaveBeenCalledWith('Some MDX content');
  });

  it('renders fallback "About" heading without crashing when content is null', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);

    const element = await AboutPage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'About' }),
    ).toBeInTheDocument();
    expect(renderMDX).not.toHaveBeenCalled();
  });
});
