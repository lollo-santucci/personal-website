import type { Agent } from '@/lib/types';
import type { RawContentFile } from './utils/file-discovery';
import { listContentFiles, readContentFileBySlug } from './utils/file-discovery';
import { validateContent } from './utils/validation';
import { applyBrandedCasts } from './utils/branded';

const DIR_CONFIG = { dir: 'content/agents', extensions: ['.yaml', '.json'] };
const VALIDATION = {
  requiredFields: ['name', 'slug', 'role', 'personality', 'capabilities', 'status'],
  arrayFields: ['capabilities'],
};
const BRANDED = {
  slugFields: ['slug'],
  dateFields: [] as string[],
  assetFields: ['portrait'],
  slugArrayFields: [] as string[],
};
// NOTE: Agent nested fields (world.location, world.sprite, world.dialogueId)
// contain branded types but are deferred to the world engine phase.

function toAgent(raw: RawContentFile): Agent {
  validateContent(raw.data, raw.filePath, raw.fileSlug, VALIDATION);
  applyBrandedCasts(raw.data, BRANDED);
  return raw.data as unknown as Agent;
}

export async function getAgents(): Promise<Agent[]> {
  const files = await listContentFiles(DIR_CONFIG);
  return files.map(toAgent);
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const file = await readContentFileBySlug(DIR_CONFIG, slug);
  if (!file) return null;
  return toAgent(file);
}
