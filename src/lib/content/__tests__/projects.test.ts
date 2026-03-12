/**
 * Integration tests for the Project content loader.
 *
 * Property 2 (MDX parsing round trip) for Project type.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getProjects, getProjectBySlug } from '../projects';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(
    tmpdir(),
    `projects-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

/** Helper: set process.cwd() to a temp root and create content/projects/ inside it. */
async function setupTempProjects(): Promise<string> {
  const root = await makeTempDir();
  tempDirs.push(root);
  vi.spyOn(process, 'cwd').mockReturnValue(root);
  await mkdir(join(root, 'content', 'projects'), { recursive: true });
  return root;
}

/** Write a valid Project MDX file to the temp directory. */
async function writeProjectFile(
  root: string,
  slug: string,
  fields: {
    title: string;
    description: string;
    stack: string[];
    categories: string[];
    status: string;
    highlight: boolean;
    order?: number;
    image?: string;
  },
  body: string,
): Promise<void> {
  const lines = [
    `title: "${fields.title}"`,
    `slug: ${slug}`,
    `description: "${fields.description}"`,
    `stack:`,
    ...fields.stack.map((s) => `  - ${s}`),
    `categories:`,
    ...fields.categories.map((c) => `  - ${c}`),
    `status: ${fields.status}`,
    `highlight: ${fields.highlight}`,
  ];
  if (fields.order !== undefined) {
    lines.push(`order: ${fields.order}`);
  }
  if (fields.image) {
    lines.push(`image: ${fields.image}`);
  }
  const content = `---\n${lines.join('\n')}\n---\n${body}`;
  await writeFile(join(root, 'content', 'projects', `${slug}.mdx`), content);
}

describe('Property 2: MDX parsing round trip — Project', () => {
  /**
   * **Validates: Requirements 2.3, 2.4, 2.6**
   *
   * For any valid MDX file with well-formed frontmatter containing all required
   * fields for Project, parsing the file and retrieving it by slug SHALL return
   * a typed object where each frontmatter field matches the original value and
   * the `content` field equals the raw MDX body string after frontmatter.
   */

  it('round-trips a Project with all required fields', async () => {
    const root = await setupTempProjects();

    await writeProjectFile(
      root,
      'my-project',
      {
        title: 'My Project',
        description: 'A cool project',
        stack: ['TypeScript', 'React'],
        categories: ['web'],
        status: 'completed',
        highlight: true,
      },
      'Project details here.',
    );

    const projects = await getProjects();
    expect(projects).toHaveLength(1);

    const project = projects[0]!;
    expect(project.title).toBe('My Project');
    expect(String(project.slug)).toBe('my-project');
    expect(project.description).toBe('A cool project');
    expect(project.stack).toEqual(['TypeScript', 'React']);
    expect(project.categories).toEqual(['web']);
    expect(project.status).toBe('completed');
    expect(project.highlight).toBe(true);
    expect(project.content.trim()).toBe('Project details here.');
  });

  it('round-trips a Project with optional order and image fields', async () => {
    const root = await setupTempProjects();

    await writeProjectFile(
      root,
      'ordered-project',
      {
        title: 'Ordered Project',
        description: 'Has order',
        stack: ['Python'],
        categories: ['ml'],
        status: 'in-progress',
        highlight: false,
        order: 0,
        image: '/assets/project.png',
      },
      'Ordered project body.',
    );

    const project = await getProjectBySlug('ordered-project');
    expect(project).not.toBeNull();
    expect(project!.title).toBe('Ordered Project');
    expect(project!.order).toBe(0);
    expect(String(project!.image)).toBe('/assets/project.png');
    expect(project!.content.trim()).toBe('Ordered project body.');
  });

  it('round-trips multiple Projects sorted by order then title', async () => {
    const root = await setupTempProjects();

    await writeProjectFile(
      root,
      'beta-project',
      {
        title: 'Beta Project',
        description: 'Second',
        stack: ['Go'],
        categories: ['backend'],
        status: 'completed',
        highlight: false,
        order: 1,
      },
      'Beta body.',
    );

    await writeProjectFile(
      root,
      'alpha-project',
      {
        title: 'Alpha Project',
        description: 'First',
        stack: ['Rust'],
        categories: ['systems'],
        status: 'completed',
        highlight: true,
        order: 0,
      },
      'Alpha body.',
    );

    const projects = await getProjects();
    expect(projects).toHaveLength(2);
    // order 0 before order 1
    expect(projects[0]!.title).toBe('Alpha Project');
    expect(projects[1]!.title).toBe('Beta Project');
  });
});
