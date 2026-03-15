import type { Agent } from '@/lib/types';

/**
 * Returns text up to the first `\n` in personality.
 * If no `\n` exists, returns the full string.
 */
export function getShortDescription(personality: string): string {
  const newlineIndex = personality.indexOf('\n');
  if (newlineIndex === -1) return personality;
  return personality.slice(0, newlineIndex);
}

/**
 * Returns a new array of agents sorted alphabetically by name.
 * Case-insensitive, locale-aware. Does not mutate the input.
 */
export function sortAgentsByName(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}

/**
 * Returns a new array of agents sorted by index ascending.
 * Does not mutate the input.
 */
export function sortAgentsByIndex(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => a.index - b.index);
}

