// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Prose from '@/components/ui/Prose';

afterEach(cleanup);

describe('Prose', () => {
  it('has Manrope font class', () => {
    const { container } = render(<Prose>Hello world</Prose>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('font-manrope');
  });

  it('has typography plugin prose class', () => {
    const { container } = render(<Prose>Hello world</Prose>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('prose');
  });

  it('has text-text color class', () => {
    const { container } = render(<Prose>Hello world</Prose>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('text-text');
  });

  it('applies custom className', () => {
    const { container } = render(<Prose className="max-w-none">Hello</Prose>);
    const el = container.firstElementChild!;
    expect(el).toHaveClass('max-w-none');
    expect(el).toHaveClass('prose');
  });

  it('renders children', () => {
    const { container } = render(<Prose><p>Content here</p></Prose>);
    expect(container.querySelector('p')).toHaveTextContent('Content here');
  });
});
