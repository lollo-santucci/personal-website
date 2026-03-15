// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
  getBlogPosts: vi.fn(),
  getProjects: vi.fn(),
}));
vi.mock('@/lib/content/agent-utils', () => ({
  sortAgentsByIndex: vi.fn((agents: any[]) => [...agents].sort((a: any, b: any) => a.index - b.index)),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));
vi.mock('@/components/ui/CollectionContainer', () => ({
  default: ({ children }: any) => <div data-testid="collection">{children}</div>,
}));
vi.mock('@/components/ui/CollectionRow', () => ({
  default: ({ children, action }: any) => (
    <div data-testid="collection-row">{children}{action}</div>
  ),
}));
vi.mock('@/components/ui/Badge', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, href, ...props }: any) =>
    href ? <a href={href} {...props}>{children}</a> : <button {...props}>{children}</button>,
}));
vi.mock('@/components/ui/RPGSelector', () => ({
  default: () => <span>&gt;</span>,
}));

import { getAgents, getBlogPosts, getProjects } from '@/lib/content';
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
    index: 1,
    mission: 'Test everything.',
    bestFor: ['QA'],
    toneOfVoice: { warm: 3, direct: 4, playful: 2, formal: 3, calm: 5 },
    ...overrides,
  };
}

function setupMocks(agents: Agent[] = []) {
  vi.mocked(getAgents).mockResolvedValue(agents);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('Agentdex Index Page', () => {
  it('renders the Agentdex heading', async () => {
    setupMocks([makeAgent()]);
    const el = await AgentdexPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Agentdex' })).toBeInTheDocument();
  });

  it('renders agents sorted by index in collection rows', async () => {
    const agents = [
      makeAgent({ name: 'Zeta Agent', slug: 'zeta' as unknown as Slug, index: 3 }),
      makeAgent({ name: 'Alpha Agent', slug: 'alpha' as unknown as Slug, index: 1 }),
      makeAgent({ name: 'Beta Agent', slug: 'beta' as unknown as Slug, index: 2 }),
    ];
    setupMocks(agents);
    const el = await AgentdexPage();
    render(el);

    const rows = screen.getAllByTestId('collection-row');
    expect(rows).toHaveLength(3);
    // sortAgentsByIndex mock sorts by index ascending
    expect(rows[0].textContent).toContain('Alpha Agent');
    expect(rows[1].textContent).toContain('Beta Agent');
    expect(rows[2].textContent).toContain('Zeta Agent');
  });

  it('renders formatted index numbers (3 digits)', async () => {
    setupMocks([makeAgent({ index: 7 })]);
    const el = await AgentdexPage();
    render(el);
    expect(screen.getByText('007')).toBeInTheDocument();
  });

  it('renders "Meet" buttons linking to agent profile pages', async () => {
    setupMocks([makeAgent({ slug: 'my-agent' as unknown as Slug })]);
    const el = await AgentdexPage();
    render(el);
    const meetLink = screen.getByRole('link', { name: 'Meet' });
    expect(meetLink).toHaveAttribute('href', '/agentdex/my-agent');
  });

  it('displays empty state message when no agents exist', async () => {
    setupMocks([]);
    const el = await AgentdexPage();
    render(el);
    expect(screen.getByText(/no agents yet/i)).toBeInTheDocument();
  });

  it('has static metadata with title "Agentdex"', () => {
    expect(metadata.title).toBe('Agentdex');
    expect(typeof metadata.description).toBe('string');
    expect((metadata.description as string).length).toBeGreaterThan(20);
    expect(metadata.alternates?.canonical).toBe('/agentdex');
  });
});
