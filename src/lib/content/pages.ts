import type { Page } from '@/lib/types';
import type { RawContentFile } from './utils/file-discovery';
import { listContentFiles, readContentFileBySlug } from './utils/file-discovery';
import { validateContent } from './utils/validation';
import { applyBrandedCasts } from './utils/branded';
import { comparePages } from './utils/sorting';

const DIR_CONFIG = { dir: 'content/pages', extensions: ['.mdx'] };
const VALIDATION = { requiredFields: ['title', 'slug'], arrayFields: [] as string[] };
const BRANDED = { slugFields: ['slug'], dateFields: [] as string[], assetFields: [] as string[], slugArrayFields: [] as string[] };

function toPage(raw: RawContentFile): Page {
  validateContent(raw.data, raw.filePath, raw.fileSlug, VALIDATION);
  applyBrandedCasts(raw.data, BRANDED);
  return { ...raw.data, content: raw.body } as Page;
}

export async function getPages(): Promise<Page[]> {
  const files = await listContentFiles(DIR_CONFIG);
  return files.map(toPage).sort(comparePages);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const file = await readContentFileBySlug(DIR_CONFIG, slug);
  if (!file) return null;
  return toPage(file);
}
