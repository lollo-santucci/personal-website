import type { Character } from '@/lib/types';

// Implementation deferred to the world engine spec.

export async function getCharacters(): Promise<Character[]> {
  return [];
}

export async function getCharacterBySlug(slug: string): Promise<Character | null> {
  return null;
}
