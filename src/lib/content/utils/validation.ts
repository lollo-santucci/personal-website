/**
 * Content validation utility.
 *
 * Validates parsed content data against per-type rules: required field
 * presence, array shape for array-typed fields, and slug match against
 * the filename-derived canonical slug. Throws on first failure (fail-fast).
 */

/** Validation configuration for a content type. */
export interface ValidationConfig {
  /** Fields that must be present and non-null/non-undefined. */
  requiredFields: string[];
  /** Fields that must be arrays if present. */
  arrayFields: string[];
}

/**
 * Validate a parsed content object.
 *
 * Checks are applied in order — throws on the first failure:
 * 1. Required fields: present and non-null/non-undefined
 * 2. Array fields: if present and non-null, must be arrays
 * 3. Slug match: declared slug must equal filename-derived slug
 *
 * @throws {Error} With descriptive `Content validation error:` message
 */
export function validateContent(
  data: Record<string, unknown>,
  filePath: string,
  fileSlug: string,
  config: ValidationConfig,
): void {
  // 1. Required field presence (R6.1, R6.2, R6.7)
  for (const field of config.requiredFields) {
    if (!(field in data) || data[field] == null) {
      throw new Error(
        `Content validation error: ${filePath} is missing required field "${field}"`,
      );
    }
  }

  // 2. Array field shape (R6.3)
  for (const field of config.arrayFields) {
    if (field in data && data[field] != null && !Array.isArray(data[field])) {
      throw new Error(
        `Content validation error: ${filePath} field "${field}" must be an array`,
      );
    }
  }

  // 3. Slug match against filename-derived slug (R13.6)
  if (data.slug !== fileSlug) {
    throw new Error(
      `Content validation error: ${filePath} declared slug "${String(data.slug)}" does not match filename-derived slug "${fileSlug}"`,
    );
  }
}
