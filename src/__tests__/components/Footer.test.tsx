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
    expect(screen.getByText(`© ${year} Lorenzo Santucci`)).toBeInTheDocument();
  });

  it('contains a GitHub link with correct href', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/lorenzosantucci');
  });

  it('contains a LinkedIn link with correct href', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/lorenzosantucci');
  });

  it('external links have target="_blank" and rel="noopener noreferrer"', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });
});
