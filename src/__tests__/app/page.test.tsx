// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Home from '@/app/page';

afterEach(() => {
  cleanup();
});

describe('Home page', () => {
  it('renders heading "Lorenzo Santucci"', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lorenzo Santucci' }),
    ).toBeInTheDocument();
  });

  it('renders intro text containing "Full-stack developer and ML/AI engineer"', () => {
    render(<Home />);
    expect(
      screen.getByText('Full-stack developer and ML/AI engineer.'),
    ).toBeInTheDocument();
  });

  it('renders 3 section link cards: Projects, Blog, Office', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Projects/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Blog/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Office/ })).toBeInTheDocument();
  });

  it('each card has the correct href', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Projects/ })).toHaveAttribute(
      'href',
      '/projects',
    );
    expect(screen.getByRole('link', { name: /Blog/ })).toHaveAttribute(
      'href',
      '/blog',
    );
    expect(screen.getByRole('link', { name: /Office/ })).toHaveAttribute(
      'href',
      '/office',
    );
  });
});
