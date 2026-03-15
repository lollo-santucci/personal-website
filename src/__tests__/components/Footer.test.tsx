// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Footer from '@/components/Footer';

afterEach(() => {
  cleanup();
});

describe('Footer', () => {
  it('renders a <footer> landmark element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('contains copyright text with current year and "Lorenzo Santucci"', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© Lorenzo Santucci ${year}`))).toBeInTheDocument();
  });

  it('contains a GitHub link with correct href and aria-label', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/lollo-santucci');
  });

  it('contains a LinkedIn link with correct href and aria-label', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/lorenzosantucci');
  });

  it('social links open in new tab with noopener noreferrer', () => {
    render(<Footer />);
    const github = screen.getByRole('link', { name: 'GitHub' });
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    for (const link of [github, linkedin]) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('social icon links have minimum 44×44px touch target', () => {
    render(<Footer />);
    const github = screen.getByRole('link', { name: 'GitHub' });
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });
    for (const link of [github, linkedin]) {
      expect(link.className).toMatch(/min-h-\[44px\]/);
      expect(link.className).toMatch(/min-w-\[44px\]/);
    }
  });

  it('contains a contact CTA linking to /contact', () => {
    render(<Footer />);
    const cta = screen.getByRole('link', { name: /contact me/i });
    expect(cta).toHaveAttribute('href', '/contact');
  });
});
