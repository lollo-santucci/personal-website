// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { agentArbitrary } from '@/__tests__/lib/content/agent-utils.test';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent } from '@/lib/types';
import type { Slug, AssetPath } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
  getAgentBySlug: vi.fn(),
}));
class NotFoundError extends Error {
  constructor() {
    super('NEXT_NOT_FOUND');
  }
}
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new NotFoundError();
  }),
}));
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { getAgents, getAgentBySlug } from '@/lib/content';
import { notFound } from 'next/navigation';
import AgentProfilePage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/agentdex/[slug]/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// --- Helpers ---

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'Test Agent',
    slug: 'test-agent' as unknown as Slug,
    role: 'Testing and QA',
    personality: 'Thorough and methodical.\nAlways finds the edge cases.',
    capabilities: ['testing', 'qa', 'automation'],
    status: 'active' as const,
    ...overrides,
  };
}

describe('Agent Profile Page', () => {
  describe('renders required fields', () => {
    it('renders agent name as h1 heading', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent({ name: 'Sales Agent' }));
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      expect(screen.getByRole('heading', { level: 1, name: 'Sales Agent' })).toBeInTheDocument();
    });

    it('renders agent role', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent({ role: 'Sales & Lead Generation' }));
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      expect(screen.getByText('Sales & Lead Generation')).toBeInTheDocument();
    });

    it('renders status badge with correct label', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent({ status: 'experimental' }));
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      expect(screen.getByText('Experimental')).toBeInTheDocument();
    });

    it('renders full personality text including all lines', async () => {
      const personality = 'Thorough and methodical.\nAlways finds the edge cases.';
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent({ personality }));
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      // whitespace-pre-line preserves newlines in the DOM, so match each line individually
      expect(screen.getByText(/Thorough and methodical\./)).toBeInTheDocument();
      expect(screen.getByText(/Always finds the edge cases\./)).toBeInTheDocument();
    });

    it('renders capabilities as list items', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(
        makeAgent({ capabilities: ['testing', 'qa', 'automation'] }),
      );
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      expect(screen.getByText('testing')).toBeInTheDocument();
      expect(screen.getByText('qa')).toBeInTheDocument();
      expect(screen.getByText('automation')).toBeInTheDocument();
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });
  });

  describe('portrait rendering', () => {
    it('renders img with alt text when portrait is present', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(
        makeAgent({
          name: 'Portrait Agent',
          portrait: '/assets/portrait.png' as unknown as AssetPath,
        }),
      );
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      const img = screen.getByRole('img', { name: 'Portrait Agent' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/assets/portrait.png');
    });

    it('does not render img when portrait is absent', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent({ portrait: undefined }));
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      const { container } = render(el);
      expect(container.querySelector('img')).not.toBeInTheDocument();
    });
  });

  describe('ChatPlaceholder', () => {
    it('renders a button with "Start Chat" text', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent());
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      const button = screen.getByRole('button', { name: /start chat/i });
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Start Chat')).toBeInTheDocument();
    });
  });

  describe('back navigation', () => {
    it('renders a link back to /agentdex with "Back to Agentdex" text', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent());
      const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
      render(el);
      const backLink = screen.getByRole('link', { name: /back to agentdex/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/agentdex');
    });
  });

  describe('404 behavior', () => {
    it('calls notFound() when agent is null', async () => {
      vi.mocked(getAgentBySlug).mockResolvedValue(null);
      await expect(
        AgentProfilePage({ params: Promise.resolve({ slug: 'nonexistent' }) }),
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('generateStaticParams', () => {
    it('returns all agent slugs', async () => {
      const agents = [
        makeAgent({ slug: 'alpha-agent' as unknown as Slug }),
        makeAgent({ slug: 'beta-agent' as unknown as Slug }),
      ];
      vi.mocked(getAgents).mockResolvedValue(agents);
      const params = await generateStaticParams();
      expect(params).toEqual([{ slug: 'alpha-agent' }, { slug: 'beta-agent' }]);
    });

    it('returns empty array when no agents exist', async () => {
      vi.mocked(getAgents).mockResolvedValue([]);
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });
});


/** Feature: agentdex-shell, Property 5: Profile metadata is a readable sentence */
describe('Property 5: Profile metadata is a readable sentence', () => {
  /** Validates: Requirements 7.3, 7.4 */

  it('title equals agent name and description is a complete sentence containing name and role', async () => {
    await fc.assert(
      fc.asyncProperty(agentArbitrary, async (agent) => {
        vi.mocked(getAgentBySlug).mockResolvedValue(agent);

        const metadata = await generateMetadata({
          params: Promise.resolve({ slug: String(agent.slug) }),
        });

        // title equals agent name
        expect(metadata.title).toBe(agent.name);

        // description is a string containing both name and role
        expect(typeof metadata.description).toBe('string');
        const desc = metadata.description as string;
        expect(desc).toContain(agent.name);
        expect(desc).toContain(agent.role);

        // description ends with a period (complete sentence)
        expect(desc.endsWith('.')).toBe(true);

        // description is longer than just the raw role value
        expect(desc.length).toBeGreaterThan(agent.role.length);
      }),
      { numRuns: 100 },
    );
  });
});


/** Feature: agentdex-shell, Property 4: Profile page renders required fields and excludes world/software */
describe('Property 4: Profile page renders required fields and excludes world/software', () => {
  /** Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 */

  it('renders name, role, status, personality, capabilities, chat placeholder and excludes world/software', async () => {
    await fc.assert(
      fc.asyncProperty(agentArbitrary, async (agent) => {
        vi.mocked(getAgentBySlug).mockResolvedValue(agent);

        const el = await AgentProfilePage({
          params: Promise.resolve({ slug: String(agent.slug) }),
        });
        const { container } = render(el);

        try {
          // 1. Agent name appears as <h1> heading
          const h1 = container.querySelector('h1');
          expect(h1).not.toBeNull();
          expect(h1!.textContent).toBe(agent.name);

          // 2. Agent role appears in the rendered output
          expect(container.textContent).toContain(agent.role);

          // 3. Full personality text appears
          expect(container.textContent).toContain(agent.personality);

          // 4. Each capability appears as a list item
          const listItems = container.querySelectorAll('li');
          expect(listItems.length).toBe(agent.capabilities.length);
          for (const cap of agent.capabilities) {
            expect(container.textContent).toContain(cap);
          }

          // 5. ChatPlaceholder button is present (button with aria-disabled="true")
          const button = container.querySelector('button[aria-disabled="true"]');
          expect(button).not.toBeNull();

          // 6. When portrait is present, <img> with alt={agent.name} exists
          const img = container.querySelector('img');
          if (agent.portrait) {
            expect(img).not.toBeNull();
            expect(img!.getAttribute('alt')).toBe(agent.name);
          } else {
            // 7. When portrait is absent, no <img> element exists
            expect(img).toBeNull();
          }

          // 8. When world is present, "ufficio" does NOT appear in rendered text
          //    (excluding values that might legitimately appear in other agent fields)
          if (agent.world) {
            const textContent = container.textContent ?? '';
            // Remove the agent's own field values to isolate world leakage
            let sanitized = textContent;
            sanitized = sanitized.replaceAll(agent.name, '');
            sanitized = sanitized.replaceAll(agent.role, '');
            sanitized = sanitized.replaceAll(agent.personality, '');
            for (const cap of agent.capabilities) {
              sanitized = sanitized.replaceAll(cap, '');
            }
            expect(sanitized).not.toContain('ufficio');
          }

          // 9. When software is present, "test-model" does NOT appear in rendered text
          if (agent.software) {
            const textContent = container.textContent ?? '';
            let sanitized = textContent;
            sanitized = sanitized.replaceAll(agent.name, '');
            sanitized = sanitized.replaceAll(agent.role, '');
            sanitized = sanitized.replaceAll(agent.personality, '');
            for (const cap of agent.capabilities) {
              sanitized = sanitized.replaceAll(cap, '');
            }
            expect(sanitized).not.toContain('test-model');
          }
        } finally {
          cleanup();
        }
      }),
      { numRuns: 100 },
    );
  });
});
