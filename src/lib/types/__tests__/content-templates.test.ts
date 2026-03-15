/**
 * Test infrastructure and parameterized tests for content template–TypeScript alignment.
 *
 * Verifies that template files in content/ accurately mirror the TypeScript
 * interfaces in src/lib/types/ — field sets, optionality, enum values, and
 * branded type documentation.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Types for the metadata map
// ---------------------------------------------------------------------------

type Optionality = 'required' | 'optional' | 'conditional';

interface FieldMeta {
  optionality: Optionality;
  /** For string literal unions — the set of allowed values. */
  enumValues?: string[];
  /** Branded type name if applicable (Slug, IsoDateString, AssetPath, DialogueId, LineId). */
  brandedType?: string;
}

interface ContentTypeMeta {
  /** Relative path from workspace root to the template file. */
  templatePath: string;
  /** 'mdx' or 'yaml' */
  format: 'mdx' | 'yaml';
  /** Top-level fields (excluding `content` for MDX types). */
  fields: Record<string, FieldMeta>;
}

// ---------------------------------------------------------------------------
// Hand-maintained metadata map — derived from TS interfaces in src/lib/types/
// ---------------------------------------------------------------------------

const CONTENT_TYPES: Record<string, ContentTypeMeta> = {
  Page: {
    templatePath: 'content/pages/_template.mdx',
    format: 'mdx',
    fields: {
      title: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      description: { optionality: 'optional' },
    },
  },

  Project: {
    templatePath: 'content/projects/_template.mdx',
    format: 'mdx',
    fields: {
      title: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      description: { optionality: 'required' },
      stack: { optionality: 'required' },
      categories: { optionality: 'required' },
      status: {
        optionality: 'required',
        enumValues: ['completed', 'in-progress', 'ongoing'],
      },
      highlight: { optionality: 'required' },
      links: { optionality: 'optional' },
      image: { optionality: 'optional', brandedType: 'AssetPath' },
      order: { optionality: 'optional' },
    },
  },

  BlogPost: {
    templatePath: 'content/blog/_template.mdx',
    format: 'mdx',
    fields: {
      title: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      excerpt: { optionality: 'required' },
      date: { optionality: 'required', brandedType: 'IsoDateString' },
      categories: { optionality: 'required' },
      tags: { optionality: 'required' },
      image: { optionality: 'optional', brandedType: 'AssetPath' },
      relatedProjects: { optionality: 'optional', brandedType: 'Slug' },
      relatedAgents: { optionality: 'optional', brandedType: 'Slug' },
    },
  },

  Service: {
    templatePath: 'content/services/_template.mdx',
    format: 'mdx',
    fields: {
      title: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      description: { optionality: 'required' },
      relatedProjects: { optionality: 'optional', brandedType: 'Slug' },
      cta: { optionality: 'optional' },
      order: { optionality: 'optional' },
    },
  },

  Agent: {
    templatePath: 'content/agents/_template.yaml',
    format: 'yaml',
    fields: {
      name: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      index: { optionality: 'required' },
      role: { optionality: 'required' },
      personality: { optionality: 'required' },
      mission: { optionality: 'required' },
      bestFor: { optionality: 'required' },
      toneOfVoice: { optionality: 'required' },
      capabilities: { optionality: 'required' },
      status: {
        optionality: 'required',
        enumValues: ['active', 'coming-soon', 'experimental'],
      },
      greeting: { optionality: 'optional' },
      portrait: { optionality: 'optional', brandedType: 'AssetPath' },
      world: { optionality: 'optional' },
      software: { optionality: 'optional' },
    },
  },

  Location: {
    templatePath: 'content/locations/_template.yaml',
    format: 'yaml',
    fields: {
      name: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      description: { optionality: 'required' },
      type: {
        optionality: 'required',
        enumValues: ['interior', 'exterior', 'transition'],
      },
      tileset: { optionality: 'optional', brandedType: 'AssetPath' },
      characters: { optionality: 'optional', brandedType: 'Slug' },
      objects: { optionality: 'optional' },
      transitions: { optionality: 'optional' },
      contentSection: { optionality: 'optional' },
    },
  },

  Character: {
    templatePath: 'content/characters/_template.yaml',
    format: 'yaml',
    fields: {
      name: { optionality: 'required' },
      slug: { optionality: 'required', brandedType: 'Slug' },
      type: {
        optionality: 'required',
        enumValues: ['player', 'companion', 'agent', 'npc', 'merchant'],
      },
      behavior: {
        optionality: 'required',
        enumValues: ['controllable', 'follower', 'stationary', 'patrol'],
      },
      sprite: { optionality: 'optional', brandedType: 'AssetPath' },
      animations: { optionality: 'optional' },
      position: { optionality: 'optional' },
      location: { optionality: 'optional', brandedType: 'Slug' },
      dialogueIds: { optionality: 'optional' },
      agentSlug: { optionality: 'conditional', brandedType: 'Slug' },
    },
  },

  Dialogue: {
    templatePath: 'content/dialogues/_template.yaml',
    format: 'yaml',
    fields: {
      id: { optionality: 'required', brandedType: 'DialogueId' },
      speaker: { optionality: 'required', brandedType: 'Slug' },
      lines: { optionality: 'required' },
    },
  },
};


