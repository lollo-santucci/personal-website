// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import StatusBadge from '@/components/StatusBadge';

const STATUS_CASES = [
  {
    status: 'completed' as const,
    label: 'Completed',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
  },
  {
    status: 'in-progress' as const,
    label: 'In Progress',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-800',
  },
  {
    status: 'ongoing' as const,
    label: 'Ongoing',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
  },
] as const;

const AGENT_STATUS_CASES = [
  {
    status: 'active' as const,
    label: 'Active',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-800',
  },
  {
    status: 'coming-soon' as const,
    label: 'Coming Soon',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-800',
  },
  {
    status: 'experimental' as const,
    label: 'Experimental',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
  },
] as const;

describe('StatusBadge', () => {
  it.each(STATUS_CASES)(
    'renders "$label" with correct classes for status "$status"',
    ({ status, label, bgClass, textClass }) => {
      render(<StatusBadge status={status} />);

      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(bgClass);
      expect(badge).toHaveClass(textClass);
    },
  );

  it.each(AGENT_STATUS_CASES)(
    'renders "$label" with correct classes for agent status "$status"',
    ({ status, label, bgClass, textClass }) => {
      render(<StatusBadge status={status} />);

      const badge = screen.getByText(label);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(bgClass);
      expect(badge).toHaveClass(textClass);
    },
  );
});
