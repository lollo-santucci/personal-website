/**
 * Seed content validation tests.
 *
 * These tests call real content loaders against actual seed files to verify
 * aggregate constraints required by the core-content-pages spec:
 * minimum counts, highlighted projects, distinct blog dates, required page
 * entities, no placeholder text, and loader validation.
 *
 * Validates: Requirements 9.1–9.7
 */

import { describe, it, expect } from 'vitest';
import { getPages, getPageBySlug } from '@/lib/content/pages';
import { getProjects } from '@/lib/content/projects';
import { getBlogPosts } from '@/lib/content/blog';
import { getAgents } from '@/lib/content/agents';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readdirSync } from 'node:fs';

const PLACEHOLDER_PATTERNS = [
  'lorem ipsum',
  'todo',
  'placeholder',
  'tbd',
];

const CONTENT_DIRS = [
  { dir: 'content/pages', ext: '.mdx' },
  { dir: 'content/projects', ext: '.mdx' },
  { dir: 'content/blog', ext: '.mdx' },
  { dir: 'content/agents', ext: '.yaml' },
];

/**
 * Property 14: Seed content passes loader validation
 * Validates: Requirements 9.7
 *
 * Calls real content loaders against actual seed files and verifies
 * no validation errors are thrown.
 */
describe('P14: Seed content passes loader validation', () => {
  it('all pages load without validation errors', async () => {
    const pages = await getPages();
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(page.title).toBeTruthy();
      expect(String(page.slug)).toBeTruthy();
      expect(page.content).toBeDefined();
    }
  });

  it('all projects load without validation errors', async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThan(0);
    for (const project of projects) {
      expect(project.title).toBeTruthy();
      expect(String(project.slug)).toBeTruthy();
      expect(project.description).toBeTruthy();
      expect(Array.isArray(project.stack)).toBe(true);
      expect(Array.isArray(project.categories)).toBe(true);
      expect(project.status).toBeTruthy();
      expect(typeof project.highlight).toBe('boolean');
    }
  });

  it('all blog posts load without validation errors', async () => {
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(String(post.slug)).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(String(post.date)).toBeTruthy();
      expect(Array.isArray(post.categories)).toBe(true);
      expect(Array.isArray(post.tags)).toBe(true);
    }
  });

  it('contains ≥2 projects', async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(2);
  });

  it('contains ≥3 blog posts', async () => {
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(3);
  });

  it('contains ≥1 highlighted project', async () => {
    const projects = await getProjects();
    const highlighted = projects.filter((p) => p.highlight === true);
    expect(highlighted.length).toBeGreaterThanOrEqual(1);
  });

  it('home page entity exists', async () => {
    const home = await getPageBySlug('home');
    expect(home).not.toBeNull();
    expect(home!.title).toBeTruthy();
    expect(home!.content).toBeTruthy();
  });

  it('about page entity exists', async () => {
    const about = await getPageBySlug('about');
    expect(about).not.toBeNull();
    expect(about!.title).toBeTruthy();
    expect(about!.content).toBeTruthy();
  });

  it('contact page entity exists', async () => {
    const contact = await getPageBySlug('contact');
    expect(contact).not.toBeNull();
    expect(contact!.title).toBeTruthy();
    expect(contact!.content).toBeTruthy();
  });

  it('all blog post dates are distinct', async () => {
    const posts = await getBlogPosts();
    const dates = posts.map((p) => String(p.date));
    const uniqueDates = new Set(dates);
    expect(uniqueDates.size).toBe(dates.length);
  });
});

/**
 * Property 15: Seed content contains no placeholder text
 * Validates: Requirements 9.6
 *
 * Scans all seed content files (excluding templates and .gitkeep) for
 * known placeholder patterns.
 */
