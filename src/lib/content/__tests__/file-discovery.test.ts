/**
 * Property-based tests for file discovery utility.
 * Tests extension filtering, skip rules, and directory resilience.
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listContentFiles } from '../utils/file-discovery';
import type { ContentDirConfig } from '../utils/file-discovery';

/** Create a unique temp directory for each test run. */
async function makeTempDir(): Promise<string> {
  const base = join(tmpdir(), `content-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(base, { recursive: true });
  return base;
}

/** Tracked temp dirs for cleanup. */
const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

/**
 * Generate minimal valid file content for a given extension.
 * MDX needs frontmatter, YAML needs valid YAML, JSON needs valid JSON.
 * Other extensions get plain text (they should be skipped anyway).
 */
function makeFileContent(slug: string, ext: string): string {
  switch (ext) {
    case '.mdx':
      return `---\ntitle: test\nslug: ${slug}\n---\nBody content`;
    case '.yaml':
      return `name: test\nslug: ${slug}`;
    case '.json':
      return JSON.stringify({ name: 'test', slug });
    default:
      return 'ignored content';
  }
}

/**
 * Arbitrary for generating a set of file descriptors with mixed extensions and prefixes.
 * Uses safe filenames (lowercase alphanumeric) to avoid filesystem issues.
 */
const fileDescriptorArb = fc.record({
  name: fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
  ext: fc.constantFrom('.mdx', '.yaml', '.json', '.yml', '.txt'),
  prefix: fc.constantFrom('', '_'),
});

describe('Property 1: File discovery respects extension filter and skip rules', () => {
  /**
   * **Validates: Requirements 2.1, 2.2, 4.1, 4.2, 13.1, 13.2, 13.3, 13.4**
   *
   * For any content directory containing a mix of files with various extensions
   * and filenames (some starting with `_`, some not), the file discovery utility
   * SHALL return only files matching the configured extensions, excluding files
   * whose name starts with `_` and excluding `.gitkeep` files.
   */
  it('returns only files matching configured extensions, excluding _ prefix and .gitkeep', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fileDescriptorArb, { minLength: 1, maxLength: 20 }),
        fc.constantFrom(
          { extensions: ['.mdx'], label: 'mdx-only' },
          { extensions: ['.yaml', '.json'], label: 'yaml-json' },
        ),
        async (fileDescs, extConfig) => {
          const root = await makeTempDir();
          tempDirs.push(root);

          const contentDir = 'test-content';
          const dirPath = join(root, contentDir);
          await mkdir(dirPath, { recursive: true });

          // Deduplicate filenames to avoid overwrites
          const seen = new Set<string>();
          const uniqueDescs = fileDescs.filter((fd) => {
            const fullName = `${fd.prefix}${fd.name}${fd.ext}`;
            if (seen.has(fullName)) return false;
            seen.add(fullName);
            return true;
          });

          // Also add a .gitkeep to verify it's always excluded
          await writeFile(join(dirPath, '.gitkeep'), '');

          // Write all generated files
          for (const fd of uniqueDescs) {
            const slug = fd.name;
            const filename = `${fd.prefix}${fd.name}${fd.ext}`;
            const content = makeFileContent(slug, fd.ext);
            await writeFile(join(dirPath, filename), content);
          }

          const config: ContentDirConfig = {
            dir: contentDir,
            extensions: extConfig.extensions,
          };

          const results = await listContentFiles(config, root);

          // Compute expected: files that match extensions AND don't start with _
          const expected = uniqueDescs.filter(
            (fd) =>
              extConfig.extensions.includes(fd.ext) && fd.prefix !== '_',
          );

          // Result count must match expected count
          expect(results.length).toBe(expected.length);

          // Every returned file must have a valid extension
          for (const result of results) {
            const hasValidExt = extConfig.extensions.some((ext) =>
              result.filePath.endsWith(ext),
            );
            expect(hasValidExt).toBe(true);
          }

          // No returned file should have a slug starting with _
          // (fileSlug is derived from filename without extension, prefix is part of filename)
          for (const result of results) {
            const filename = result.filePath.split('/').pop()!;
            expect(filename.startsWith('_')).toBe(false);
          }

          // .gitkeep must never appear in results
          for (const result of results) {
            expect(result.filePath).not.toContain('.gitkeep');
          }

          // .yml files must never appear in results (even if configured — but our configs don't include .yml)
          for (const result of results) {
            expect(result.filePath).not.toMatch(/\.yml$/);
          }

          // Every expected file must be present in results (by slug)
          const returnedSlugs = new Set(results.map((r) => r.fileSlug));
          for (const fd of expected) {
            expect(returnedSlugs.has(fd.name)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});


describe('Property 14: Directory resilience — missing or empty directory returns empty array', () => {
  /**
   * **Validates: Requirements 12.1, 12.2**
   *
   * For any content type, when the content directory does not exist or exists
   * but contains only non-matching files (`.gitkeep`, `_`-prefixed templates),
   * the list function SHALL return an empty array (not throw).
   */

  const dirNameArb = fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/);
  const extensionsArb = fc.constantFrom<string[][]>(
    ['.mdx'],
    ['.yaml', '.json'],
  );

  it('returns empty array for non-existent directory', async () => {
    await fc.assert(
      fc.asyncProperty(dirNameArb, extensionsArb, async (dirName, extensions) => {
        const root = await makeTempDir();
        tempDirs.push(root);

        // Directory does NOT exist under root
        const config: ContentDirConfig = {
          dir: dirName,
          extensions,
        };

        const results = await listContentFiles(config, root);

        expect(results).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });

  it('returns empty array for empty directory (only .gitkeep and/or _template files)', async () => {
    await fc.assert(
      fc.asyncProperty(
        dirNameArb,
        extensionsArb,
        fc.record({
          addGitkeep: fc.boolean(),
          addTemplateYaml: fc.boolean(),
          addTemplateMdx: fc.boolean(),
        }),
        async (dirName, extensions, opts) => {
          const root = await makeTempDir();
          tempDirs.push(root);

          const dirPath = join(root, dirName);
          await mkdir(dirPath, { recursive: true });

          // Optionally add .gitkeep
          if (opts.addGitkeep) {
            await writeFile(join(dirPath, '.gitkeep'), '');
          }

          // Optionally add _template.yaml (underscore-prefixed → skipped)
          if (opts.addTemplateYaml) {
            await writeFile(join(dirPath, '_template.yaml'), 'name: template');
          }

          // Optionally add _template.mdx (underscore-prefixed → skipped)
          if (opts.addTemplateMdx) {
            await writeFile(
              join(dirPath, '_template.mdx'),
              '---\ntitle: template\nslug: template\n---\nTemplate',
            );
          }

          const config: ContentDirConfig = {
            dir: dirName,
            extensions,
          };

          const results = await listContentFiles(config, root);

          expect(results).toEqual([]);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 11: Unparseable file throws with correct format', () => {
  /**
   * **Validates: Requirements 6.4, 6.5, 6.6, 13.2**
   *
   * For any content file that cannot be parsed (malformed YAML, malformed JSON,
   * or invalid MDX frontmatter), the loader SHALL throw an error matching the
   * format: `Content parse error: <file-path> — <parser-error-message>`.
   */

  it.each([
    {
      label: 'malformed YAML (unclosed flow collection)',
      filename: 'broken.yaml',
      content: '{ broken',
      extensions: ['.yaml', '.json'] as string[],
    },
    {
      label: 'malformed YAML (invalid mapping)',
      filename: 'invalid.yaml',
      content: ': :\n: :',
      extensions: ['.yaml', '.json'] as string[],
    },
  ])(
    'throws Content parse error for $label',
    async ({ filename, content, extensions }) => {
      const root = await makeTempDir();
      tempDirs.push(root);

      const contentDir = 'test-parse-errors';
      const dirPath = join(root, contentDir);
      await mkdir(dirPath, { recursive: true });
      await writeFile(join(dirPath, filename), content);

      const config: ContentDirConfig = {
        dir: contentDir,
        extensions,
      };

      await expect(listContentFiles(config, root)).rejects.toThrow(
        /^Content parse error: .+ — .+/,
      );
    },
  );

  it.each([
    {
      label: 'malformed JSON (plain string)',
      filename: 'broken.json',
      content: 'not json',
      extensions: ['.yaml', '.json'] as string[],
    },
    {
      label: 'malformed JSON (unclosed brace)',
      filename: 'incomplete.json',
      content: '{ "name": ',
      extensions: ['.yaml', '.json'] as string[],
    },
  ])(
    'throws Content parse error for $label',
    async ({ filename, content, extensions }) => {
      const root = await makeTempDir();
      tempDirs.push(root);

      const contentDir = 'test-json-errors';
      const dirPath = join(root, contentDir);
      await mkdir(dirPath, { recursive: true });
      await writeFile(join(dirPath, filename), content);

      const config: ContentDirConfig = {
        dir: contentDir,
        extensions,
      };

      await expect(listContentFiles(config, root)).rejects.toThrow(
        /^Content parse error: .+ — .+/,
      );
    },
  );

  it.each([
    {
      label: 'MDX with unparseable frontmatter (invalid YAML mapping)',
      filename: 'broken.mdx',
      content: '---\n: :\n---\nBody content',
      extensions: ['.mdx'] as string[],
    },
    {
      label: 'MDX with unclosed flow collection in frontmatter',
      filename: 'flow.mdx',
      content: '---\n[invalid\n---\nBody content',
      extensions: ['.mdx'] as string[],
    },
  ])(
    'throws Content parse error for $label',
    async ({ filename, content, extensions }) => {
      const root = await makeTempDir();
      tempDirs.push(root);

      const contentDir = 'test-mdx-errors';
      const dirPath = join(root, contentDir);
      await mkdir(dirPath, { recursive: true });
      await writeFile(join(dirPath, filename), content);

      const config: ContentDirConfig = {
        dir: contentDir,
        extensions,
      };

      await expect(listContentFiles(config, root)).rejects.toThrow(
        /^Content parse error: .+ — .+/,
      );
    },
  );

  it('includes the file path in the parse error message', async () => {
    const root = await makeTempDir();
    tempDirs.push(root);

    const contentDir = 'test-error-path';
    const dirPath = join(root, contentDir);
    await mkdir(dirPath, { recursive: true });
    await writeFile(join(dirPath, 'bad-file.yaml'), '{ broken');

    const config: ContentDirConfig = {
      dir: contentDir,
      extensions: ['.yaml', '.json'],
    };

    await expect(listContentFiles(config, root)).rejects.toThrow(
      expect.objectContaining({
        message: expect.stringContaining('bad-file.yaml'),
      }),
    );
  });

  it('includes the parser error message after the em dash', async () => {
    const root = await makeTempDir();
    tempDirs.push(root);

    const contentDir = 'test-error-msg';
    const dirPath = join(root, contentDir);
    await mkdir(dirPath, { recursive: true });
    await writeFile(join(dirPath, 'invalid.json'), 'not json');

    const config: ContentDirConfig = {
      dir: contentDir,
      extensions: ['.yaml', '.json'],
    };

    try {
      await listContentFiles(config, root);
      expect.fail('Should have thrown');
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).toMatch(/^Content parse error: /);
      // The em dash separates file path from parser message
      expect(msg).toContain(' — ');
      // After the em dash, there should be a non-empty parser message
      const afterDash = msg.split(' — ')[1];
      expect(afterDash).toBeTruthy();
      expect(afterDash!.length).toBeGreaterThan(0);
    }
  });
});


describe('.yml exclusion — only .yaml is supported (R13.2)', () => {
  /**
   * **Validates: Requirements 13.2**
   *
   * YAML content files use `.yaml` extension only. `.yml` is intentionally
   * not supported. When both `.yaml` and `.yml` files exist, only `.yaml`
   * files are returned by listContentFiles.
   */

  it('ignores .yml files and returns only .yaml files', async () => {
    const root = await makeTempDir();
    tempDirs.push(root);

    const contentDir = 'test-yml-exclusion';
    const dirPath = join(root, contentDir);
    await mkdir(dirPath, { recursive: true });

    // Valid .yaml file
    await writeFile(
      join(dirPath, 'valid-agent.yaml'),
      'name: Valid Agent\nslug: valid-agent',
    );

    // Valid .yml file (should be ignored)
    await writeFile(
      join(dirPath, 'ignored-agent.yml'),
      'name: Ignored Agent\nslug: ignored-agent',
    );

    const config: ContentDirConfig = {
      dir: contentDir,
      extensions: ['.yaml', '.json'],
    };

    const results = await listContentFiles(config, root);

    expect(results).toHaveLength(1);
    expect(results[0]!.fileSlug).toBe('valid-agent');
    expect(results[0]!.filePath).toMatch(/\.yaml$/);
  });

  it('returns .yaml and .json but never .yml', async () => {
    const root = await makeTempDir();
    tempDirs.push(root);

    const contentDir = 'test-yml-mixed';
    const dirPath = join(root, contentDir);
    await mkdir(dirPath, { recursive: true });

    await writeFile(
      join(dirPath, 'agent-one.yaml'),
      'name: Agent One\nslug: agent-one',
    );
    await writeFile(
      join(dirPath, 'agent-two.json'),
      JSON.stringify({ name: 'Agent Two', slug: 'agent-two' }),
    );
    await writeFile(
      join(dirPath, 'agent-three.yml'),
      'name: Agent Three\nslug: agent-three',
    );

    const config: ContentDirConfig = {
      dir: contentDir,
      extensions: ['.yaml', '.json'],
    };

    const results = await listContentFiles(config, root);
    const slugs = results.map((r) => r.fileSlug).sort();

    expect(slugs).toEqual(['agent-one', 'agent-two']);

    // No result should have .yml extension
    for (const result of results) {
      expect(result.filePath).not.toMatch(/\.yml$/);
    }
  });
});
