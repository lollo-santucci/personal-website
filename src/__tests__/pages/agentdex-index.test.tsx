// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getAgents } from '@/lib/content';
import AgentdexPage, { metadata } from '@/app/agentdex/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'Test Agent',
    slug: 'test-agent' as unknown as Slug,
    role: 'Testing',
    personality: 'Helpful and thorough.',
    capabilities: ['testing'],
    status: 'active' as const,
    ...overrides,
  };
}

describe('Agentdex Index Page', () => {
  describe('heading and intro text', () => {
    it('renders the Agentdex heading', async () => {
      vi.mocked(getAgents).mockResolvedValue([makeAgent()]);

      const el = await AgentdexPage();
      render(el);

      expect(screen.getByRole('heading', { level: 1, name: 'Agentdex' })).toBeInTheDocument();
    });

    it('renders introductory text', async () => {
      vi.mocked(getAgents).mockResolvedValue([makeAgent()]);

      const el = await AgentdexPage();
      render(el);

      expect(screen.getByText(/AI agents/i)).toBeInTheDocument();
    });
  });

  describe('sorted agent rendering', () => {
    it('renders agents in alphabetical order regardless of input order', async () => {
      const agents = [
        makeAgent({ name: 'Zeta Agent', slug: 'zeta-agent' as unknown as Slug }),
        makeAgent({ name: 'Alpha Agent', slug: 'alpha-agent' as unknown as Slug }),
        makeAgent({ name: 'Beta Agent', slug: 'beta-agent' as unknown as Slug }),
      ];
      vi.mocked(getAgents).mockResolvedValue(agents);

      const el = await AgentdexPage();
      const { container } = render(el);

      const grid = container.querySelector('.grid')!;
      const cardArticles = grid.querySelectorAll('article');
      expect(cardArticles).toHaveLength(3);

      const names = Array.from(cardArticles).map(
        (article) => article.querySelector('h2')!.textContent,
      );
      expect(names).toEqual(['Alpha Agent', 'Beta Agent', 'Zeta Agent']);
    });
  });

  describe('empty state', () => {
    it('displays empty state message when no agents exist', async () => {
      vi.mocked(getAgents).mockResolvedValue([]);

      const el = await AgentdexPage();
      render(el);

      expect(screen.getByText('No agents yet.')).toBeInTheDocument();
    });

    it('does not render a grid when empty', async () => {
      vi.mocked(getAgents).mockResolvedValue([]);

      const el = await AgentdexPage();
      const { container } = render(el);

      expect(container.querySelector('.grid')).toBeNull();
    });
  });

  describe('static metadata', () => {
    it('has title "Agentdex"', () => {
      expect(metadata.title).toBe('Agentdex');
    });

    it('has a readable description about AI agents', () => {
      expect(typeof metadata.description).toBe('string');
      expect((metadata.description as string).length).toBeGreaterThan(20);
      expect(metadata.description).toMatch(/agent/i);
    });
  });
});