describe('P15: Seed content contains no placeholder text', () => {
  /**
   * Collect all real content file paths (skip templates and .gitkeep).
   */
  function getSeedFilePaths(): string[] {
    const paths: string[] = [];
    for (const { dir, ext } of CONTENT_DIRS) {
      const fullDir = join(process.cwd(), dir);
      let entries: string[];
      try {
        entries = readdirSync(fullDir);
      } catch {
        continue;
      }
      for (const entry of entries) {
        if (entry.startsWith('_') || entry.startsWith('.')) continue;
        if (!entry.endsWith(ext)) continue;
        paths.push(join(fullDir, entry));
      }
    }
    return paths;
  }

  it('no seed file contains placeholder patterns', async () => {
    const filePaths = getSeedFilePaths();
    expect(filePaths.length).toBeGreaterThan(0);

    for (const filePath of filePaths) {
      const content = await readFile(filePath, 'utf-8');
      const lower = content.toLowerCase();
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(
          lower.includes(pattern),
          `Found "${pattern}" in ${filePath}`,
        ).toBe(false);
      }
    }
  });

  it('loaded entities contain no placeholder text in content fields', async () => {
    const pages = await getPages();
    const projects = await getProjects();
    const posts = await getBlogPosts();

    const allContent = [
      ...pages.map((p) => ({ label: `page:${p.slug}`, text: `${p.title} ${p.content}` })),
      ...projects.map((p) => ({ label: `project:${p.slug}`, text: `${p.title} ${p.description} ${p.content}` })),
      ...posts.map((p) => ({ label: `post:${p.slug}`, text: `${p.title} ${p.excerpt} ${p.content}` })),
    ];

    for (const { label, text } of allContent) {
      const lower = text.toLowerCase();
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(
          lower.includes(pattern),
          `Found "${pattern}" in ${label}`,
        ).toBe(false);
      }
    }
  });
});


/**
 * Agent seed content validation.
 * Validates: Requirements 5.1, 5.2, 5.5, 5.6, 18.1, 18.2, 18.4, 18.5
 */
describe('Agent seed content validation', () => {
  it('contains at least 2 agents', async () => {
    const agents = await getAgents();
    expect(agents.length).toBeGreaterThanOrEqual(2);
  });

  it('contains at least two distinct agent statuses', async () => {
    const agents = await getAgents();
    const statuses = new Set(agents.map((a) => a.status));
    expect(statuses.size).toBeGreaterThanOrEqual(2);
  });

  it('at least one agent has multi-line personality (contains \\n)', async () => {
    const agents = await getAgents();
    const hasMultiLine = agents.some((a) => a.personality.includes('\n'));
    expect(hasMultiLine).toBe(true);
  });

  it('no agent contains placeholder text', async () => {
    const agents = await getAgents();
    for (const agent of agents) {
      const text = `${agent.name} ${agent.role} ${agent.personality} ${agent.capabilities.join(' ')} ${agent.mission} ${agent.bestFor.join(' ')}`.toLowerCase();
      for (const pattern of PLACEHOLDER_PATTERNS) {
        expect(
          text.includes(pattern),
          `Found "${pattern}" in agent:${agent.slug}`,
        ).toBe(false);
      }
    }
  });

  it('all agents include Agent_Extended_Fields (index, mission, bestFor, toneOfVoice)', async () => {
    const agents = await getAgents();
    for (const agent of agents) {
      expect(typeof agent.index, `agent:${agent.slug} missing index`).toBe('number');
      expect(agent.mission, `agent:${agent.slug} missing mission`).toBeTruthy();
      expect(Array.isArray(agent.bestFor), `agent:${agent.slug} bestFor not array`).toBe(true);
      expect(agent.bestFor.length, `agent:${agent.slug} bestFor is empty`).toBeGreaterThan(0);
      expect(agent.toneOfVoice, `agent:${agent.slug} missing toneOfVoice`).toBeDefined();
      for (const dim of ['warm', 'direct', 'playful', 'formal', 'calm'] as const) {
        const val = agent.toneOfVoice[dim];
        expect(typeof val, `agent:${agent.slug} toneOfVoice.${dim} not a number`).toBe('number');
        expect(val, `agent:${agent.slug} toneOfVoice.${dim} out of range`).toBeGreaterThanOrEqual(1);
        expect(val, `agent:${agent.slug} toneOfVoice.${dim} out of range`).toBeLessThanOrEqual(5);
      }
    }
  });

  it('no agent has empty required string fields', async () => {
    const agents = await getAgents();
    for (const agent of agents) {
      expect(agent.name.trim(), `agent:${agent.slug} name is empty`).not.toBe('');
      expect(agent.role.trim(), `agent:${agent.slug} role is empty`).not.toBe('');
      expect(agent.personality.trim(), `agent:${agent.slug} personality is empty`).not.toBe('');
      expect(agent.mission.trim(), `agent:${agent.slug} mission is empty`).not.toBe('');
    }
  });

  it('at least one agent has a greeting field', async () => {
    const agents = await getAgents();
    const hasGreeting = agents.some((a) => a.greeting && a.greeting.trim() !== '');
    expect(hasGreeting).toBe(true);
  });
});

