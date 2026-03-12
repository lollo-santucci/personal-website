/**
 * Seed content integration tests.
 *
 * These tests read from the REAL content/ directory (not temp dirs).
 * They verify that each seed file loads through the content loader without
 * validation errors, has real content, and that required dependencies exist.
 *
 * _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 1.1, 1.2, 1.3, 1.4_
 */

import { describe, it, expect } from 'vitest';
import { getPages, getPageBySlug } from '../pages';
import { getProjects, getProjectBySlug } from '../projects';
import { getBlogPosts, getBlogPostBySlug } from '../blog';
import { getAgents, getAgentBySlug } from '../agents';
import { getServices, getServiceBySlug } from '../services';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const FORBIDDEN_SUBSTRINGS = ['lorem ipsum', 'placeholder', 'todo', 'tbd'];

/**
 * Check that a string does not contain any forbidden substrings (case-insensitive).
 */
function assertNoForbiddenSubstrings(text: string, label: string): void {
  const lower = text.toLowerCase();
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    expect(lower).not.toContain(forbidden);
  }
}

/**
 * Count non-whitespace characters in a string.
 */
function nonWhitespaceCount(text: string): number {
  return text.replace(/\s/g, '').length;
}

describe('Seed content: Pages', () => {
  it('about.mdx loads without validation errors', async () => {
    const page = await getPageBySlug('about');
    expect(page).not.toBeNull();
    expect(page!.title).toBe('About');
    expect(String(page!.slug)).toBe('about');
  });

  it('about.mdx has ≥50 non-whitespace chars in body', async () => {
    const page = await getPageBySlug('about');
    expect(page).not.toBeNull();
    expect(nonWhitespaceCount(page!.content)).toBeGreaterThanOrEqual(50);
  });

  it('about.mdx contains no forbidden substrings', async () => {
    const page = await getPageBySlug('about');
    expect(page).not.toBeNull();
    assertNoForbiddenSubstrings(page!.content, 'about.mdx body');
  });

  it('about.mdx appears in getPages() list', async () => {
    const pages = await getPages();
    const about = pages.find((p) => String(p.slug) === 'about');
    expect(about).toBeDefined();
  });
});

describe('Seed content: Projects', () => {
  it('personal-website.mdx loads without validation errors', async () => {
    const project = await getProjectBySlug('personal-website');
    expect(project).not.toBeNull();
    expect(project!.title).toBe('Personal Website');
    expect(String(project!.slug)).toBe('personal-website');
    expect(project!.status).toBe('in-progress');
    expect(project!.highlight).toBe(true);
    expect(Array.isArray(project!.stack)).toBe(true);
    expect(Array.isArray(project!.categories)).toBe(true);
  });

  it('personal-website.mdx has ≥50 non-whitespace chars in body', async () => {
    const project = await getProjectBySlug('personal-website');
    expect(project).not.toBeNull();
    expect(nonWhitespaceCount(project!.content)).toBeGreaterThanOrEqual(50);
  });

  it('personal-website.mdx contains no forbidden substrings', async () => {
    const project = await getProjectBySlug('personal-website');
    expect(project).not.toBeNull();
    assertNoForbiddenSubstrings(project!.content, 'personal-website.mdx body');
  });

  it('personal-website.mdx appears in getProjects() list', async () => {
    const projects = await getProjects();
    const pw = projects.find((p) => String(p.slug) === 'personal-website');
    expect(pw).toBeDefined();
  });
});

describe('Seed content: Blog', () => {
  it('hello-world.mdx loads without validation errors', async () => {
    const post = await getBlogPostBySlug('hello-world');
    expect(post).not.toBeNull();
    expect(post!.title).toBe("Building a Website That's Also a World");
    expect(String(post!.slug)).toBe('hello-world');
    expect(Array.isArray(post!.categories)).toBe(true);
    expect(Array.isArray(post!.tags)).toBe(true);
    expect(post!.date).toBeTruthy();
  });

  it('hello-world.mdx has ≥50 non-whitespace chars in body', async () => {
    const post = await getBlogPostBySlug('hello-world');
    expect(post).not.toBeNull();
    expect(nonWhitespaceCount(post!.content)).toBeGreaterThanOrEqual(50);
  });

  it('hello-world.mdx contains no forbidden substrings', async () => {
    const post = await getBlogPostBySlug('hello-world');
    expect(post).not.toBeNull();
    assertNoForbiddenSubstrings(post!.content, 'hello-world.mdx body');
  });

  it('hello-world.mdx appears in getBlogPosts() list', async () => {
    const posts = await getBlogPosts();
    const hw = posts.find((p) => String(p.slug) === 'hello-world');
    expect(hw).toBeDefined();
  });
});

describe('Seed content: Agents', () => {
  it('sales-agent.yaml loads without validation errors', async () => {
    const agent = await getAgentBySlug('sales-agent');
    expect(agent).not.toBeNull();
    expect(agent!.name).toBe('Sales Agent');
    expect(String(agent!.slug)).toBe('sales-agent');
    expect(agent!.status).toBe('coming-soon');
    expect(Array.isArray(agent!.capabilities)).toBe(true);
    expect(agent!.capabilities.length).toBeGreaterThan(0);
  });

  it('sales-agent.yaml appears in getAgents() list', async () => {
    const agents = await getAgents();
    const sa = agents.find((a) => String(a.slug) === 'sales-agent');
    expect(sa).toBeDefined();
  });
});

describe('Seed content: Services', () => {
  it('fullstack-development.mdx loads without validation errors', async () => {
    const service = await getServiceBySlug('fullstack-development');
    expect(service).not.toBeNull();
    expect(service!.title).toBe('Full-Stack Development');
    expect(String(service!.slug)).toBe('fullstack-development');
    expect(service!.description).toBeTruthy();
  });

  it('fullstack-development.mdx has ≥50 non-whitespace chars in body', async () => {
    const service = await getServiceBySlug('fullstack-development');
    expect(service).not.toBeNull();
    expect(nonWhitespaceCount(service!.content)).toBeGreaterThanOrEqual(50);
  });

  it('fullstack-development.mdx contains no forbidden substrings', async () => {
    const service = await getServiceBySlug('fullstack-development');
    expect(service).not.toBeNull();
    assertNoForbiddenSubstrings(service!.content, 'fullstack-development.mdx body');
  });

  it('fullstack-development.mdx appears in getServices() list', async () => {
    const services = await getServices();
    const fsd = services.find((s) => String(s.slug) === 'fullstack-development');
    expect(fsd).toBeDefined();
  });
});

describe('Seed content: Dependencies in package.json', () => {
  it('has gray-matter as production dependency', async () => {
    const pkg = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf-8'),
    );
    expect(pkg.dependencies['gray-matter']).toBeDefined();
  });

  it('has js-yaml as production dependency', async () => {
    const pkg = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf-8'),
    );
    expect(pkg.dependencies['js-yaml']).toBeDefined();
  });

  it('has next-mdx-remote as production dependency', async () => {
    const pkg = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf-8'),
    );
    expect(pkg.dependencies['next-mdx-remote']).toBeDefined();
  });

  it('has @types/js-yaml as dev dependency', async () => {
    const pkg = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf-8'),
    );
    expect(pkg.devDependencies['@types/js-yaml']).toBeDefined();
  });
});
