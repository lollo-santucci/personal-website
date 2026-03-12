import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { NAV_LINKS, isActiveLink } from '@/lib/navigation';

describe('NAV_LINKS', () => {
  it('has exactly 6 entries', () => {
    expect(NAV_LINKS).toHaveLength(6);
  });

  it('contains the correct hrefs and labels in order', () => {
    const expected = [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/projects', label: 'Projects' },
      { href: '/blog', label: 'Blog' },
      { href: '/office', label: 'Office' },
      { href: '/contact', label: 'Contact' },
    ];
    expect(NAV_LINKS).toEqual(expected);
  });
});

describe('isActiveLink', () => {
  describe('home link (/)', () => {
    it('returns true for exact match "/"', () => {
      expect(isActiveLink('/', '/')).toBe(true);
    });

    it('returns false for "/about"', () => {
      expect(isActiveLink('/', '/about')).toBe(false);
    });

    it('returns false for "/projects"', () => {
      expect(isActiveLink('/', '/projects')).toBe(false);
    });

    it('returns false for "/projects/foo"', () => {
      expect(isActiveLink('/', '/projects/foo')).toBe(false);
    });
  });

  describe('non-root hrefs — exact match', () => {
    it('returns true when pathname equals href', () => {
      expect(isActiveLink('/projects', '/projects')).toBe(true);
      expect(isActiveLink('/blog', '/blog')).toBe(true);
      expect(isActiveLink('/office', '/office')).toBe(true);
    });
  });

  describe('non-root hrefs — prefix match', () => {
    it('returns true when pathname starts with href + "/"', () => {
      expect(isActiveLink('/projects', '/projects/foo')).toBe(true);
      expect(isActiveLink('/blog', '/blog/my-post')).toBe(true);
      expect(isActiveLink('/office', '/office/sales-agent')).toBe(true);
    });

    it('returns true for deeply nested sub-paths', () => {
      expect(isActiveLink('/projects', '/projects/foo/bar/baz')).toBe(true);
    });
  });

  describe('no false positives', () => {
    it('returns false for unrelated paths', () => {
      expect(isActiveLink('/blog', '/about')).toBe(false);
      expect(isActiveLink('/projects', '/contact')).toBe(false);
      expect(isActiveLink('/office', '/blog')).toBe(false);
    });

    it('returns false for partial prefix without slash boundary', () => {
      expect(isActiveLink('/blog', '/blogger')).toBe(false);
      expect(isActiveLink('/blog', '/blogging')).toBe(false);
      expect(isActiveLink('/about', '/about-me')).toBe(false);
    });
  });
});

/**
 * Property-based tests for isActiveLink
 * Validates: Requirements 3.3, 3.4, 3.5
 */
describe('isActiveLink — Property 1: Active link detection correctness', () => {
  const hrefArb = fc.oneof(
    fc.constant('/'),
    fc.stringMatching(/^\/[a-z]+$/),
  );

  const pathnameFromHref = (href: string) =>
    fc.oneof(
      // Exact match
      fc.constant(href),
      // Prefix match (href + '/' + suffix) — only meaningful for non-root
      fc.stringMatching(/^[a-z][a-z0-9-]*$/).map((suffix) => `${href}/${suffix}`),
      // Unrelated path
      fc.stringMatching(/^\/[a-z]+$/).filter((p) => p !== href && !p.startsWith(href + '/')),
    );

  it('returns true iff href=/ and pathname=/, or href≠/ and pathname matches exactly or as prefix', () => {
    fc.assert(
      fc.property(
        hrefArb.chain((href) =>
          pathnameFromHref(href).map((pathname) => ({ href, pathname })),
        ),
        ({ href, pathname }) => {
          const result = isActiveLink(href, pathname);

          let expected: boolean;
          if (href === '/') {
            expected = pathname === '/';
          } else {
            expected = pathname === href || pathname.startsWith(href + '/');
          }

          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});
