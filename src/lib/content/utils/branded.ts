import type { Slug, IsoDateString, AssetPath } from '@/lib/types';

/** Field-to-brand mapping for a content type. */
export interface BrandedFieldMap {
  /** Fields to cast to Slug */
  slugFields: string[];
  /** Fields to cast to IsoDateString */
  dateFields: string[];
  /** Fields to cast to AssetPath (only cast if value is truthy — these are optional) */
  assetFields: string[];
  /** Fields that are Slug[] arrays */
  slugArrayFields: string[];
}

/**
 * Apply branded type casts to a parsed content object.
 * Mutates the object in place for efficiency.
 *
 * Branded types are compile-time only — casting is a no-op at runtime
 * but ensures type safety downstream.
 *
 * NOTE: Agent nested fields (world.location, world.sprite, world.dialogueId)
 * contain branded types but are deferred to the world engine phase.
 * When the world engine spec lands, this module will be extended with
 * dot-path support (e.g. 'world.location' in the field map) rather than
 * special-case logic per type.
 */
export function applyBrandedCasts(
  data: Record<string, unknown>,
  fieldMap: BrandedFieldMap,
): void {
  for (const field of fieldMap.slugFields) {
    if (data[field] != null) {
      data[field] = data[field] as Slug;
    }
  }

  for (const field of fieldMap.dateFields) {
    if (data[field] != null) {
      data[field] = data[field] as IsoDateString;
    }
  }

  for (const field of fieldMap.assetFields) {
    if (data[field]) {
      data[field] = data[field] as AssetPath;
    }
  }

  for (const field of fieldMap.slugArrayFields) {
    if (Array.isArray(data[field])) {
      data[field] = (data[field] as unknown[]).map((el) => el as Slug);
    }
  }
}
