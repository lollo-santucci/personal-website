import type { BlogPost } from '@/lib/types';
import type { RawContentFile } from './utils/file-discovery';
import { listContentFiles, readContentFileBySlug } from './utils/file-discovery';
import { validateContent } from './utils/validation';
import { applyBrandedCasts } from './utils/branded';
import { compareBlogPosts } from './utils/sorting';

const DIR_CONFIG = { dir: 'content/blog', extensions: ['.mdx'] };
const VALIDATION = {
  requiredFields: ['title', 'slug', 'excerpt', 'date', 'categories', 'tags'],
  arrayFields: ['categories', 'tags'],
};
const BRANDED = {
  slugFields: ['slug'],
  dateFields: ['date'],
  assetFields: ['image'],
  slugArrayFields: ['relatedProjects', 'relatedAgents'],
};

function toBlogPost(raw: RawContentFile): BlogPost {
  validateContent(raw.data, raw.filePath, raw.fileSlug, VALIDATION);
  applyBrandedCasts(raw.data, BRANDED);
  return { ...raw.data, content: raw.body } as BlogPost;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const files = await listContentFiles(DIR_CONFIG);
  return files.map(toBlogPost).sort(compareBlogPosts);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const file = await readContentFileBySlug(DIR_CONFIG, slug);
  if (!file) return null;
  return toBlogPost(file);
}
