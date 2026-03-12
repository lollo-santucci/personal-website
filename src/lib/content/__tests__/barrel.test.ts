import { describe, it, expect } from 'vitest';
import * as contentModule from '../index';

const EXPECTED_EXPORTS = [
  'getPages',
  'getPageBySlug',
  'getProjects',
  'getProjectBySlug',
  'getBlogPosts',
  'getBlogPostBySlug',
  'getServices',
  'getServiceBySlug',
  'getAgents',
  'getAgentBySlug',
  'getLocations',
  'getLocationBySlug',
  'getCharacters',
  'getCharacterBySlug',
  'getDialogues',
  'getDialogueBySlug',
  'renderMDX',
] as const;

describe('Barrel export', () => {
  it.each(EXPECTED_EXPORTS)('exports %s as a function', (name) => {
    expect(typeof (contentModule as Record<string, unknown>)[name]).toBe('function');
  });
});
