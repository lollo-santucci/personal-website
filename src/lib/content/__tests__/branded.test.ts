/**
 * Property-based tests for branded type casting utility.
 * Tests runtime value preservation and compile-time type correctness.
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import * as fc from 'fast-check';
import { applyBrandedCasts } from '../utils/branded';
import type { BrandedFieldMap } from '../utils/branded';
import type { Slug, IsoDateString, AssetPath } from '@/lib/types';

/**
 * Per-type branded field maps matching the design doc.
 */
const BRANDED_FIELD_MAPS: {
  label: string;
  fieldMap: BrandedFieldMap;
  /** Generates a valid data object with string values for all branded fields. */
  genData: (vals: {
    slug: string;
    date?: string;
    asset?: string;
    slugArray?: string[];
  }) => Record<string, unknown>;
}[] = [
  {
    label: 'Page',
    fieldMap: { slugFields: ['slug'], dateFields: [], assetFields: [], slugArrayFields: [] },
    genData: ({ slug }) => ({ title: 'Test', slug }),
  },
  {
    label: 'Project',
    fieldMap: { slugFields: ['slug'], dateFields: [], assetFields: ['image'], slugArrayFields: [] },
    genData: ({ slug, asset }) => ({
      title: 'Test',
      slug,
      description: 'desc',
      image: asset,
    }),
  },
  {
    label: 'BlogPost',
    fieldMap: {
      slugFields: ['slug'],
      dateFields: ['date'],
      assetFields: ['image'],
      slugArrayFields: ['relatedProjects', 'relatedAgents'],
    },
    genData: ({ slug, date, asset, slugArray }) => ({
      title: 'Test',
      slug,
      date,
      image: asset,
      relatedProjects: slugArray,
      relatedAgents: slugArray,
    }),
  },
  {
    label: 'Service',
    fieldMap: { slugFields: ['slug'], dateFields: [], assetFields: [], slugArrayFields: ['relatedProjects'] },
    genData: ({ slug, slugArray }) => ({
      title: 'Test',
      slug,
      description: 'desc',
      relatedProjects: slugArray,
    }),
  },
  {
    label: 'Agent',
    fieldMap: { slugFields: ['slug'], dateFields: [], assetFields: ['portrait'], slugArrayFields: [] },
    genData: ({ slug, asset }) => ({
      name: 'Test',
      slug,
      portrait: asset,
    }),
  },
];

describe('Property 12: Branded type casting preserves values', () => {
  /**
   * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
   *
   * For any content file with branded-type fields, the parsed object SHALL have
   * those fields cast to the corresponding branded type while preserving the
   * original string value.
   */

  // --- Runtime value preservation (fast-check) ---

  for (const { label, fieldMap, genData } of BRANDED_FIELD_MAPS) {
    it(`${label}: branded casting preserves all field values at runtime`, async () => {
      await fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
          fc.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          fc.stringMatching(/^\/assets\/[a-z0-9-]+\.(png|jpg|svg)$/),
          fc.array(fc.stringMatching(/^[a-z][a-z0-9-]{0,15}$/), { minLength: 0, maxLength: 5 }),
          (slug, date, asset, slugArray) => {
            const data = genData({ slug, date, asset, slugArray });

            // Snapshot original values before casting
            const originalSlug = data.slug as string;
            const originalDate = data.date as string | undefined;
            const originalAsset =
              (data.image as string | undefined) ?? (data.portrait as string | undefined);
            const originalRelatedProjects = data.relatedProjects
              ? [...(data.relatedProjects as string[])]
              : undefined;
            const originalRelatedAgents = data.relatedAgents
              ? [...(data.relatedAgents as string[])]
              : undefined;

            applyBrandedCasts(data, fieldMap);

            // Slug field always preserved
            expect(data.slug).toBe(originalSlug);

            // Date field preserved (BlogPost only)
            if (fieldMap.dateFields.includes('date') && originalDate != null) {
              expect(data.date).toBe(originalDate);
            }

            // Asset fields preserved
            for (const assetField of fieldMap.assetFields) {
              if (data[assetField] != null) {
                expect(data[assetField]).toBe(originalAsset);
              }
            }

            // Slug array fields preserved element-by-element
            if (originalRelatedProjects && fieldMap.slugArrayFields.includes('relatedProjects')) {
              expect(data.relatedProjects).toEqual(originalRelatedProjects);
            }
            if (originalRelatedAgents && fieldMap.slugArrayFields.includes('relatedAgents')) {
              expect(data.relatedAgents).toEqual(originalRelatedAgents);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  }

  // --- Compile-time type correctness (expectTypeOf) ---

  it('Page: slug is branded as Slug after casting', () => {
    const data: Record<string, unknown> = { title: 'Test', slug: 'about' };
    applyBrandedCasts(data, BRANDED_FIELD_MAPS[0].fieldMap);

    const slug = data.slug as Slug;
    expectTypeOf(slug).not.toEqualTypeOf<string>();
  });

  it('Project: image is branded as AssetPath after casting', () => {
    const data: Record<string, unknown> = {
      title: 'Test',
      slug: 'proj',
      image: '/assets/img.png',
    };
    applyBrandedCasts(data, BRANDED_FIELD_MAPS[1].fieldMap);

    const image = data.image as AssetPath;
    expectTypeOf(image).not.toEqualTypeOf<string>();
  });

  it('BlogPost: date is branded as IsoDateString after casting', () => {
    const data: Record<string, unknown> = {
      title: 'Test',
      slug: 'post',
      date: '2025-01-15',
      image: '/assets/img.png',
      relatedProjects: ['proj-a'],
      relatedAgents: ['agent-a'],
    };
    applyBrandedCasts(data, BRANDED_FIELD_MAPS[2].fieldMap);

    const date = data.date as IsoDateString;
    expectTypeOf(date).not.toEqualTypeOf<string>();

    const image = data.image as AssetPath;
    expectTypeOf(image).not.toEqualTypeOf<string>();

    const relatedProjects = data.relatedProjects as Slug[];
    expectTypeOf(relatedProjects[0]).not.toEqualTypeOf<string>();
  });

  it('Agent: portrait is branded as AssetPath after casting', () => {
    const data: Record<string, unknown> = {
      name: 'Test',
      slug: 'agent',
      portrait: '/assets/portrait.png',
    };
    applyBrandedCasts(data, BRANDED_FIELD_MAPS[4].fieldMap);

    const portrait = data.portrait as AssetPath;
    expectTypeOf(portrait).not.toEqualTypeOf<string>();
  });

  it('Service: relatedProjects elements are branded as Slug after casting', () => {
    const data: Record<string, unknown> = {
      title: 'Test',
      slug: 'svc',
      description: 'desc',
      relatedProjects: ['proj-a', 'proj-b'],
    };
    applyBrandedCasts(data, BRANDED_FIELD_MAPS[3].fieldMap);

    const relatedProjects = data.relatedProjects as Slug[];
    expectTypeOf(relatedProjects[0]).not.toEqualTypeOf<string>();
  });
});
