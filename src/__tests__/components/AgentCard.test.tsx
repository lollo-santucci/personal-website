// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { Agent } from '@/lib/types';
import type { Slug, AssetPath } from '@/lib/types/common';
import AgentCard from '@/components/AgentCard';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => cleanup());

const baseAgent: Agent = {
  name: 'Sales Agent',
  slug: 'sales-agent' as unknown as Slug,
  role: 'Sales & Lead Generation',
  personality:
    'Charming, persuasive, and always closing.\nNever takes no for an answer.',
  capabilities: ['lead-gen', 'outreach', 'crm'],
  status: 'coming-soon',
  portrait: '/assets/agents/sales-agent.png' as unknown as AssetPath,
};

const agentNoPortrait: Agent = {
  name: 'Code Review Agent',
  slug: 'code-review-agent' as unknown as Slug,
  role: 'Automated code review and quality analysis',
  personality: 'Meticulous, constructive, and occasionally pedantic.',
  capabilities: ['code-review', 'static-analysis'],
  status: 'experimental',
};

describe('AgentCard', () => {
  it('renders agent name as heading', () => {
    render(<AgentCard agent={baseAgent} />);
    expect(
      screen.getByRole('heading', { name: baseAgent.name }),
    ).toBeInTheDocument();
  });

  it('renders agent role', () => {
    render(<AgentCard agent={baseAgent} />);
    expect(screen.getByText(baseAgent.role)).toBeInTheDocument();
  });

  it('renders status badge with correct label', () => {
    render(<AgentCard agent={baseAgent} />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders short description, not full personality', () => {
    render(<AgentCard agent={baseAgent} />);
    // Multi-line personality — only first line should appear
    expect(
      screen.getByText('Charming, persuasive, and always closing.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Never takes no for an answer.'),
    ).not.toBeInTheDocument();
  });

  it('links to /agentdex/{slug}', () => {
    render(<AgentCard agent={baseAgent} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/agentdex/sales-agent');
  });

  it('renders portrait image with alt text when portrait is present', () => {
    render(<AgentCard agent={baseAgent} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', baseAgent.name);
    expect(img).toHaveAttribute('src', baseAgent.portrait);
  });

  it('does not render an image when portrait is absent', () => {
    render(<AgentCard agent={agentNoPortrait} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

import * as fc from 'fast-check';
import { agentArbitrary } from '@/__tests__/lib/content/agent-utils.test';
import { getShortDescription } from '@/lib/content/agent-utils';

/** Feature: agentdex-shell, Property 3: AgentCard renders complete content */
describe('AgentCard — Property 3: AgentCard renders complete content', () => {
  /** Validates: Requirements 2.3, 2.4, 2.5, 4.1, 4.2, 4.3 */

  it('renders all required fields, correct link, and conditional portrait for any agent', () => {
    fc.assert(
      fc.property(agentArbitrary, (agent) => {
        cleanup();
        const { container } = render(<AgentCard agent={agent} />);

        // 1. Agent name appears as heading
        const heading = container.querySelector('h2');
        expect(heading).not.toBeNull();
        expect(heading!.textContent).toBe(agent.name);

        // 2. Agent role appears in the rendered output
        const paragraphs = container.querySelectorAll('p');
        const allText = Array.from(paragraphs).map((p) => p.textContent);
        expect(allText).toContain(agent.role);

        // 3. Short description appears, not full personality if multi-line
        const shortDesc = getShortDescription(agent.personality);
        expect(allText).toContain(shortDesc);
        if (agent.personality.includes('\n')) {
          const secondLine = agent.personality.split('\n')[1];
          if (secondLine && secondLine.trim().length > 0) {
            expect(allText).not.toContain(secondLine);
          }
        }

        // 4. Link href is /agentdex/{slug}
        const link = container.querySelector('a');
        expect(link).not.toBeNull();
        expect(link!.getAttribute('href')).toBe(`/agentdex/${agent.slug}`);

        // 5. Portrait present → <img> with alt={agent.name}
        if (agent.portrait) {
          const img = container.querySelector('img');
          expect(img).not.toBeNull();
          expect(img!.getAttribute('alt')).toBe(agent.name);
        }

        // 6. Portrait absent → no <img>
        if (!agent.portrait) {
          expect(container.querySelector('img')).toBeNull();
        }

        cleanup();
      }),
      { numRuns: 100 },
    );
  });
});