// ---------------------------------------------------------------------------
// Template file reading helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a path relative to the workspace root (process.cwd()).
 */
function resolvePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Read a file from the workspace root.
 */
function readTemplateFile(relativePath: string): string {
  return fs.readFileSync(resolvePath(relativePath), 'utf-8');
}

/**
 * Extract YAML frontmatter from an MDX file (content between first pair of `---`).
 * Returns the raw YAML string (without delimiters).
 */
function extractFrontmatter(mdxContent: string): string {
  const lines = mdxContent.split('\n');
  let firstDelim = -1;
  let secondDelim = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (firstDelim === -1) {
        firstDelim = i;
      } else {
        secondDelim = i;
        break;
      }
    }
  }

  if (firstDelim === -1 || secondDelim === -1) {
    throw new Error('Could not find frontmatter delimiters (---)');
  }

  return lines.slice(firstDelim + 1, secondDelim).join('\n');
}

/**
 * Get the MDX body content after the closing frontmatter delimiter.
 */
function extractMdxBody(mdxContent: string): string {
  const lines = mdxContent.split('\n');
  let delimCount = 0;
  let closingDelimIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      delimCount++;
      if (delimCount === 2) {
        closingDelimIndex = i;
        break;
      }
    }
  }

  if (closingDelimIndex === -1) {
    throw new Error('Could not find closing frontmatter delimiter');
  }

  return lines.slice(closingDelimIndex + 1).join('\n');
}

// ---------------------------------------------------------------------------
// YAML field parsing helpers (string-based, no js-yaml dependency)
// ---------------------------------------------------------------------------

/**
 * Parsed representation of a single top-level field from a template.
 */
interface ParsedField {
  name: string;
  comment: string;
}

/**
 * Extract top-level field names and their inline comments from YAML content.
 *
 * A "top-level field" is a line that starts with a non-space, non-# character
 * and contains a colon. Lines that are indented (sub-fields) or pure comments
 * are skipped.
 */
function parseTopLevelFields(yamlContent: string): ParsedField[] {
  const fields: ParsedField[] = [];
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    // Skip empty lines, comment-only lines, and indented lines
    if (!line || line.startsWith('#') || line.startsWith(' ') || line.startsWith('\t')) {
      continue;
    }

    // Match: fieldName: value # comment
    // or:    fieldName: # comment
    // or:    fieldName:
    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
    if (match) {
      const fieldName = match[1];
      // Extract inline comment (everything after #, but not inside quoted strings)
      const commentMatch = line.match(/#\s*(.*)/);
      const comment = commentMatch ? commentMatch[1].trim() : '';
      fields.push({ name: fieldName, comment });
    }
  }

  return fields;
}

/**
 * Parse the optionality annotation from a field comment.
 * Looks for REQUIRED, OPTIONAL, or CONDITIONAL at the start of the comment.
 */
function parseOptionality(comment: string): Optionality | null {
  if (/^REQUIRED\b/i.test(comment)) return 'required';
  if (/^OPTIONAL\b/i.test(comment)) return 'optional';
  if (/^CONDITIONAL\b/i.test(comment)) return 'conditional';
  return null;
}

