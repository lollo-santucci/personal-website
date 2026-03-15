// Unit Test Check 9: No hardcoded pixel values in page components
//
// Scans src/app/ page files for hardcoded pixel patterns in className strings.
// Permitted exceptions:
//   - Tailwind arbitrary values at xl breakpoint for typography (e.g., xl:text-[128px], xl:leading-[40px])
//   - SVG intrinsic dimensions (width/height attributes, not in className)
//   - PixelImage computed dimensions (inline style, not in className)
//
// Validates: Requirements 21.6

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGE_FILES = [
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/[slug]/page.tsx',
  'src/app/agentdex/page.tsx',
  'src/app/agentdex/[slug]/page.tsx',
  'src/app/projects/page.tsx',
  'src/app/projects/[slug]/page.tsx',
];

// Matches Tailwind arbitrary pixel values, including optional responsive prefix.
// e.g., `w-[100px]`, `xl:text-[128px]`, `md:gap-[20px]`
const HARDCODED_PX_PATTERN = /(?:\w+:)?[\w-]+-\[\d+px\]/g;

// Permitted: xl-breakpoint typography utilities (xl:text-[Npx], xl:leading-[Npx])
const PERMITTED_PATTERN = /^xl:(text|leading)-\[\d+px\]$/;

function findDisallowedPixelValues(content: string): string[] {
  const matches = content.match(HARDCODED_PX_PATTERN) ?? [];
  return matches.filter((match) => !PERMITTED_PATTERN.test(match));
}

describe('No hardcoded pixel values in page components', () => {
  it.each(PAGE_FILES)('%s has no disallowed hardcoded pixel values in className strings', (filePath) => {
    const absolutePath = resolve(process.cwd(), filePath);
    const content = readFileSync(absolutePath, 'utf-8');
    const violations = findDisallowedPixelValues(content);

    expect(violations).toEqual([]);
  });
});
