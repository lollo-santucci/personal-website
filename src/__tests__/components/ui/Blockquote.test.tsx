// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Blockquote from '@/components/ui/Blockquote';

afterEach(cleanup);

describe('Blockquote', () => {
  it('has violet background class (bg-secondary)', () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('bg-secondary');
  });

  it('has accent left border class (border-l-primary)', () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('border-l-primary');
  });

  it('has white text class (text-surface)', () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('text-surface');
  });

  it('renders as blockquote element', () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('BLOCKQUOTE');
  });

  it('has Pixbob Regular font class', () => {
    const { container } = render(<Blockquote>Quote text</Blockquote>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('font-pixbob-regular');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Blockquote className="my-8">Quote</Blockquote>
    );
    const el = container.firstElementChild!;
    expect(el).toHaveClass('my-8');
    expect(el).toHaveClass('bg-secondary');
  });

  it('renders children', () => {
    const { container } = render(<Blockquote>Deep thought</Blockquote>);
    expect(container.firstElementChild).toHaveTextContent('Deep thought');
  });
});
