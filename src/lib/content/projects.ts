import type { Project } from '@/lib/types';
import type { RawContentFile } from './utils/file-discovery';
import { listContentFiles, readContentFileBySlug } from './utils/file-discovery';
import { validateContent } from './utils/validation';
import { applyBrandedCasts } from './utils/branded';
import { compareProjects } from './utils/sorting';

const DIR_CONFIG = { dir: 'content/projects', extensions: ['.mdx'] };
const VALIDATION = {
  requiredFields: ['title', 'slug', 'description', 'stack', 'categories', 'status', 'highlight'],
  arrayFields: ['stack', 'categories'],
};
const BRANDED = {
  slugFields: ['slug'],
  dateFields: [] as string[],
  assetFields: ['image'],
  slugArrayFields: [] as string[],
};

function toProject(raw: RawContentFile): Project {
  validateContent(raw.data, raw.filePath, raw.fileSlug, VALIDATION);
  applyBrandedCasts(raw.data, BRANDED);
  return { ...raw.data, content: raw.body } as Project;
}

export async function getProjects(): Promise<Project[]> {
  const files = await listContentFiles(DIR_CONFIG);
  return files.map(toProject).sort(compareProjects);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const file = await readContentFileBySlug(DIR_CONFIG, slug);
  if (!file) return null;
  return toProject(file);
}
