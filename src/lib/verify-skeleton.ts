/**
 * Standalone property test: Directory skeleton completeness
 *
 * **Validates: Requirements R5.1, R5.2**
 *
 * Property 1: For any directory listed in steering/structure.md,
 * that directory SHALL exist on disk, and if it contains no source
 * files, it SHALL contain a `.gitkeep` file.
 *
 * Run with: npx tsx src/lib/verify-skeleton.ts
 */

import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Authoritative directory list from steering/structure.md "Directory Layout"
const EXPECTED_DIRECTORIES = [
  'src/app',
  'src/components',
  'src/lib',
  'src/world',
  'src/styles',
  'content/pages',
  'content/projects',
  'content/blog',
  'content/agents',
  'content/locations',
  'content/characters',
  'content/dialogues',
  'content/services',
  'public/assets',
];

const SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.mdx',
  '.md',
  '.yaml',
  '.yml',
  '.json',
  '.ico',
  '.svg',
];

const projectRoot = join(__dirname, '..', '..');

function hasSourceFiles(dirPath: string): boolean {
  const entries = readdirSync(dirPath);
  return entries.some(
    (entry) =>
      entry !== '.gitkeep' &&
      SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)),
  );
}

let failures = 0;

for (const dir of EXPECTED_DIRECTORIES) {
  const fullPath = join(projectRoot, dir);

  // Check 1: directory exists (R5.1)
  if (!existsSync(fullPath)) {
    console.error(`FAIL: directory missing — ${dir}`);
    failures++;
    continue;
  }

  // Check 2: empty directories have .gitkeep (R5.2)
  if (!hasSourceFiles(fullPath)) {
    const gitkeepPath = join(fullPath, '.gitkeep');
    if (!existsSync(gitkeepPath)) {
      console.error(`FAIL: empty directory missing .gitkeep — ${dir}`);
      failures++;
    } else {
      console.log(`OK: ${dir} (empty, has .gitkeep)`);
    }
  } else {
    console.log(`OK: ${dir} (has source files)`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${EXPECTED_DIRECTORIES.length} directories verified.`);
  process.exit(0);
}
