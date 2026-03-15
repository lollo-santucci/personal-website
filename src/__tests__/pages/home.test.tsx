// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/components/LandingMenu', () => ({
  default: () => (
    <nav aria-label="Site navigation">
      <ul>
        <li>About</li>
        <li>Projects</li>
        <li>Agentdex</li>
        <li>Blog</li>
      </ul>
    </nav>
  ),
}));

vi.mock('@/components/TottiSprite', () => ({
  default: () => (
    <div
      role="img"
      aria-label="Totti the companion dog"
      className="pixel-art mx-auto"
    />
  ),
}));

import Home from '@/app/page';

afterEach(() => {
  cleanup();
});

describe('Landing Page (RPG Title Screen)', () => {
  it('renders h1 with "Lorenzo Santucci"', () => {
    render(Home());
    expect(
      screen.getByRole('heading', { level: 1, name: 'Lorenzo Santucci' }),
    ).toBeInTheDocument();
  });

  it('renders subtitle "FULL STACK DEVELOPER & AI ENGINEER"', () => {
    render(Home());
    expect(
      screen.getByText('FULL STACK DEVELOPER & AI ENGINEER'),
    ).toBeInTheDocument();
  });

  it('renders TottiSprite with role="img" and accessible label', () => {
    render(Home());
    const sprite = screen.getByRole('img', {
      name: 'Totti the companion dog',
    });
    expect(sprite).toBeInTheDocument();
  });

  it('renders LandingMenu navigation', () => {
    render(Home());
    expect(
      screen.getByRole('navigation', { name: 'Site navigation' }),
    ).toBeInTheDocument();
  });

  it('does not render a Header with MENU button', () => {
    render(Home());
    expect(
      screen.queryByRole('button', { name: /menu/i }),
    ).not.toBeInTheDocument();
  });

  it('does not render a CTA banner linking to /contact', () => {
    render(Home());
    expect(
      screen.queryByRole('link', { name: /get in touch/i }),
    ).not.toBeInTheDocument();
  });
});
