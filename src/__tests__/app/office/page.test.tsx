// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/lib/content', () => ({
  getAgents: vi.fn(),
}));

import { getAgents } from '@/lib/content';
import OfficePage from '@/app/office/page';

const mockAgents = [
  {
    name: 'Sales Agent',
    slug: 'sales-agent',
    role: 'Sales specialist',
    personality: 'Friendly',
    capabilities: ['lead gen'],
    status: 'active',
  },
  {
    name: 'Dev Agent',
    slug: 'dev-agent',
    role: 'Developer',
    personality: 'Analytical',
    capabilities: ['coding'],
    status: 'active',
  },
];

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Office index page', () => {
  it('renders heading "Office"', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents as never);

    const element = await OfficePage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Office' }),
    ).toBeInTheDocument();
  });

  it('renders each agent name as a link and role', async () => {
    vi.mocked(getAgents).mockResolvedValue(mockAgents as never);

    const element = await OfficePage();
    render(element);

    const linkA = screen.getByRole('link', { name: 'Sales Agent' });
    expect(linkA).toBeInTheDocument();
    expect(linkA).toHaveAttribute('href', '/office/sales-agent');
    expect(screen.getByText('Sales specialist')).toBeInTheDocument();

    const linkB = screen.getByRole('link', { name: 'Dev Agent' });
    expect(linkB).toBeInTheDocument();
    expect(linkB).toHaveAttribute('href', '/office/dev-agent');
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });

  it('renders empty list when getAgents returns []', async () => {
    vi.mocked(getAgents).mockResolvedValue([]);

    const element = await OfficePage();
    render(element);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Office' }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
