// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
  getAgentBySlug: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

import * as fc from 'fast-check';
import { getAgents, getAgentBySlug } from '@/lib/content';
import { notFound } from 'next/navigation';
import AgentProfilePage, {
  generateStaticParams,
} from '@/app/office/[slug]/page';

const mockAgent = {
  name: 'Sales Agent',
  slug: 'sales-agent',
  role: 'Sales specialist',
  personality: 'Friendly and persuasive',
  capabilities: ['lead gen', 'outreach', 'closing'],
  status: 'active',
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Agent profile page', () => {
  it('renders agent name, role, personality, and capabilities when agent exists', async () => {
    vi.mocked(getAgentBySlug).mockResolvedValue(mockAgent as never);

    const element = await AgentProfilePage({
      params: Promise.resolve({ slug: 'sales-agent' }),
    });
    render(element as React.ReactElement);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Sales Agent' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sales specialist')).toBeInTheDocument();
    expect(screen.getByText('Friendly and persuasive')).toBeInTheDocument();
    expect(screen.getByText('lead gen')).toBeInTheDocument();
    expect(screen.getByText('outreach')).toBeInTheDocument();
    expect(screen.getByText('closing')).toBeInTheDocument();
  });

  it('calls notFound() when getAgentBySlug returns null', async () => {
    vi.mocked(getAgentBySlug).mockResolvedValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });

    await expect(
      AgentProfilePage({
        params: Promise.resolve({ slug: 'nonexistent' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalled();
  });
});

describe('Property 4: generateStaticParams covers all known agent slugs', () => {
  /**
   * Validates: Requirements 8.4
   *
   * For any array of agents, generateStaticParams() returns params
   * for every slug and no extras.
   */
  it('returns params matching every agent slug exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            slug: fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
            name: fc.constant('N'),
            role: fc.constant('R'),
            personality: fc.constant('P'),
            capabilities: fc.constant([]),
            status: fc.constant('active' as const),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        async (agents) => {
          vi.mocked(getAgents).mockResolvedValue(agents as never);

          const params = await generateStaticParams();

          const inputSlugs = agents.map((a) => String(a.slug));
          const outputSlugs = params.map((p) => p.slug);

          expect(outputSlugs).toHaveLength(inputSlugs.length);
          expect(outputSlugs).toEqual(expect.arrayContaining(inputSlugs));
          expect(inputSlugs).toEqual(expect.arrayContaining(outputSlugs));
        },
      ),
      { numRuns: 100 },
    );
  });
});
