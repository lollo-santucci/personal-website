/**
 * Integration tests for the Service content loader.
 *
 * Property 2 (MDX parsing round trip) for Service type.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getServices, getServiceBySlug } from '../services';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(
    tmpdir(),
    `services-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

/** Helper: set process.cwd() to a temp root and create content/services/ inside it. */
async function setupTempServices(): Promise<string> {
  const root = await makeTempDir();
  tempDirs.push(root);
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  await mkdir(join(root, 'content', 'services'), { recursive: true });
  return root;
}

/** Write a valid Service MDX file to the temp directory. */
async function writeServiceFile(
  root: string,
  slug: string,
  fields: {
    title: string;
    description: string;
    order?: number;
    relatedProjects?: string[];
  },
  body: string,
): Promise<void> {
  const lines = [
    `title: "${fields.title}"`,
    `slug: ${slug}`,
    `description: "${fields.description}"`,
  ];
  if (fields.order !== undefined) {
    lines.push(`order: ${fields.order}`);
  }
  if (fields.relatedProjects) {
    lines.push(`relatedProjects:`);
    for (const rp of fields.relatedProjects) {
      lines.push(`  - ${rp}`);
    }
  }
  const content = `---\n${lines.join('\n')}\n---\n${body}`;
  await writeFile(join(root, 'content', 'services', `${slug}.mdx`), content);
}

describe('Property 2: MDX parsing round trip — Service', () => {
  /**
   * **Validates: Requirements 2.3, 2.4, 2.6**
   *
   * For any valid MDX file with well-formed frontmatter containing all required
   * fields for Service, parsing the file and retrieving it by slug SHALL return
   * a typed object where each frontmatter field matches the original value and
   * the `content` field equals the raw MDX body string after frontmatter.
   */

  it('round-trips a Service with all required fields', async () => {
    const root = await setupTempServices();

    await writeServiceFile(
      root,
      'web-development',
      {
        title: 'Web Development',
        description: 'Full-stack web development',
      },
      'Service description here.',
    );

    const services = await getServices();
    expect(services).toHaveLength(1);

    const service = services[0]!;
    expect(service.title).toBe('Web Development');
    expect(String(service.slug)).toBe('web-development');
    expect(service.description).toBe('Full-stack web development');
    expect(service.content.trim()).toBe('Service description here.');
  });

  it('round-trips a Service with optional order and relatedProjects', async () => {
    const root = await setupTempServices();

    await writeServiceFile(
      root,
      'ai-consulting',
      {
        title: 'AI Consulting',
        description: 'ML and AI consulting services',
        order: 1,
        relatedProjects: ['my-project', 'other-project'],
      },
      'AI consulting body.',
    );

    const service = await getServiceBySlug('ai-consulting');
    expect(service).not.toBeNull();
    expect(service!.title).toBe('AI Consulting');
    expect(service!.order).toBe(1);
    expect(service!.relatedProjects?.map(String)).toEqual([
      'my-project',
      'other-project',
    ]);
    expect(service!.content.trim()).toBe('AI consulting body.');
  });

  it('round-trips multiple Services sorted by order then title', async () => {
    const root = await setupTempServices();

    await writeServiceFile(
      root,
      'zeta-service',
      {
        title: 'Zeta Service',
        description: 'Last alphabetically but first by order',
        order: 0,
      },
      'Zeta body.',
    );

    await writeServiceFile(
      root,
      'alpha-service',
      {
        title: 'Alpha Service',
        description: 'First alphabetically, no order',
      },
      'Alpha body.',
    );

    const services = await getServices();
    expect(services).toHaveLength(2);
    // order 0 before undefined
    expect(services[0]!.title).toBe('Zeta Service');
    expect(services[1]!.title).toBe('Alpha Service');
  });
});
