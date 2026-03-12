import { describe, it, expect } from 'vitest';
import { getLocations, getLocationBySlug } from '../locations';
import { getCharacters, getCharacterBySlug } from '../characters';
import { getDialogues, getDialogueBySlug } from '../dialogues';

describe('Stub loaders', () => {
  describe('locations', () => {
    it('getLocations returns empty array', async () => {
      expect(await getLocations()).toEqual([]);
    });

    it('getLocationBySlug returns null', async () => {
      expect(await getLocationBySlug('any-slug')).toBeNull();
    });
  });

  describe('characters', () => {
    it('getCharacters returns empty array', async () => {
      expect(await getCharacters()).toEqual([]);
    });

    it('getCharacterBySlug returns null', async () => {
      expect(await getCharacterBySlug('any-slug')).toBeNull();
    });
  });

  describe('dialogues', () => {
    it('getDialogues returns empty array', async () => {
      expect(await getDialogues()).toEqual([]);
    });

    it('getDialogueBySlug returns null', async () => {
      expect(await getDialogueBySlug('any-slug')).toBeNull();
    });
  });
});
