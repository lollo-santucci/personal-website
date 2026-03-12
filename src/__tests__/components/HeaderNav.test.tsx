// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as fc from 'fast-check';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import HeaderNav from '@/components/HeaderNav';

afterEach(() => {
  cleanup();
});

describe('HeaderNav', () => {
  it('renders a <nav> element with aria-label="Main navigation"', () => {
    render(<HeaderNav />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders all 6 navigation links in the desktop nav', () => {
    render(<HeaderNav />);
    const expectedLabels = ['Home', 'About', 'Projects', 'Blog', 'Office', 'Contact'];
    for (const label of expectedLabels) {
      const links = screen.getAllByRole('link', { name: label });
      // Desktop nav renders links; mobile menu is hidden initially so only desktop set exists
      expect(links.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders Play Mode placeholder as an inert <span> with aria-disabled="true"', () => {
    render(<HeaderNav />);
    // Desktop nav has one, mobile menu is hidden so only one visible
    const spans = screen.getAllByText('Play Mode');
    expect(spans.length).toBeGreaterThanOrEqual(1);
    const span = spans[0];
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders hamburger toggle button with aria-label="Toggle navigation"', () => {
    render(<HeaderNav />);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toBeInTheDocument();
  });

  it('hamburger toggle starts with aria-expanded="false"', () => {
    render(<HeaderNav />);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking hamburger toggle sets aria-expanded="true" and reveals mobile menu links', () => {
    render(<HeaderNav />);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // After opening, mobile menu adds a second set of links
    const homeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinks.length).toBe(2); // desktop + mobile
  });

  it('clicking hamburger toggle again hides the mobile menu', () => {
    render(<HeaderNav />);
    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });

    // Open
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const homeLinksOpen = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinksOpen.length).toBe(2);

    // Close
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const homeLinksClosed = screen.getAllByRole('link', { name: 'Home' });
    expect(homeLinksClosed.length).toBe(1); // only desktop set remains
  });
});


/**
 * Property 2: Exactly one active link per pathname
 * **Validates: Requirements 3.1, 3.2**
 *
 * For any pathname that matches at least one NAV_LINKS entry, exactly one link
 * in the rendered navigation should have aria-current="page".
 * For any pathname that matches no NAV_LINKS entry, zero links should have
 * aria-current="page".
 */
describe('Property 2: Exactly one active link per pathname', () => {
  const nonNavSegments = ['dashboard', 'settings', 'profile', 'admin', 'api', 'login'];

  // Arbitrary for sub-path segments (lowercase alpha, 1-12 chars)
  const subPathArb = fc.stringMatching(/^[a-z]{1,12}$/);

  // Generator for pathnames that MATCH a NAV_LINKS entry
  const matchingPathnameArb = fc.oneof(
    // Exact match: pick a random NAV_LINKS href
    fc.constantFrom(...NAV_LINKS.map((l) => l.href)),
    // Sub-path match: pick a non-home href and append a sub-path
    fc.tuple(
      fc.constantFrom(...NAV_LINKS.filter((l) => l.href !== '/').map((l) => l.href)),
      subPathArb,
    ).map(([href, sub]) => `${href}/${sub}`),
  );

  // Generator for pathnames that DON'T match any NAV_LINKS entry
  const nonMatchingPathnameArb = fc.oneof(
    // A top-level path that isn't any NAV_LINKS href
    fc.constantFrom(...nonNavSegments).map((seg) => `/${seg}`),
    // A sub-path under a non-nav segment
    fc.tuple(
      fc.constantFrom(...nonNavSegments),
      subPathArb,
    ).map(([seg, sub]) => `/${seg}/${sub}`),
  );

  it('renders exactly 1 aria-current="page" for matching pathnames', () => {
    fc.assert(
      fc.property(matchingPathnameArb, (pathname) => {
        vi.mocked(usePathname).mockReturnValue(pathname);
        render(<HeaderNav />);

        const activeElements = document.querySelectorAll('[aria-current="page"]');
        expect(activeElements.length).toBe(1);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });

  it('renders 0 aria-current="page" for non-matching pathnames', () => {
    fc.assert(
      fc.property(nonMatchingPathnameArb, (pathname) => {
        vi.mocked(usePathname).mockReturnValue(pathname);
        render(<HeaderNav />);

        const activeElements = document.querySelectorAll('[aria-current="page"]');
        expect(activeElements.length).toBe(0);

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
