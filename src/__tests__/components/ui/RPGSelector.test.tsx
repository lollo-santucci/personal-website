// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import RPGSelector from '@/components/ui/RPGSelector';

afterEach(cleanup);

describe('RPGSelector', () => {
  it('renders > character', () => {
    render(<RPGSelector />);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('has font-pixbob-regular class', () => {
    render(<RPGSelector />);
    const el = screen.getByText('>');
    expect(el).toHaveClass('font-pixbob-regular');
  });

  it('renders as inline span', () => {
    render(<RPGSelector />);
    const el = screen.getByText('>');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('inline');
  });

  it('applies className override', () => {
    render(<RPGSelector className="text-5xl" />);
    const el = screen.getByText('>');
    expect(el).toHaveClass('text-5xl');
    expect(el).toHaveClass('font-pixbob-regular');
  });

  it('has text-text color class', () => {
    render(<RPGSelector />);
    const el = screen.getByText('>');
    expect(el).toHaveClass('text-text');
  });
});
