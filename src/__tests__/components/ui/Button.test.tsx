// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Button from '@/components/ui/Button';

afterEach(cleanup);

describe('Button', () => {
  describe('variants', () => {
    it('renders primary variant with accent bg and white text', () => {
      render(<Button variant="primary" size="md">Primary</Button>);
      const el = screen.getByRole('button', { name: /primary/i });
      expect(el).toHaveClass('bg-primary', 'text-surface');
    });

    it('renders secondary variant with white bg and black text', () => {
      render(<Button variant="secondary" size="md">Secondary</Button>);
      const el = screen.getByRole('button', { name: /secondary/i });
      expect(el).toHaveClass('bg-surface', 'text-text');
    });

    it('renders dark variant with black bg and white text', () => {
      render(<Button variant="dark" size="md">Dark</Button>);
      const el = screen.getByRole('button', { name: /dark/i });
      expect(el).toHaveClass('bg-text', 'text-surface');
    });
  });

  describe('sizes', () => {
    it('renders sm size with correct text classes', () => {
      render(<Button variant="primary" size="sm">Small</Button>);
      const el = screen.getByRole('button', { name: /small/i });
      expect(el).toHaveClass('text-sm');
    });

    it('renders md size with correct text classes', () => {
      render(<Button variant="primary" size="md">Medium</Button>);
      const el = screen.getByRole('button', { name: /medium/i });
      expect(el).toHaveClass('text-lg');
    });

    it('renders lg size with correct text classes', () => {
      render(<Button variant="primary" size="lg">Large</Button>);
      const el = screen.getByRole('button', { name: /large/i });
      expect(el).toHaveClass('text-xl');
    });
  });

  describe('icon rendering', () => {
    it('renders default ArrowUpRight icon when showIcon is true (default)', () => {
      render(<Button variant="primary" size="md">WithIcon</Button>);
      const el = screen.getByRole('button', { name: /withicon/i });
      const svg = el.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders custom icon when provided', () => {
      render(
        <Button variant="primary" size="md" icon={<span data-testid="custom-icon">★</span>}>
          CustomIcon
        </Button>,
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<Button variant="primary" size="md" showIcon={false}>NoIcon</Button>);
      const el = screen.getByRole('button', { name: /noicon/i });
      const svg = el.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('element type', () => {
    it('renders as anchor when href is provided', () => {
      render(<Button variant="primary" size="md" href="/about">AnchorBtn</Button>);
      const el = screen.getByRole('link', { name: /anchorbtn/i });
      expect(el.tagName).toBe('A');
      expect(el).toHaveAttribute('href', '/about');
    });

    it('renders as button when no href is provided', () => {
      render(<Button variant="primary" size="md">PlainBtn</Button>);
      const el = screen.getByRole('button', { name: /plainbtn/i });
      expect(el.tagName).toBe('BUTTON');
    });
  });

  describe('accessible name', () => {
    it('exposes children text as accessible name', () => {
      render(<Button variant="primary" size="md">Contact Me</Button>);
      expect(screen.getByRole('button', { name: 'Contact Me' })).toBeInTheDocument();
    });
  });
});
