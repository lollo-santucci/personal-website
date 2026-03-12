import type { Dialogue } from '@/lib/types';

// Implementation deferred to the world engine spec.

export async function getDialogues(): Promise<Dialogue[]> {
  return [];
}

export async function getDialogueBySlug(slug: string): Promise<Dialogue | null> {
  return null;
}