/**
 * Extract enum values from a comment string.
 * Matches patterns like: "completed" | "in-progress" | "ongoing"
 * or: enum: "active" | "coming-soon" | "experimental"
 */
function parseEnumValues(comment: string): string[] {
  const values: string[] = [];
  // Match all quoted strings separated by |
  const enumPattern = /"([^"]+)"/g;
  let match: RegExpExecArray | null;

  // Only extract if the comment contains a pipe-separated pattern
  if (!comment.includes('|')) return values;

  while ((match = enumPattern.exec(comment)) !== null) {
    values.push(match[1]);
  }

  return values;
}

/**
 * Check if a comment mentions a specific branded type.
 * Branded types: Slug, IsoDateString, AssetPath, DialogueId, LineId
 */
function commentMentionsBrandedType(comment: string, brandedType: string): boolean {
  // Match the branded type as a word boundary to avoid partial matches
  const pattern = new RegExp(`\\b${brandedType}\\b`);
  return pattern.test(comment);
}

// ---------------------------------------------------------------------------
// Convenience: get parsed fields for a content type
// ---------------------------------------------------------------------------

/**
 * Read and parse a template file, returning its top-level fields.
 * For MDX files, extracts frontmatter first.
 */
function getTemplateFields(meta: ContentTypeMeta): ParsedField[] {
  const content = readTemplateFile(meta.templatePath);
  const yamlContent = meta.format === 'mdx' ? extractFrontmatter(content) : content;
  return parseTopLevelFields(yamlContent);
}

// ---------------------------------------------------------------------------
// Export for use by subsequent test tasks (6.2–6.7)
// ---------------------------------------------------------------------------

export {
  CONTENT_TYPES,
  readTemplateFile,
  extractFrontmatter,
  extractMdxBody,
  parseTopLevelFields,
  parseOptionality,
  parseEnumValues,
  commentMentionsBrandedType,
  getTemplateFields,
};

export type { ContentTypeMeta, FieldMeta, Optionality, ParsedField };


// ---------------------------------------------------------------------------
// Smoke tests — verify the helpers work on actual template files
// ---------------------------------------------------------------------------

