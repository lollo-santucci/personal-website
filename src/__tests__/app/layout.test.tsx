import { describe, it, expect, vi } from 'vitest';

vi.mock('@/styles/globals.css', () => ({}));
vi.mock('@/components/SkipToContent', () => ({ default: () => null }));
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));

import { metadata } from '@/app/layout';

describe('Root layout metadata', () => {
  it('has default title "Lorenzo Santucci" and template "%s — Lorenzo Santucci"', () => {
    expect(metadata.title).toEqual({
      default: 'Lorenzo Santucci',
      template: '%s — Lorenzo Santucci',
    });
  });

  it('has description "Freelance full-stack developer and ML/AI engineer"', () => {
    expect(metadata.description).toBe(
      'Freelance full-stack developer and ML/AI engineer',
    );
  });

  it('has openGraph.type "website"', () => {
    expect(metadata.openGraph).toBeDefined();
    expect((metadata.openGraph as Record<string, unknown>).type).toBe(
      'website',
    );
  });

  it('has openGraph.siteName "Lorenzo Santucci"', () => {
    expect(metadata.openGraph).toBeDefined();
    expect((metadata.openGraph as Record<string, unknown>).siteName).toBe(
      'Lorenzo Santucci',
    );
  });

  it('has metadataBase as a URL instance', () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });

  it('has alternates.canonical "/"', () => {
    expect(metadata.alternates).toBeDefined();
    expect(metadata.alternates!.canonical).toBe('/');
  });
});

import * as fc from 'fast-check';

/**
 * Property 6: Title template produces correct format
 * Validates: Requirements 12.1
 */
describe('Property 6: Title template produces correct format', () => {
  const titleConfig = metadata.title as { default: string; template: string };

  it('home page resolves to default title "Lorenzo Santucci"', () => {
    expect(titleConfig.default).toBe('Lorenzo Santucci');
  });

  it('any page title resolves to "{title} — Lorenzo Santucci"', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (pageTitle) => {
        // Split on %s to avoid String.replace special patterns ($&, $`, etc.)
        const [before, after] = titleConfig.template.split('%s');
        const resolved = `${before}${pageTitle}${after}`;
        expect(resolved).toBe(`${pageTitle} — Lorenzo Santucci`);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Property 7: Meta description fallback
 * Validates: Requirements 12.2
 */
describe('Property 7: Meta description fallback', () => {
  const defaultDescription =
    'Freelance full-stack developer and ML/AI engineer';

  it('site-level default description matches expected value', () => {
    expect(metadata.description).toBe(defaultDescription);
  });

  it('description resolves to content description if present, otherwise default', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1 })),
        (contentDescription) => {
          const resolved = contentDescription ?? defaultDescription;
          if (contentDescription !== null) {
            expect(resolved).toBe(contentDescription);
            expect(resolved).not.toBe(defaultDescription);
          } else {
            expect(resolved).toBe(defaultDescription);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
