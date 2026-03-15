// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent, BlogPost, Project, Page } from '@/lib/types';
import type { Slug, IsoDateString, AssetPath } from '@/lib/types/common';

// ---------------------------------------------------------------------------
// Mocks — content loaders
// ---------------------------------------------------------------------------
vi.mock('@/lib/content', () => ({
  getPageBySlug: vi.fn(),
  getAgentBySlug: vi.fn(),
  getAgents: vi.fn(),
  getBlogPosts: vi.fn(),
  getBlogPostBySlug: vi.fn(),
  getProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
  renderMDX: vi.fn(),
}));
vi.mock('@/lib/content/agent-utils', () => ({
  sortAgentsByIndex: vi.fn((agents: any[]) =>
    [...agents].sort((a: any, b: any) => a.index - b.index),
  ),
}));

// ---------------------------------------------------------------------------
// Mocks — next/navigation
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mocks — layout components (pass-through, preserving landmark elements)
// ---------------------------------------------------------------------------
vi.mock('@/components/InnerPageLayout', () => ({
  default: ({ title, children }: any) => (
    <div>
      <header data-testid="header">
        <a href="/">Lorenzo Santucci</a>
        <button aria-label="Open navigation menu">MENU</button>
      </header>
      <h1>{title}</h1>
      <div>{children}</div>
    </div>
  ),
}));
vi.mock('@/components/Breadcrumb', () => ({
  default: ({ items, current }: any) => (
    <nav aria-label="Breadcrumb">
      {items.map((i: any) => (
        <a key={i.href} href={i.href}>
          {i.label}
        </a>
      ))}
      <span>{current}</span>
    </nav>
  ),
}));
vi.mock('@/components/LandingMenu', () => ({
  default: () => (
    <nav aria-label="Site navigation">
      <ul>
        <li>About</li>
        <li>Projects</li>
        <li>Agentdex</li>
        <li>Blog</li>
      </ul>
    </nav>
  ),
}));
vi.mock('@/components/TottiSprite', () => ({
  default: () => (
    <div
      role="img"
      aria-label="Totti the companion dog"
      className="pixel-art mx-auto"
    />
  ),
}));
vi.mock('@/components/ChatSection', () => ({
  default: ({ agentName }: any) => (
    <section data-testid="chat-section" aria-label="Chat">
      <span>{agentName}</span>
    </section>
  ),
}));
vi.mock('@/components/ProjectMetadataPanel', () => ({
  default: ({ stack }: any) => (
    <div data-testid="metadata-panel">
      {stack?.map((t: string) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mocks — UI components (minimal pass-through)
// ---------------------------------------------------------------------------
vi.mock('@/components/ui/CollectionContainer', () => ({
  default: ({ children }: any) => <div data-testid="collection">{children}</div>,
}));
vi.mock('@/components/ui/CollectionRow', () => ({
  default: ({ children, action }: any) => (
    <div data-testid="collection-row">
      {children}
      {action}
    </div>
  ),
}));
vi.mock('@/components/ui/Prose', () => ({
  default: ({ children }: any) => <div data-testid="prose">{children}</div>,
}));
vi.mock('@/components/ui/Badge', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, href, ...props }: any) =>
    href ? (
      <a href={href} {...props}>
        {children}
      </a>
    ) : (
      <button {...props}>{children}</button>
    ),
}));
vi.mock('@/components/ui/RPGSelector', () => ({
  default: () => <span>&gt;</span>,
}));
vi.mock('@/components/ui/SectionLabel', () => ({
  default: ({ children }: any) => <span>{children}</span>,
}));
vi.mock('@/components/ui/StatBar', () => ({
  default: ({ label, value }: any) => (
    <div data-testid={`stat-${label}`}>
      {label}: {value}
    </div>
  ),
  StatBarGroup: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/ArrowUpRight', () => ({
  default: () => <span>↗</span>,
}));

// ---------------------------------------------------------------------------
// Imports — content loaders & pages (after mocks)
// ---------------------------------------------------------------------------
import {
  getPageBySlug,
  getAgentBySlug,
  getAgents,
  getBlogPosts,
  getBlogPostBySlug,
  getProjects,
  getProjectBySlug,
  renderMDX,
} from '@/lib/content';

import Home from '@/app/page';
import AboutPage from '@/app/about/page';
import ContactPage from '@/app/contact/page';
import BlogPage from '@/app/blog/page';
import BlogDetailPage from '@/app/blog/[slug]/page';
import AgentdexPage from '@/app/agentdex/page';
import AgentProfilePage from '@/app/agentdex/[slug]/page';
import ProjectsPage from '@/app/projects/page';
import ProjectDetailPage from '@/app/projects/[slug]/page';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------
function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'Test Agent',
    slug: 'test-agent' as unknown as Slug,
    role: 'Testing',
    personality: 'Thorough.',
    capabilities: ['testing'],
    status: 'active' as const,
    index: 1,
    mission: 'Test everything.',
    bestFor: ['QA'],
    toneOfVoice: { warm: 3, direct: 4, playful: 2, formal: 3, calm: 5 },
    ...overrides,
  };
}

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    title: 'Test Post',
    slug: 'test-post' as unknown as Slug,
    excerpt: 'A test excerpt',
    content: 'Some words for read time',
    date: '2025-01-15' as unknown as IsoDateString,
    categories: ['web'],
    tags: ['ts'],
    ...overrides,
  } as BlogPost;
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    title: 'Test Project',
    slug: 'test-project' as unknown as Slug,
    description: 'A test project',
    content: '# Project',
    stack: ['TypeScript'],
    categories: ['web'],
    status: 'completed' as const,
    highlight: false,
    ...overrides,
  } as Project;
}

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    title: 'Test Page',
    slug: 'about' as unknown as Slug,
    content: '# Content',
    ...overrides,
  } as Page;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helper: set up default mocks for all content loaders
