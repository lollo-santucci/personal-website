// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import StatBar, { StatBarGroup } from '@/components/ui/StatBar';

afterEach(cleanup);

describe('StatBar', () => {
  describe('filled/empty counts for each value 1–5', () => {
    it.each([
      [1, 1, 4],
      [2, 2, 3],
      [3, 3, 2],
      [4, 4, 1],
      [5, 5, 0],
    ])('value %d renders %d filled and %d empty rectangles', (value, filled, empty) => {
      const { container } = render(<StatBar label="Test" value={value} />);
      const filledEls = container.querySelectorAll('.bg-lime');
      const emptyEls = container.querySelectorAll('.bg-surface');
      expect(filledEls).toHaveLength(filled);
      expect(emptyEls).toHaveLength(empty);
    });
  });

  describe('label rendering', () => {
    it('renders the label text', () => {
      render(<StatBar label="Speed" value={3} />);
      expect(screen.getByText('Speed')).toBeInTheDocument();
    });

    it('renders label in Pixbob Regular font', () => {
      render(<StatBar label="Power" value={2} />);
      const label = screen.getByText('Power');
      expect(label).toHaveClass('font-pixbob-regular');
    });
  });

  describe('aria-label format', () => {
    it('exposes aria-label as "{label}: {value} out of 5"', () => {
      render(<StatBar label="Speed" value={3} />);
      const bar = screen.getByRole('img');
      expect(bar).toHaveAttribute('aria-label', 'Speed: 3 out of 5');
    });
  });

  describe('clamping for out-of-range values', () => {
    it('clamps 0 to 1', () => {
      const { container } = render(<StatBar label="Low" value={0} />);
      expect(container.querySelectorAll('.bg-lime')).toHaveLength(1);
      expect(container.querySelectorAll('.bg-surface')).toHaveLength(4);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Low: 1 out of 5');
    });

    it('clamps 6 to 5', () => {
      const { container } = render(<StatBar label="High" value={6} />);
      expect(container.querySelectorAll('.bg-lime')).toHaveLength(5);
      expect(container.querySelectorAll('.bg-surface')).toHaveLength(0);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'High: 5 out of 5');
    });

    it('rounds 3.7 to 4', () => {
      const { container } = render(<StatBar label="Mid" value={3.7} />);
      expect(container.querySelectorAll('.bg-lime')).toHaveLength(4);
      expect(container.querySelectorAll('.bg-surface')).toHaveLength(1);
      expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Mid: 4 out of 5');
    });
  });
});

describe('StatBarGroup', () => {
  it('renders children with gap class', () => {
    const { container } = render(
      <StatBarGroup>
        <StatBar label="A" value={1} />
        <StatBar label="B" value={2} />
      </StatBarGroup>,
    );
    const group = container.firstElementChild as HTMLElement;
    expect(group).toHaveClass('flex', 'gap-2', 'md:gap-3');
    // Should contain 2 stat bars
    const bars = container.querySelectorAll('[role="img"]');
    expect(bars).toHaveLength(2);
  });
});
