/**
 * Integration tests for the Page content loader.
 *
 * - Property 2 (MDX parsing round trip) for Page type
 * - Property 4 (non-existent slug returns null)
 * - Fail-fast on first invalid file (R6.10)
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getPages, getPageBySlug } from '../pages';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(
    tmpdir(),
    `pages-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(base, { recursive: true });
  return base;
}

/** Tracked temp dirs for cleanup. */
const tempDirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

/** Helper: set process.cwd() to a temp root and create content/pages/ inside it. */
async function setupTempPages(): Promise<string> {
  const root = await makeTempDir();
  tempDirs.push(root);
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  await mkdir(join(root, 'content', 'pages'), { recursive: true });
  return root;
}

/** Write a valid Page MDX file to the temp directory. */
async function writePageFile(
  root: string,
  slug: string,
  fields: { title: string; description?: string },
  body: string,
): Promise<void> {
  const lines = [`title: "${fields.title}"`, `slug: ${slug}`];
  if (fields.description) {
    lines.push(`description: "${fields.description}"`);
  }
  const content = `---\n${lines.join('\n')}\n---\n${body}`;
  await writeFile(join(root, 'content', 'pages', `${slug}.mdx`), content);
}

describe('Property 2: MDX parsing round trip — Page', () => {
  /**
   * **Validates: Requirements 2.3, 2.4, 2.6**
   *
   * For any valid MDX file with well-formed frontmatter containing all required
   * fields for Page, parsing the file and retrieving it by slug SHALL return a
   * typed object where each frontmatter field matches the original value and the
   * `content` field equals the raw MDX body string after frontmatter.
   */

  it('round-trips a minimal Page (title + slug + body)', async () => {
    const root = await setupTempPages();

    await writePageFile(root, 'about', { title: 'About' }, 'This is the about page content.');

    const pages = await getPages();
    expect(pages).toHaveLength(1);

    const page = pages[0]!;
    expect(page.title).toBe('About');
    expect(String(page.slug)).toBe('about');
    expect(page.content.trim()).toBe('This is the about page content.');
  });

  it('round-trips a Page with optional description field', async () => {
    const root = await setupTempPages();

    await writePageFile(
      root,
      'contact',
      { title: 'Contact', description: 'Get in touch' },
      'Contact page body here.',
    );

    const page = await getPageBySlug('contact');
    expect(page).not.toBeNull();
    expect(page!.title).toBe('Contact');
    expect(String(page!.slug)).toBe('contact');
    expect(page!.description).toBe('Get in touch');
    expect(page!.content.trim()).toBe('Contact page body here.');
  });

  it('round-trips multiple Pages and returns all of them', async () => {
    const root = await setupTempPages();

    await writePageFile(root, 'about', { title: 'About' }, 'About body.');
    await writePageFile(root, 'contact', { title: 'Contact' }, 'Contact body.');
    await writePageFile(root, 'services', { title: 'Services' }, 'Services body.');

    const pages = await getPages();
    expect(pages).toHaveLength(3);

    // Verify sorted by title ascending
    expect(pages.map((p) => p.title)).toEqual(['About', 'Contact', 'Services']);

    // Verify each page's content field
    for (const page of pages) {
      expect(page.content.trim()).toBeTruthy();
    }
  });

  it('getPageBySlug returns the correct page with matching fields', async () => {
    const root = await setupTempPages();

    await writePageFile(root, 'about', { title: 'About Me' }, 'My about page.');
    await writePageFile(root, 'contact', { title: 'Contact' }, 'Contact info.');

    const page = await getPageBySlug('about');
    expect(page).not.toBeNull();
    expect(page!.title).toBe('About Me');
    expect(String(page!.slug)).toBe('about');
    expect(page!.content.trim()).toBe('My about page.');
  });
});


describe('Property 4: Non-existent slug returns null', () => {
  /**
   * **Validates: Requirements 2.5, 4.4, 12.3**
   *
   * For any slug string that does not correspond to an existing content file
   * (including when the content directory itself does not exist), the by-slug
   * function SHALL return null.
   */

  it('returns null for random slugs on an empty directory', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z][a-z0-9-]*$/),
        async (slug) => {
          const root = await makeTempDir();
          tempDirs.push(root);
          vi.spyOn(process, 'cwd').mockReturnValue(root);
          await mkdir(join(root, 'content', 'pages'), { recursive: true });

          const result = await getPageBySlug(slug);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns null for random slugs when directory does not exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z][a-z0-9-]*$/),
        async (slug) => {
          const root = await makeTempDir();
          tempDirs.push(root);
          vi.spyOn(process, 'cwd').mockReturnValue(root);
          // Do NOT create content/pages/ — directory missing

          const result = await getPageBySlug(slug);
          expect(result).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Fail-fast on first invalid file (R6.10)', () => {
  /**
   * **Validates: Requirements 6.10**
   *
   * When a list function encounters an invalid file, the Content_Loader SHALL
   * fail fast on the first error (no partial results returned).
   */

  it('throws on first invalid file — no partial results', async () => {
    const root = await setupTempPages();

    // File 1: valid
    await writePageFile(root, 'aaa-valid', { title: 'Valid Page' }, 'Valid body.');

    // File 2: invalid — missing required field "title"
    const invalidContent = `---\nslug: bbb-invalid\n---\nBody without title.`;
    await writeFile(
      join(root, 'content', 'pages', 'bbb-invalid.mdx'),
      invalidContent,
    );

    // File 3: valid
    await writePageFile(root, 'ccc-also-valid', { title: 'Also Valid' }, 'Also valid body.');

    await expect(getPages()).rejects.toThrow(
      /Content validation error: .+ is missing required field "title"/,
    );
  });

  it('throws on slug mismatch — no partial results', async () => {
    const root = await setupTempPages();

    // File 1: valid
    await writePageFile(root, 'alpha', { title: 'Alpha' }, 'Alpha body.');

    // File 2: slug mismatch (filename is "beta" but declared slug is "gamma")
    const mismatchContent = `---\ntitle: Beta\nslug: gamma\n---\nMismatch body.`;
    await writeFile(
      join(root, 'content', 'pages', 'beta.mdx'),
      mismatchContent,
    );

    await expect(getPages()).rejects.toThrow(
      /Content validation error: .+ declared slug "gamma" does not match filename-derived slug "beta"/,
    );
  });
});
