/**
 * File reading, directory listing, and slug derivation utilities.
 * Centralizes all file I/O for the content loader.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import matter from 'gray-matter';
import * as jsYaml from 'js-yaml';

/** Configuration for a content directory. */
export interface ContentDirConfig {
  /** Relative path from project root, e.g. 'content/pages' */
  dir: string;
  /** Accepted file extensions, e.g. ['.mdx'] or ['.yaml', '.json'] */
  extensions: string[];
}

/** Result of reading a single content file. */
export interface RawContentFile {
  /** Absolute file path */
  filePath: string;
  /** Slug derived from filename (without extension) */
  fileSlug: string;
  /** Parsed data (frontmatter for MDX, parsed YAML/JSON for structured files) */
  data: Record<string, unknown>;
  /** Raw body content (MDX body after frontmatter; empty string for YAML/JSON) */
  body: string;
}

/**
 * Resolve the content root directory.
 * The optional `root` parameter makes it mockable for tests.
 */
export function getContentRoot(root?: string): string {
  return root ?? process.cwd();
}

/**
 * Parse a single content file based on its extension.
 * Returns the parsed data and body content.
 * Wraps parse errors with standardized format.
 */
function parseFile(
  filePath: string,
  content: string,
  ext: string,
): { data: Record<string, unknown>; body: string } {
  try {
    if (ext === '.mdx') {
      const parsed = matter(content);
      return {
        data: parsed.data as Record<string, unknown>,
        body: parsed.content,
      };
    }

    if (ext === '.yaml') {
      const parsed = jsYaml.load(content);
      return {
        data: (parsed ?? {}) as Record<string, unknown>,
        body: '',
      };
    }

    if (ext === '.json') {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return { data: parsed, body: '' };
    }

    // Unsupported extension — should not reach here if config is correct
    return { data: {}, body: '' };
  } catch (err) {
    throw new Error(
      `Content parse error: ${filePath} — ${(err as Error).message}`,
    );
  }
}

/**
 * Check whether a filename should be skipped during discovery.
 * Skips files starting with `_` (template convention) and `.gitkeep`.
 */
function shouldSkipFile(filename: string): boolean {
  return filename.startsWith('_') || filename === '.gitkeep';
}

/**
 * List all content files in a directory matching the configured extensions.
 * Skips files starting with `_` and `.gitkeep`.
 * Returns empty array if directory doesn't exist or is empty.
 */
export async function listContentFiles(
  config: ContentDirConfig,
  root?: string,
): Promise<RawContentFile[]> {
  const dirPath = join(getContentRoot(root), config.dir);

  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const results: RawContentFile[] = [];

  for (const filename of entries) {
    if (shouldSkipFile(filename)) continue;

    const ext = extname(filename);
    if (!config.extensions.includes(ext)) continue;

    const filePath = join(dirPath, filename);
    const content = await readFile(filePath, 'utf-8');
    const fileSlug = basename(filename, ext);
    const parsed = parseFile(filePath, content, ext);

    results.push({
      filePath,
      fileSlug,
      data: parsed.data,
      body: parsed.body,
    });
  }

  return results;
}

/**
 * Read a single content file by slug.
 * Tries each configured extension in order.
 * Returns null if no matching file exists.
 */
export async function readContentFileBySlug(
  config: ContentDirConfig,
  slug: string,
  root?: string,
): Promise<RawContentFile | null> {
  const dirPath = join(getContentRoot(root), config.dir);

  for (const ext of config.extensions) {
    const filename = `${slug}${ext}`;
    const filePath = join(dirPath, filename);

    let content: string;
    try {
      content = await readFile(filePath, 'utf-8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        continue;
      }
      throw err;
    }

    const parsed = parseFile(filePath, content, ext);

    return {
      filePath,
      fileSlug: slug,
      data: parsed.data,
      body: parsed.body,
    };
  }

  return null;
}
