import type { Location } from '@/lib/types';

// Implementation deferred to the world engine spec.

export async function getLocations(): Promise<Location[]> {
  return [];
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return null;
}
