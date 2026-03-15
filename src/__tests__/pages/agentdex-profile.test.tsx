// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
  getAgentBySlug: vi.fn(),
  getBlogPosts: vi.fn(),
  getProjects: vi.fn(),
}));
class NotFoundError extends Error {
  constructor() { super('NEXT_NOT_FOUND'); }
}
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => { throw new NotFoundError(); }),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div><h1>{title}</h1><div>{children}</div></div>
  ),
}));
vi.mock('@/components/Breadcrumb', () => ({
  default: ({ items, current }: any) => (
    <nav aria-label="Breadcrumb">
      {items.map((i: any) => <a key={i.href} href={i.href}>{i.label}</a>)}
      <span>{current}</span>
    </nav>
  ),
}));
vi.mock('@/components/ChatSection', () => ({
  default: ({ agentName, greeting }: any) => (
    <section data-testid="chat-section">
      <span>{agentName}</span>
      {greeting && <span>{greeting}</span>}
    </section>
  ),
}));
vi.mock('@/components/ui/SectionLabel', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/RPGSelector', () => ({
  default: () => <span>&gt;</span>,
}));
vi.mock('@/components/ui/StatBar', () => ({
  default: ({ label, value }: any) => <div data-testid={`stat-${label}`}>{label}: {value}</div>,
  StatBarGroup: ({ children }: any) => <div>{children}</div>,
}));

import { getAgents, getAgentBySlug, getBlogPosts, getProjects } from '@/lib/content';
import { notFound } from 'next/navigation';
import AgentProfilePage, {
  generateMetadata,
  generateStaticParams,
} from '@/app/agentdex/[slug]/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'Test Agent',
    slug: 'test-agent' as unknown as Slug,
    role: 'Testing and QA',
    personality: 'Thorough and methodical.',
    capabilities: ['testing', 'qa'],
    status: 'active' as const,
    index: 42,
    mission: 'Find all the bugs.',
    bestFor: ['Unit testing', 'Integration testing'],
    toneOfVoice: { warm: 3, direct: 5, playful: 2, formal: 4, calm: 3 },
    ...overrides,
  };
}

function setupMocks(agent: Agent | null = makeAgent()) {
  vi.mocked(getAgentBySlug).mockResolvedValue(agent);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('Agent Profile Page', () => {
  it('renders agent name as h1 heading', async () => {
    setupMocks(makeAgent({ name: 'Sales Agent' }));
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'Sales Agent' })).toBeInTheDocument();
  });

  it('renders agent role', async () => {
    setupMocks(makeAgent({ role: 'Sales & Lead Generation' }));
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByText('Sales & Lead Generation')).toBeInTheDocument();
  });

  it('renders bestFor items', async () => {
    setupMocks(makeAgent({ bestFor: ['Cold outreach', 'Lead scoring'] }));
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByText('Cold outreach')).toBeInTheDocument();
    expect(screen.getByText('Lead scoring')).toBeInTheDocument();
  });

  it('renders mission text', async () => {
    setupMocks(makeAgent({ mission: 'Close every deal.' }));
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByText('Close every deal.')).toBeInTheDocument();
  });

  it('renders tone of voice stat bars', async () => {
    setupMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByTestId('stat-warm')).toBeInTheDocument();
    expect(screen.getByTestId('stat-direct')).toBeInTheDocument();
    expect(screen.getByTestId('stat-playful')).toBeInTheDocument();
    expect(screen.getByTestId('stat-formal')).toBeInTheDocument();
    expect(screen.getByTestId('stat-calm')).toBeInTheDocument();
  });

  it('renders formatted index number', async () => {
    setupMocks(makeAgent({ index: 7 }));
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByText('#007')).toBeInTheDocument();
  });

  it('renders ChatSection', async () => {
    setupMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    expect(screen.getByTestId('chat-section')).toBeInTheDocument();
  });

  it('renders breadcrumb with link to /agentdex', async () => {
    setupMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    render(el);
    const breadcrumbLink = screen.getByRole('link', { name: 'Agentdex' });
    expect(breadcrumbLink).toHaveAttribute('href', '/agentdex');
  });

  it('calls notFound() when agent is null', async () => {
    setupMocks(null);
    await expect(
      AgentProfilePage({ params: Promise.resolve({ slug: 'nonexistent' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });
});

describe('Agent Profile generateStaticParams', () => {
  it('returns all agent slugs', async () => {
    vi.mocked(getAgents).mockResolvedValue([
      makeAgent({ slug: 'alpha-agent' as unknown as Slug }),
      makeAgent({ slug: 'beta-agent' as unknown as Slug }),
    ]);
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: 'alpha-agent' }, { slug: 'beta-agent' }]);
  });

  it('returns empty array when no agents exist', async () => {
    vi.mocked(getAgents).mockResolvedValue([]);
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });
});

describe('Agent Profile generateMetadata', () => {
  it('returns agent name as title and role+mission as description', async () => {
    vi.mocked(getAgentBySlug).mockResolvedValue(
      makeAgent({ name: 'Sales Agent', role: 'Sales', mission: 'Close deals.' }),
    );
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'sales-agent' }) });
    expect(meta.title).toBe('Sales Agent');
    expect(meta.description).toBe('Sales. Close deals.');
  });

  it('returns empty object when agent not found', async () => {
    vi.mocked(getAgentBySlug).mockResolvedValue(null);
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
    expect(meta).toEqual({});
  });

  it('includes canonical URL', async () => {
    vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent());
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'test-agent' }) });
    expect(meta.alternates?.canonical).toBe('/agentdex/test-agent');
  });
});