describe('Test infrastructure: template parsing helpers', () => {
  describe('extractFrontmatter', () => {
    it('extracts YAML between --- delimiters from MDX', () => {
      const content = readTemplateFile('content/pages/_template.mdx');
      const frontmatter = extractFrontmatter(content);
      expect(frontmatter).toContain('title:');
      expect(frontmatter).toContain('slug:');
      expect(frontmatter).not.toContain('---');
    });

    it('throws when no frontmatter delimiters exist', () => {
      expect(() => extractFrontmatter('no delimiters here')).toThrow(
        'Could not find frontmatter delimiters',
      );
    });
  });

  describe('extractMdxBody', () => {
    it('returns content after closing frontmatter delimiter', () => {
      const content = readTemplateFile('content/pages/_template.mdx');
      const body = extractMdxBody(content);
      expect(body.trim().length).toBeGreaterThan(0);
    });
  });

  describe('parseTopLevelFields', () => {
    it('extracts top-level fields from Page frontmatter', () => {
      const content = readTemplateFile('content/pages/_template.mdx');
      const frontmatter = extractFrontmatter(content);
      const fields = parseTopLevelFields(frontmatter);
      const names = fields.map((f) => f.name);
      expect(names).toContain('title');
      expect(names).toContain('slug');
      expect(names).toContain('description');
    });

    it('skips comment-only and indented lines', () => {
      const yaml = [
        '# Comment line',
        'topField: value # REQUIRED',
        '  nested: value # sub-field',
        'anotherTop: value # OPTIONAL',
      ].join('\n');
      const fields = parseTopLevelFields(yaml);
      const names = fields.map((f) => f.name);
      expect(names).toEqual(['topField', 'anotherTop']);
    });

    it('extracts fields from a YAML template', () => {
      const content = readTemplateFile('content/agents/_template.yaml');
      const fields = parseTopLevelFields(content);
      const names = fields.map((f) => f.name);
      expect(names).toContain('name');
      expect(names).toContain('slug');
      expect(names).toContain('status');
      expect(names).toContain('world');
      expect(names).toContain('software');
    });
  });

  describe('parseOptionality', () => {
    it('detects REQUIRED', () => {
      expect(parseOptionality('REQUIRED — string')).toBe('required');
    });

    it('detects OPTIONAL', () => {
      expect(parseOptionality('OPTIONAL — AssetPath')).toBe('optional');
    });

    it('detects CONDITIONAL', () => {
      expect(parseOptionality('CONDITIONAL — Slug (kebab-case)')).toBe('conditional');
    });

    it('returns null for unrecognized comments', () => {
      expect(parseOptionality('some random comment')).toBeNull();
    });
  });

  describe('parseEnumValues', () => {
    it('extracts enum values from pipe-separated pattern', () => {
      const comment = 'REQUIRED — enum: "active" | "coming-soon" | "experimental"';
      expect(parseEnumValues(comment)).toEqual(['active', 'coming-soon', 'experimental']);
    });

    it('extracts enum values without enum: prefix', () => {
      const comment = 'REQUIRED — "completed" | "in-progress" | "ongoing"';
      expect(parseEnumValues(comment)).toEqual(['completed', 'in-progress', 'ongoing']);
    });

    it('returns empty array when no pipe pattern', () => {
      expect(parseEnumValues('REQUIRED — string')).toEqual([]);
    });
  });

  describe('commentMentionsBrandedType', () => {
    it('detects Slug in comment', () => {
      expect(commentMentionsBrandedType('REQUIRED — Slug (kebab-case, URL-safe)', 'Slug')).toBe(
        true,
      );
    });

    it('detects IsoDateString in comment', () => {
      expect(
        commentMentionsBrandedType('REQUIRED — IsoDateString (ISO 8601 format)', 'IsoDateString'),
      ).toBe(true);
    });

    it('detects AssetPath in comment', () => {
      expect(
        commentMentionsBrandedType('OPTIONAL — AssetPath (file path)', 'AssetPath'),
      ).toBe(true);
    });

    it('detects DialogueId in comment', () => {
      expect(
        commentMentionsBrandedType('REQUIRED — DialogueId (unique identifier)', 'DialogueId'),
      ).toBe(true);
    });

    it('does not false-positive on partial matches', () => {
      expect(commentMentionsBrandedType('REQUIRED — Slug[]', 'SlugArray')).toBe(false);
    });
  });

  describe('getTemplateFields', () => {
    it('returns parsed fields for each content type', () => {
      for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
        const fields = getTemplateFields(meta);
        expect(fields.length, `${typeName} should have at least one field`).toBeGreaterThan(0);
      }
    });
  });

  describe('CONTENT_TYPES metadata completeness', () => {
    it('covers all 8 content types', () => {
      const typeNames = Object.keys(CONTENT_TYPES);
      expect(typeNames).toHaveLength(8);
      expect(typeNames).toEqual(
        expect.arrayContaining([
          'Page',
          'Project',
          'BlogPost',
          'Service',
          'Agent',
          'Location',
          'Character',
          'Dialogue',
        ]),
      );
    });

    it('has 4 MDX types and 4 YAML types', () => {
      const mdx = Object.values(CONTENT_TYPES).filter((m) => m.format === 'mdx');
      const yaml = Object.values(CONTENT_TYPES).filter((m) => m.format === 'yaml');
      expect(mdx).toHaveLength(4);
      expect(yaml).toHaveLength(4);
    });
  });
});

// ---------------------------------------------------------------------------
// Property 1: Template-TypeScript field set alignment (Task 6.2)
// ---------------------------------------------------------------------------

describe('Property 1: Template-TypeScript field set alignment', () => {
  for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
    it(`${typeName} template fields match TS interface fields`, () => {
      const templateFields = getTemplateFields(meta);
      const templateFieldNames = new Set(templateFields.map((f) => f.name));
      const expectedFieldNames = new Set(Object.keys(meta.fields));

      expect(
        templateFieldNames,
        `${typeName}: template fields should exactly match TS interface fields`,
      ).toEqual(expectedFieldNames);
    });
  }
});

// ---------------------------------------------------------------------------
// Property 2: Optionality annotation correctness (Task 6.3)
// ---------------------------------------------------------------------------

