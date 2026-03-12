/**
 * Property-based tests for content validation utility.
 * Tests required field validation, array field validation, and slug mismatch.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateContent } from '../utils/validation';
import type { ValidationConfig } from '../utils/validation';

/**
 * Per-type configuration: required fields, array fields, and a base valid data generator.
 * Each entry produces a valid data object that passes validateContent.
 */
const CONTENT_TYPES = [
  {
    label: 'Page',
    config: { requiredFields: ['title', 'slug'], arrayFields: [] } satisfies ValidationConfig,
    validData: (slug: string) => ({ title: 'Test', slug }),
  },
  {
    label: 'Project',
    config: {
      requiredFields: ['title', 'slug', 'description', 'stack', 'categories', 'status', 'highlight'],
      arrayFields: ['stack', 'categories'],
    } satisfies ValidationConfig,
    validData: (slug: string) => ({
      title: 'Test',
      slug,
      description: 'desc',
      stack: ['ts'],
      categories: ['web'],
      status: 'completed',
      highlight: true,
    }),
  },
  {
    label: 'BlogPost',
    config: {
      requiredFields: ['title', 'slug', 'excerpt', 'date', 'categories', 'tags'],
      arrayFields: ['categories', 'tags'],
    } satisfies ValidationConfig,
    validData: (slug: string) => ({
      title: 'Test',
      slug,
      excerpt: 'exc',
      date: '2025-01-15',
      categories: ['dev'],
      tags: ['ts'],
    }),
  },
  {
    label: 'Agent',
    config: {
      requiredFields: ['name', 'slug', 'role', 'personality', 'capabilities', 'status'],
      arrayFields: ['capabilities'],
    } satisfies ValidationConfig,
    validData: (slug: string) => ({
      name: 'Test',
      slug,
      role: 'assistant',
      personality: 'friendly',
      capabilities: ['chat'],
      status: 'active',
    }),
  },
  {
    label: 'Service',
    config: {
      requiredFields: ['title', 'slug', 'description'],
      arrayFields: [],
    } satisfies ValidationConfig,
    validData: (slug: string) => ({
      title: 'Test',
      slug,
      description: 'desc',
    }),
  },
] as const;

/** Removal strategies for invalidating a required field. */
type RemovalStrategy = 'remove' | 'null' | 'undefined';

describe('Property 9: Missing or null required field throws with correct format', () => {
  /**
   * **Validates: Requirements 6.1, 6.2, 6.7**
   *
   * For any content type and for any required field of that type, when the field
   * is absent, null, or undefined in the parsed content, the loader SHALL throw
   * an error matching the format:
   * `Content validation error: <file-path> is missing required field "<field-name>"`
   */

  for (const contentType of CONTENT_TYPES) {
    it(`${contentType.label}: removing or nullifying any required field throws correct error`, async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom(...contentType.config.requiredFields),
          fc.constantFrom<RemovalStrategy>('remove', 'null', 'undefined'),
          fc.stringMatching(/^[a-z][a-z0-9-]{0,15}$/),
          (field, strategy, fileSlug) => {
            const data = { ...contentType.validData(fileSlug) };
            const filePath = `content/test/${fileSlug}.mdx`;

            // Invalidate the chosen field
            switch (strategy) {
              case 'remove':
                delete (data as Record<string, unknown>)[field];
                break;
              case 'null':
                (data as Record<string, unknown>)[field] = null;
                break;
              case 'undefined':
                (data as Record<string, unknown>)[field] = undefined;
                break;
            }

            expect(() =>
              validateContent(
                data as Record<string, unknown>,
                filePath,
                fileSlug,
                contentType.config,
              ),
            ).toThrow(
              `Content validation error: ${filePath} is missing required field "${field}"`,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  }
});

describe('Property 10: Non-array value for array field throws with correct format', () => {
  /**
   * **Validates: Requirements 6.3**
   *
   * For any content type with array-typed fields and for any non-array value
   * (string, number, boolean) assigned to that field, the loader SHALL throw
   * an error matching the format:
   * `Content validation error: <file-path> field "<field-name>" must be an array`
   */

  const typesWithArrayFields = CONTENT_TYPES.filter(
    (ct) => ct.config.arrayFields.length > 0,
  );

  for (const contentType of typesWithArrayFields) {
    it(`${contentType.label}: replacing any array field with a non-array value throws correct error`, async () => {
      await fc.assert(
        fc.property(
          fc.constantFrom(...contentType.config.arrayFields),
          fc.oneof(fc.string({ minLength: 1 }), fc.integer(), fc.boolean()),
          fc.stringMatching(/^[a-z][a-z0-9-]{0,15}$/),
          (field, nonArrayValue, fileSlug) => {
            const data = { ...contentType.validData(fileSlug) };
            const filePath = `content/test/${fileSlug}.mdx`;

            // Replace the array field with a non-array value
            (data as Record<string, unknown>)[field] = nonArrayValue;

            expect(() =>
              validateContent(
                data as Record<string, unknown>,
                filePath,
                fileSlug,
                contentType.config,
              ),
            ).toThrow(
              `Content validation error: ${filePath} field "${field}" must be an array`,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  }
});


describe('Property 13: Slug mismatch throws', () => {
  /**
   * **Validates: Requirements 13.6**
   *
   * For any content file where the declared slug field value differs from the
   * filename-derived slug, the loader SHALL throw an error matching the format:
   * `Content validation error: <file-path> declared slug "<declared-slug>" does not match filename-derived slug "<filename-slug>"`
   */

  const PAGE_CONFIG: ValidationConfig = { requiredFields: ['title', 'slug'], arrayFields: [] };

  it('mismatched filename-slug and declared-slug throws correct error', async () => {
    await fc.assert(
      fc.property(
        fc.tuple(
          fc.stringMatching(/^[a-z][a-z0-9-]+$/),
          fc.stringMatching(/^[a-z][a-z0-9-]+$/),
        ).filter(([a, b]) => a !== b),
        ([fileSlug, declaredSlug]) => {
          const filePath = `content/pages/${fileSlug}.mdx`;
          const data: Record<string, unknown> = {
            title: 'Test Page',
            slug: declaredSlug,
          };

          expect(() =>
            validateContent(data, filePath, fileSlug, PAGE_CONFIG),
          ).toThrow(
            `Content validation error: ${filePath} declared slug "${declaredSlug}" does not match filename-derived slug "${fileSlug}"`,
          );
        },
      ),
      { numRuns: 100 },
    );
  });
});
