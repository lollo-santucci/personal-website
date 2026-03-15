// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ChatPlaceholder from '@/components/ChatPlaceholder';

afterEach(cleanup);

describe('ChatPlaceholder', () => {
  it('renders as a <button> element', () => {
    render(<ChatPlaceholder />);

    const button = screen.getByRole('button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('has aria-disabled="true"', () => {
    render(<ChatPlaceholder />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('does NOT have native disabled attribute', () => {
    render(<ChatPlaceholder />);

    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
  });

  it('has aria-label containing both "Start Chat" and "Coming Soon"', () => {
    render(<ChatPlaceholder />);

    const button = screen.getByRole('button');
    const label = button.getAttribute('aria-label') ?? '';
    expect(label).toContain('Start Chat');
    expect(label).toContain('Coming Soon');
  });

  it('displays visible "Start Chat" text', () => {
    render(<ChatPlaceholder />);

    expect(screen.getByText('Start Chat')).toBeInTheDocument();
  });

  it('displays visible "Coming Soon" text', () => {
    render(<ChatPlaceholder />);

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('has no functional click behavior', () => {
    render(<ChatPlaceholder />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('pointer-events-none');
    expect(button.onclick).toBeNull();
  });
});