describe('Property 2: Optionality annotation correctness', () => {
  for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
    it(`${typeName} template optionality annotations match TS interface`, () => {
      const templateFields = getTemplateFields(meta);

      for (const [fieldName, fieldMeta] of Object.entries(meta.fields)) {
        const templateField = templateFields.find((f) => f.name === fieldName);
        expect(
          templateField,
          `${typeName}.${fieldName}: field should exist in template`,
        ).toBeDefined();

        const parsedOptionality = parseOptionality(templateField!.comment);
        expect(
          parsedOptionality,
          `${typeName}.${fieldName}: should have a REQUIRED/OPTIONAL/CONDITIONAL annotation`,
        ).not.toBeNull();

        expect(
          parsedOptionality,
          `${typeName}.${fieldName}: expected "${fieldMeta.optionality}" but got "${parsedOptionality}"`,
        ).toBe(fieldMeta.optionality);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Property 3: Enum and branded type documentation completeness (Task 6.4)
// ---------------------------------------------------------------------------

describe('Property 3: Enum and branded type documentation completeness', () => {
  for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
    const enumFields = Object.entries(meta.fields).filter(([, fm]) => fm.enumValues);
    const brandedFields = Object.entries(meta.fields).filter(([, fm]) => fm.brandedType);

    if (enumFields.length > 0) {
      describe(`${typeName} enum fields`, () => {
        for (const [fieldName, fieldMeta] of enumFields) {
          it(`${fieldName} lists all enum values`, () => {
            const templateFields = getTemplateFields(meta);
            const templateField = templateFields.find((f) => f.name === fieldName);
            expect(templateField, `${typeName}.${fieldName}: should exist in template`).toBeDefined();

            const parsedValues = parseEnumValues(templateField!.comment);
            for (const expected of fieldMeta.enumValues!) {
              expect(
                parsedValues,
                `${typeName}.${fieldName}: should list "${expected}"`,
              ).toContain(expected);
            }
          });
        }
      });
    }

    if (brandedFields.length > 0) {
      describe(`${typeName} branded type fields`, () => {
        for (const [fieldName, fieldMeta] of brandedFields) {
          it(`${fieldName} mentions ${fieldMeta.brandedType}`, () => {
            const templateFields = getTemplateFields(meta);
            const templateField = templateFields.find((f) => f.name === fieldName);
            expect(templateField, `${typeName}.${fieldName}: should exist in template`).toBeDefined();

            expect(
              commentMentionsBrandedType(templateField!.comment, fieldMeta.brandedType!),
              `${typeName}.${fieldName}: comment should mention "${fieldMeta.brandedType}"`,
            ).toBe(true);
          });
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Property 4: Template naming convention (Task 6.5)
// ---------------------------------------------------------------------------

describe('Property 4: Template naming convention', () => {
  for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
    it(`${typeName} template uses correct _template.{ext} filename`, () => {
      const filename = path.basename(meta.templatePath);
      const expectedExt = meta.format === 'mdx' ? '.mdx' : '.yaml';

      expect(filename, `${typeName}: filename should be _template${expectedExt}`).toBe(
        `_template${expectedExt}`,
      );
      expect(filename.startsWith('_'), `${typeName}: filename should start with _`).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Property 5: Syntactic YAML validity (Task 6.6)
// ---------------------------------------------------------------------------

describe('Property 5: Syntactic YAML validity', () => {
  for (const [typeName, meta] of Object.entries(CONTENT_TYPES)) {
    it(`${typeName} template contains syntactically valid YAML`, () => {
      const content = readTemplateFile(meta.templatePath);

      if (meta.format === 'mdx') {
        // Extracting frontmatter should not throw
        const frontmatter = extractFrontmatter(content);
        expect(frontmatter.length, `${typeName}: frontmatter should not be empty`).toBeGreaterThan(0);

        // Top-level fields should be parseable
        const fields = parseTopLevelFields(frontmatter);
        expect(fields.length, `${typeName}: should have parseable fields`).toBeGreaterThan(0);
      } else {
        // YAML file: top-level fields should be parseable
        const fields = parseTopLevelFields(content);
        expect(fields.length, `${typeName}: should have parseable fields`).toBeGreaterThan(0);
      }

      // Check for obvious syntax errors: unclosed quotes
      const yamlContent = meta.format === 'mdx' ? extractFrontmatter(content) : content;
      const lines = yamlContent.split('\n');
      for (const line of lines) {
        if (line.trimStart().startsWith('#') || line.trim() === '') continue;
        // Strip inline comments before checking quotes
        const commentIdx = line.indexOf(' #');
        const valuePart = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
        const doubleQuotes = (valuePart.match(/"/g) || []).length;
        expect(
          doubleQuotes % 2,
          `${typeName}: unclosed double quote in line: ${line.trim()}`,
        ).toBe(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Property 6: MDX body presence (Task 6.7)
// ---------------------------------------------------------------------------

describe('Property 6: MDX body presence', () => {
  const mdxTypes = Object.entries(CONTENT_TYPES).filter(([, meta]) => meta.format === 'mdx');

  for (const [typeName, meta] of mdxTypes) {
    it(`${typeName} MDX template has non-empty body after frontmatter`, () => {
      const content = readTemplateFile(meta.templatePath);
      const body = extractMdxBody(content);
      expect(
        body.trim().length,
        `${typeName}: MDX body (content field placeholder) should not be empty`,
      ).toBeGreaterThan(0);
    });
  }
});


// ---------------------------------------------------------------------------
// Acceptance criteria: Character discriminated union (Task 7.1, R2.1)
// ---------------------------------------------------------------------------

describe('Acceptance criteria: Character discriminated union (R2.1)', () => {
  const content = readTemplateFile('content/characters/_template.yaml');
  const fields = parseTopLevelFields(content);

  it('agentSlug field exists in the Character template', () => {
    const agentSlugField = fields.find((f) => f.name === 'agentSlug');
    expect(agentSlugField, 'Character template should contain agentSlug field').toBeDefined();
  });

  it('agentSlug has a CONDITIONAL comment explaining type: agent requirement', () => {
    const agentSlugField = fields.find((f) => f.name === 'agentSlug')!;
    const comment = agentSlugField.comment;

    // Comment should mention both "agent" and either "REQUIRED" or "CONDITIONAL"
    expect(
      /agent/i.test(comment),
      `agentSlug comment should mention "agent", got: "${comment}"`,
    ).toBe(true);

    expect(
      /REQUIRED|CONDITIONAL/i.test(comment),
      `agentSlug comment should mention "REQUIRED" or "CONDITIONAL", got: "${comment}"`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Acceptance criteria: Dialogue sub-structures (Task 7.2, R2.2)
// ---------------------------------------------------------------------------

describe('Acceptance criteria: Dialogue sub-structures (R2.2)', () => {
  const content = readTemplateFile('content/dialogues/_template.yaml');

  // Find the lines section: everything after the top-level "lines:" field
  const linesStartIndex = content.indexOf('\nlines:');
  const linesSection = linesStartIndex !== -1 ? content.slice(linesStartIndex) : '';

  it('choices appears within the lines section', () => {
    expect(
      linesSection.includes('choices:'),
      'Dialogue template should contain "choices" within lines section',
    ).toBe(true);
  });

  it('action appears within the lines section', () => {
    expect(
      linesSection.includes('action:'),
      'Dialogue template should contain "action" within lines section',
    ).toBe(true);
  });

  it('condition appears within the lines section', () => {
    expect(
      linesSection.includes('condition:'),
      'Dialogue template should contain "condition" within lines section',
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Acceptance criteria: README sections (Task 7.3, R3.1)
// ---------------------------------------------------------------------------

describe('Acceptance criteria: README sections (R3.1)', () => {
  const content = readTemplateFile('content/README.md');

  const requiredSections = [
    'Directory Structure',
    'Naming Conventions',
    'Authoring Workflow',
    'Field Reference',
    'Slug & Date Formats',
    'Cross-Reference Pattern',
  ];

  for (const section of requiredSections) {
    it(`README contains "${section}" section heading`, () => {
      // Match markdown heading (## Section Name) — account for & vs &amp;
      const normalizedContent = content.replace(/&amp;/g, '&');
      const headingPattern = new RegExp(`^##\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
      expect(
        headingPattern.test(normalizedContent),
        `README should contain "## ${section}" heading`,
      ).toBe(true);
    });
  }
});
