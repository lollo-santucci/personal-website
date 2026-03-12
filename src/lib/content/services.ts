import type { Service } from '@/lib/types';
import type { RawContentFile } from './utils/file-discovery';
import { listContentFiles, readContentFileBySlug } from './utils/file-discovery';
import { validateContent } from './utils/validation';
import { applyBrandedCasts } from './utils/branded';
import { compareServices } from './utils/sorting';

const DIR_CONFIG = { dir: 'content/services', extensions: ['.mdx'] };
const VALIDATION = {
  requiredFields: ['title', 'slug', 'description'],
  arrayFields: [] as string[],
};
const BRANDED = {
  slugFields: ['slug'],
  dateFields: [] as string[],
  assetFields: [] as string[],
  slugArrayFields: ['relatedProjects'],
};

function toService(raw: RawContentFile): Service {
  validateContent(raw.data, raw.filePath, raw.fileSlug, VALIDATION);
  applyBrandedCasts(raw.data, BRANDED);
  return { ...raw.data, content: raw.body } as Service;
}

export async function getServices(): Promise<Service[]> {
  const files = await listContentFiles(DIR_CONFIG);
  return files.map(toService).sort(compareServices);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const file = await readContentFileBySlug(DIR_CONFIG, slug);
  if (!file) return null;
  return toService(file);
}