/**
 * Unit Test Check 8: No TODO or lorem ipsum in seed content
 * Validates: Requirements 18.4, 18.5
 *
 * Scans all seed content files for TODO markers and lorem ipsum text.
 * This is a stricter check than P15 — it specifically targets TODO markers
 * (case-insensitive, including "TODO:", "TODO -", standalone "TODO") and
 * lorem ipsum across all content types including agents.
 */
describe('Check 8: No TODO or lorem ipsum in seed content', () => {
  const TODO_PATTERNS = [/\btodo\b/i];
  const LOREM_PATTERNS = [/lorem\s+ipsum/i];

  function getSeedFilePaths(): string[] {
    const paths: string[] = [];
    for (const { dir, ext } of CONTENT_DIRS) {
      const fullDir = join(process.cwd(), dir);
      let entries: string[];
      try {
        entries = readdirSync(fullDir);
      } catch {
        continue;
      }
      for (const entry of entries) {
        if (entry.startsWith('_') || entry.startsWith('.')) continue;
        if (!entry.endsWith(ext)) continue;
        paths.push(join(fullDir, entry));
      }
    }
    return paths;
  }

  it('no seed file contains TODO markers', async () => {
    const filePaths = getSeedFilePaths();
    expect(filePaths.length).toBeGreaterThan(0);

    for (const filePath of filePaths) {
      const content = await readFile(filePath, 'utf-8');
      for (const pattern of TODO_PATTERNS) {
        expect(
          pattern.test(content),
          `Found TODO marker in ${filePath}`,
        ).toBe(false);
      }
    }
  });

  it('no seed file contains lorem ipsum', async () => {
    const filePaths = getSeedFilePaths();
    expect(filePaths.length).toBeGreaterThan(0);

    for (const filePath of filePaths) {
      const content = await readFile(filePath, 'utf-8');
      for (const pattern of LOREM_PATTERNS) {
        expect(
          pattern.test(content),
          `Found lorem ipsum in ${filePath}`,
        ).toBe(false);
      }
    }
  });

  it('no loaded agent entity has TODO or lorem ipsum in content fields', async () => {
    const agents = await getAgents();
    for (const agent of agents) {
      const text = [
        agent.name,
        agent.role,
        agent.personality,
        agent.mission,
        ...agent.bestFor,
        ...agent.capabilities,
        agent.greeting ?? '',
      ].join(' ');

      for (const pattern of TODO_PATTERNS) {
        expect(
          pattern.test(text),
          `Found TODO marker in agent:${agent.slug}`,
        ).toBe(false);
      }
      for (const pattern of LOREM_PATTERNS) {
        expect(
          pattern.test(text),
          `Found lorem ipsum in agent:${agent.slug}`,
        ).toBe(false);
      }
    }
  });
});
