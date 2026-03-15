// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Badge from '@/components/ui/Badge';

afterEach(cleanup);

describe('Badge', () => {
  describe('color variants', () => {
    it('renders accent variant with accent bg and white text', () => {
      render(<Badge variant="accent">Accent</Badge>);
      const el = screen.getByText('Accent');
      expect(el).toHaveClass('bg-primary', 'text-surface');
    });

    it('renders violet variant with violet bg and white text', () => {
      render(<Badge variant="violet">Violet</Badge>);
      const el = screen.getByText('Violet');
      expect(el).toHaveClass('bg-secondary', 'text-surface');
    });

    it('renders blue variant with blue bg and white text', () => {
      render(<Badge variant="blue">Blue</Badge>);
      const el = screen.getByText('Blue');
      expect(el).toHaveClass('bg-blue', 'text-surface');
    });

    it('renders green variant with green bg and white text', () => {
      render(<Badge variant="green">Green</Badge>);
      const el = screen.getByText('Green');
      expect(el).toHaveClass('bg-green', 'text-surface');
    });

    it('renders lime variant with lime bg and BLACK text', () => {
      render(<Badge variant="lime">Lime</Badge>);
      const el = screen.getByText('Lime');
      expect(el).toHaveClass('bg-lime', 'text-text');
      expect(el).not.toHaveClass('text-surface');
    });

    it('renders dark variant with black bg and white text', () => {
      render(<Badge variant="dark">Dark</Badge>);
      const el = screen.getByText('Dark');
      expect(el).toHaveClass('bg-text', 'text-surface');
    });
  });

  describe('border and font classes', () => {
    it('has border-standard and border-black classes', () => {
      render(<Badge variant="accent">Bordered</Badge>);
      const el = screen.getByText('Bordered');
      expect(el).toHaveClass('border-standard', 'border-black');
    });

    it('has font-pixbob-regular class', () => {
      render(<Badge variant="accent">Fonted</Badge>);
      const el = screen.getByText('Fonted');
      expect(el).toHaveClass('font-pixbob-regular');
    });
  });
});