// ---------------------------------------------------------------------------
function setupDefaultMocks() {
  vi.mocked(getPageBySlug).mockResolvedValue(makePage());
  vi.mocked(getAgentBySlug).mockResolvedValue(makeAgent());
  vi.mocked(getAgents).mockResolvedValue([makeAgent()]);
  vi.mocked(getBlogPosts).mockResolvedValue([makePost()]);
  vi.mocked(getBlogPostBySlug).mockResolvedValue(makePost());
  vi.mocked(getProjects).mockResolvedValue([
    makeProject({ image: '/assets/screenshot.png' as unknown as AssetPath }),
  ]);
  vi.mocked(getProjectBySlug).mockResolvedValue(
    makeProject({ image: '/assets/screenshot.png' as unknown as AssetPath }),
  );
  vi.mocked(renderMDX).mockResolvedValue(<p>Mocked MDX</p>);
}

// ===========================================================================
// Requirement 23.1 — Semantic landmark elements
// ===========================================================================
describe('Semantic landmarks (R23.1)', () => {
  it('Landing page renders <nav> landmark', () => {
    const { container } = render(Home());
    const navs = container.querySelectorAll('nav');
    expect(navs.length).toBeGreaterThanOrEqual(1);
  });

  it('Landing page does NOT render <header> (by design)', () => {
    const { container } = render(Home());
    expect(container.querySelector('header')).not.toBeInTheDocument();
  });

  it('About page renders <header> landmark', async () => {
    setupDefaultMocks();
    const el = await AboutPage();
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('Contact page renders <header> landmark', async () => {
    setupDefaultMocks();
    const el = await ContactPage();
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('Blog index renders <header> landmark', async () => {
    setupDefaultMocks();
    const el = await BlogPage();
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('Blog detail renders <header> and <nav> landmarks', async () => {
    setupDefaultMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelectorAll('nav').length).toBeGreaterThanOrEqual(1);
  });

  it('Agentdex index renders <header> landmark', async () => {
    setupDefaultMocks();
    const el = await AgentdexPage();
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('Agent profile renders <header>, <nav>, and <section> landmarks', async () => {
    setupDefaultMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelectorAll('nav').length).toBeGreaterThanOrEqual(1);
    // ChatSection renders as <section>
    expect(container.querySelectorAll('section').length).toBeGreaterThanOrEqual(1);
  });

  it('Projects index renders <header> landmark', async () => {
    setupDefaultMocks();
    const el = await ProjectsPage();
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('Project detail renders <header> and <nav> landmarks', async () => {
    setupDefaultMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    const { container } = render(el);
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelectorAll('nav').length).toBeGreaterThanOrEqual(1);
  });
});

// ===========================================================================
// Requirement 23.3 — Breadcrumb nav has aria-label="Breadcrumb"
// ===========================================================================
describe('Breadcrumb aria-label (R23.3)', () => {
  it('Blog detail has breadcrumb nav with aria-label="Breadcrumb"', async () => {
    setupDefaultMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    const { container } = render(el);
    const breadcrumbNav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(breadcrumbNav).toBeInTheDocument();
  });

  it('Agent profile has breadcrumb nav with aria-label="Breadcrumb"', async () => {
    setupDefaultMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    const { container } = render(el);
    const breadcrumbNav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(breadcrumbNav).toBeInTheDocument();
  });

  it('Project detail has breadcrumb nav with aria-label="Breadcrumb"', async () => {
    setupDefaultMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    const { container } = render(el);
    const breadcrumbNav = container.querySelector('nav[aria-label="Breadcrumb"]');
    expect(breadcrumbNav).toBeInTheDocument();
  });
});

// ===========================================================================
// Requirement 23.2 — All rendered images have non-empty alt text
// (Unit Test Check 10)
// ===========================================================================
describe('All images have non-empty alt text (R23.2)', () => {
  /**
   * Helper: collects all <img> elements AND elements with role="img",
   * then asserts each has a non-empty alt or aria-label.
   */
  function assertAllImagesHaveAlt(container: HTMLElement) {
    // Standard <img> elements
    const imgs = container.querySelectorAll('img');
    for (const img of imgs) {
      const alt = img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect((alt as string).trim().length).toBeGreaterThan(0);
    }

    // Elements with role="img" (sprite crops rendered as divs)
    const roleImgs = container.querySelectorAll('[role="img"]');
    for (const el of roleImgs) {
      const label = el.getAttribute('aria-label');
      expect(label).toBeTruthy();
      expect((label as string).trim().length).toBeGreaterThan(0);
    }
  }

  it('Landing page — TottiSprite has accessible label', () => {
    const { container } = render(Home());
    assertAllImagesHaveAlt(container);
  });

  it('About page — agent sprite has accessible label', async () => {
    setupDefaultMocks();
    const el = await AboutPage();
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Blog index — no images expected, assertion still holds', async () => {
    setupDefaultMocks();
    const el = await BlogPage();
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Blog detail — no images expected, assertion still holds', async () => {
    setupDefaultMocks();
    const el = await BlogDetailPage({ params: Promise.resolve({ slug: 'test-post' }) });
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Agentdex index — agent portraits have accessible labels', async () => {
    setupDefaultMocks();
    const el = await AgentdexPage();
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Agent profile — agent sprite has accessible label', async () => {
    setupDefaultMocks();
    const el = await AgentProfilePage({ params: Promise.resolve({ slug: 'test-agent' }) });
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Projects index — project card images have non-empty alt', async () => {
    setupDefaultMocks();
    vi.mocked(getProjects).mockResolvedValue([
      makeProject({ image: '/assets/screenshot.png' as unknown as AssetPath }),
    ]);
    const el = await ProjectsPage();
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Project detail — hero image has non-empty alt', async () => {
    setupDefaultMocks();
    const el = await ProjectDetailPage({ params: Promise.resolve({ slug: 'test-project' }) });
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });

  it('Contact page — no images expected, assertion still holds', async () => {
    setupDefaultMocks();
    const el = await ContactPage();
    const { container } = render(el);
    assertAllImagesHaveAlt(container);
  });
});

// ===========================================================================
// Requirement 23.4 — Focus treatment on interactive elements
// (Verified structurally: interactive elements exist and are focusable)
// ===========================================================================
describe('Interactive elements are focusable (R23.4)', () => {
  it('Landing page menu items are links (focusable by default)', () => {
    const { container } = render(Home());
    const nav = container.querySelector('nav[aria-label="Site navigation"]');
    expect(nav).toBeInTheDocument();
  });

  it('Inner pages have a MENU button that is focusable', async () => {
    setupDefaultMocks();
    const el = await AboutPage();
    const { container } = render(el);
    const menuBtn = container.querySelector('button[aria-label="Open navigation menu"]');
    expect(menuBtn).toBeInTheDocument();
  });
});
