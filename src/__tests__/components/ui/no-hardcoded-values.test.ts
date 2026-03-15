import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

/**
 * Feature: design-system-foundations, Property 1: No hardcoded color values in component markup
 *
 * Validates: Requirements 1.9, 4.4
 *
 * Scans all src/components/ui/*.tsx files for raw hex color patterns.
 * Components should reference Tailwind theme tokens or CSS custom properties,
 * never hardcoded hex values like #fc5c46 or #222222.
 *
 * The regex /#[0-9a-fA-F]{3,8}/g naturally excludes:
 * - Tailwind arbitrary value syntax (text-[128px], border-[6px]) — no # prefix
 * - Standard Tailwind utility classes (border-2, gap-3) — no # prefix
 * - SVG dimensions (width="16" height="16") — no # prefix
 * - PixelImage computed dimensions — no # prefix
 */
describe('Feature: design-system-foundations, Property 1: No hardcoded color values in component markup', () => {
  it('should have no hardcoded hex color values in any ui component file', () => {
    const uiDir = path.resolve(process.cwd(), 'src/components/ui');
    const files = readdirSync(uiDir).filter((f) => f.endsWith('.tsx'));

    expect(files.length).toBeGreaterThan(0);

    const hexPattern = /#[0-9a-fA-F]{3,8}/g;
    const violations: { file: string; matches: string[] }[] = [];

    for (const file of files) {
      const filePath = path.join(uiDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const matches = content.match(hexPattern);

      if (matches) {
        violations.push({ file, matches });
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map((v) => `  ${v.file}: ${v.matches.join(', ')}`)
        .join('\n');

      expect.fail(
        `Found hardcoded hex color values in component files:\n${report}`
      );
    }
  });
});
