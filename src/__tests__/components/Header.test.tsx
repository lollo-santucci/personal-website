// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Header from '@/components/Header';

afterEach(() => {
  cleanup();
});

describe('Header', () => {
  it('renders a <header> landmark element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contains a link to "/" with text "Lorenzo Santucci"', () => {
    render(<Header />);
    const logoLinks = screen.getAllByRole('link', { name: 'Lorenzo Santucci' });
    expect(logoLinks).toHaveLength(1);
    expect(logoLinks[0]).toHaveAttribute('href', '/');
  });
});
