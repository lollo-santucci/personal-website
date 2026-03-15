// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Page, Agent } from '@/lib/types';
import type { Slug } from '@/lib/types/common';

vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  getAgentBySlug: vi.fn(),
  renderMDX: vi.fn(),
  getBlogPosts: vi.fn(),
  getProjects: vi.fn(),
}));
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));
vi.mock('@/components/ui/Prose', () => ({
  default: ({ children }: any) => <div data-testid="prose">{children}</div>,
}));
vi.mock('@/components/ui/SectionLabel', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/StatBar', () => ({
  default: ({ label, value }: any) => <div data-testid={`stat-${label}`}>{label}: {value}</div>,
  StatBarGroup: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/RPGSelector', () => ({
  default: () => <span>&gt;</span>,
}));
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, href, ...props }: any) =>
    href ? <a href={href} {...props}>{children}</a> : <button {...props}>{children}</button>,
}));

import { getPageBySlug, getAgentBySlug, renderMDX, getBlogPosts, getProjects } from '@/lib/content';
import AboutPage, { generateMetadata } from '@/app/about/page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    title: 'About Lorenzo',
    slug: 'about' as unknown as Slug,
    content: '# About me',
    ...overrides,
  } as Page;
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'Lorenzo Santucci',
    slug: 'lorenzo-santucci' as unknown as Slug,
    role: 'Full Stack Developer & AI Engineer',
    personality: 'Funny and competent.',
    capabilities: ['full-stack', 'ai'],
    status: 'active' as const,
    index: 1,
    mission: 'Build things that work.',
    bestFor: ['Web apps', 'AI systems'],
    toneOfVoice: { warm: 4, direct: 5, playful: 3, formal: 2, calm: 4 },
    ...overrides,
  };
}

function setupMocks(page: Page | null = makePage(), agent: Agent | null = makeAgent()) {
  vi.mocked(getPageBySlug).mockResolvedValue(page);
  vi.mocked(getAgentBySlug).mockResolvedValue(agent);
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX content</p>);
  vi.mocked(getBlogPosts).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
}

describe('About Page', () => {
  it('displays entity title when about entity is present', async () => {
    setupMocks(makePage({ title: 'About Lorenzo' }));
    const el = await AboutPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'About Lorenzo' })).toBeInTheDocument();
  });

  it('displays "About" fallback when entity is absent', async () => {
    setupMocks(null, null);
    const el = await AboutPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
  });

  it('renders agent sidebar data when agent exists', async () => {
    setupMocks(makePage(), makeAgent({ role: 'AI Engineer', mission: 'Ship great software.' }));
    const el = await AboutPage();
    render(el);
    expect(screen.getByText('AI Engineer')).toBeInTheDocument();
    expect(screen.getByText('Ship great software.')).toBeInTheDocument();
  });

  it('renders bestFor items when agent exists', async () => {
    setupMocks(makePage(), makeAgent({ bestFor: ['Web apps', 'ML pipelines'] }));
    const el = await AboutPage();
    render(el);
    expect(screen.getByText('Web apps')).toBeInTheDocument();
    expect(screen.getByText('ML pipelines')).toBeInTheDocument();
  });

  it('renders tone of voice stat bars when agent exists', async () => {
    setupMocks(makePage(), makeAgent());
    const el = await AboutPage();
    render(el);
    expect(screen.getByTestId('stat-warm')).toBeInTheDocument();
    expect(screen.getByTestId('stat-direct')).toBeInTheDocument();
    expect(screen.getByTestId('stat-playful')).toBeInTheDocument();
    expect(screen.getByTestId('stat-formal')).toBeInTheDocument();
    expect(screen.getByTestId('stat-calm')).toBeInTheDocument();
  });

  it('renders gracefully when agent is null (no sidebar data)', async () => {
    setupMocks(makePage(), null);
    const el = await AboutPage();
    render(el);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // Contact CTA always visible
    expect(screen.getByRole('link', { name: /contact me/i })).toBeInTheDocument();
  });

  it('renders MDX content via Prose', async () => {
    setupMocks();
    const el = await AboutPage();
    render(el);
    expect(screen.getByTestId('prose')).toBeInTheDocument();
  });
});

describe('About Page generateMetadata', () => {
  it('returns entity title and description when entity is present', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(
      makePage({ title: 'About Lorenzo', description: 'Background and skills' }),
    );
    const meta = await generateMetadata();
    expect(meta.title).toBe('About Lorenzo');
    expect(meta.description).toBe('Background and skills');
  });

  it('returns fallback title "About" when entity is absent', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);
    const meta = await generateMetadata();
    expect(meta.title).toBe('About');
  });

  it('includes canonical URL', async () => {
    vi.mocked(getPageBySlug).mockResolvedValue(null);
    const meta = await generateMetadata();
    expect(meta.alternates?.canonical).toBe('/about');
  });
});
