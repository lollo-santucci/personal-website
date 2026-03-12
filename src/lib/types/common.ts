/**
 * Shared utility types for the content system.
 *
 * These are compile-time semantic markers — they communicate intent in type
 * signatures and prevent accidental misuse of raw strings. Format validation
 * (kebab-case, ISO 8601, valid paths, etc.) is performed by the content loader
 * at runtime, as defined in the content-loader spec.
 */

/**
 * URL-safe kebab-case content identifier.
 * Format validation is deferred to the content loader.
 */
export type Slug = string & { readonly __brand: unique symbol };

/**
 * ISO 8601 date string (e.g. `2025-01-15`).
 * Format validation is deferred to the content loader.
 */
export type IsoDateString = string & { readonly __brand: unique symbol };

/**
 * File path referencing a visual asset (sprite, portrait, tileset, image).
 * Format validation is deferred to the content loader.
 */
export type AssetPath = string & { readonly __brand: unique symbol };

/**
 * Dialogue content identifier, used in `Dialogue.id` and cross-references.
 * Format validation is deferred to the content loader.
 */
export type DialogueId = string & { readonly __brand: unique symbol };

/**
 * Dialogue line identifier, used in `DialogueLine.id` and `nextLineId` references.
 * Format validation is deferred to the content loader.
 */
export type LineId = string & { readonly __brand: unique symbol };

/** 2D coordinate used for world positioning. */
export interface Position2D {
  x: number;
  y: number;
}

/** Valid spatial directions for location transitions. */
export type TransitionDirection =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'up'
  | 'down';
