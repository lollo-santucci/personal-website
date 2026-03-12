/**
 * Integration tests for the BlogPost content loader.
 *
 * Property 2 (MDX parsing round trip) for BlogPost type.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getBlogPosts, getBlogPostBySlug } from '../blog';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(
    tmpdir(),
    `blog-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

/** Helper: set process.cwd() to a temp root and create content/blog/ inside it. */
async function setupTempBlog(): Promise<string> {
  const root = await makeTempDir();
  tempDirs.push(root);
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  await mkdir(join(root, 'content', 'blog'), { recursive: true });
  return root;
}

/** Write a valid BlogPost MDX file to the temp directory. */
async function writeBlogFile(
  root: string,
  slug: string,
  fields: {
    title: string;
    excerpt: string;
    date: string;
    categories: string[];
    tags: string[];
    image?: string;
    relatedProjects?: string[];
    relatedAgents?: string[];
  },
  body: string,
): Promise<void> {
  const lines = [
    `title: "${fields.title}"`,
    `slug: ${slug}`,
    `excerpt: "${fields.excerpt}"`,
    `date: "${fields.date}"`,
    `categories:`,
    ...fields.categories.map((c) => `  - ${c}`),
    `tags:`,
    ...fields.tags.map((t) => `  - ${t}`),
  ];
  if (fields.image) {
    lines.push(`image: ${fields.image}`);
  }
  if (fields.relatedProjects) {
    lines.push(`relatedProjects:`);
    for (const rp of fields.relatedProjects) {
      lines.push(`  - ${rp}`);
    }
  }
  if (fields.relatedAgents) {
    lines.push(`relatedAgents:`);
    for (const ra of fields.relatedAgents) {
      lines.push(`  - ${ra}`);
    }
  }
  const content = `---\n${lines.join('\n')}\n---\n${body}`;
  await writeFile(join(root, 'content', 'blog', `${slug}.mdx`), content);
}

describe('Property 2: MDX parsing round trip — BlogPost', () => {
  /**
   * **Validates: Requirements 2.3, 2.4, 2.6**
   *
   * For any valid MDX file with well-formed frontmatter containing all required
   * fields for BlogPost, parsing the file and retrieving it by slug SHALL return
   * a typed object where each frontmatter field matches the original value and
   * the `content` field equals the raw MDX body string after frontmatter.
   */

  it('round-trips a BlogPost with all required fields', async () => {
    const root = await setupTempBlog();

    await writeBlogFile(
      root,
      'hello-world',
      {
        title: 'Hello World',
        excerpt: 'My first post',
        date: '2025-01-15',
        categories: ['dev'],
        tags: ['typescript'],
      },
      'Blog post content here.',
    );

    const posts = await getBlogPosts();
    expect(posts).toHaveLength(1);

    const post = posts[0]!;
    expect(post.title).toBe('Hello World');
    expect(String(post.slug)).toBe('hello-world');
    expect(post.excerpt).toBe('My first post');
    expect(String(post.date)).toBe('2025-01-15');
    expect(post.categories).toEqual(['dev']);
    expect(post.tags).toEqual(['typescript']);
    expect(post.content.trim()).toBe('Blog post content here.');
  });

  it('round-trips a BlogPost with optional fields (image, relatedProjects, relatedAgents)', async () => {
    const root = await setupTempBlog();

    await writeBlogFile(
      root,
      'advanced-post',
      {
        title: 'Advanced Post',
        excerpt: 'Deep dive',
        date: '2025-06-01',
        categories: ['tutorial', 'ai'],
        tags: ['python', 'ml'],
        image: '/assets/blog/advanced.png',
        relatedProjects: ['my-project'],
        relatedAgents: ['sales-agent'],
      },
      'Advanced blog post body.',
    );

    const post = await getBlogPostBySlug('advanced-post');
    expect(post).not.toBeNull();
    expect(post!.title).toBe('Advanced Post');
    expect(String(post!.image)).toBe('/assets/blog/advanced.png');
    expect(post!.relatedProjects?.map(String)).toEqual(['my-project']);
    expect(post!.relatedAgents?.map(String)).toEqual(['sales-agent']);
    expect(post!.content.trim()).toBe('Advanced blog post body.');
  });

  it('round-trips multiple BlogPosts sorted by date descending then title ascending', async () => {
    const root = await setupTempBlog();

    await writeBlogFile(
      root,
      'older-post',
      {
        title: 'Older Post',
        excerpt: 'Old',
        date: '2025-01-01',
        categories: ['dev'],
        tags: ['js'],
      },
      'Older body.',
    );

    await writeBlogFile(
      root,
      'newer-post',
      {
        title: 'Newer Post',
        excerpt: 'New',
        date: '2025-06-15',
        categories: ['dev'],
        tags: ['ts'],
      },
      'Newer body.',
    );

    const posts = await getBlogPosts();
    expect(posts).toHaveLength(2);
    // Newest first
    expect(posts[0]!.title).toBe('Newer Post');
    expect(posts[1]!.title).toBe('Older Post');
  });
});
