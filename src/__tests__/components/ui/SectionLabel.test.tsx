// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SectionLabel from '@/components/ui/SectionLabel';

afterEach(cleanup);

describe('SectionLabel', () => {
  describe('variant rendering matches Badge visual structure', () => {
    it('renders accent variant with same classes as Badge', () => {
      render(<SectionLabel variant="accent">Section</SectionLabel>);
      const el = screen.getByText('Section');
      expect(el).toHaveClass('bg-primary', 'text-surface');
      expect(el).toHaveClass('border-standard', 'border-black');
      expect(el).toHaveClass('font-pixbob-regular');
    });

    it('renders lime variant with black text like Badge', () => {
      render(<SectionLabel variant="lime">Lime Section</SectionLabel>);
      const el = screen.getByText('Lime Section');
      expect(el).toHaveClass('bg-lime', 'text-text');
      expect(el).not.toHaveClass('text-surface');
    });
  });

  describe('as prop renders correct HTML element', () => {
    it('renders as h2 when as="h2"', () => {
      render(<SectionLabel variant="accent" as="h2">Heading 2</SectionLabel>);
      const el = screen.getByText('Heading 2');
      expect(el.tagName).toBe('H2');
    });

    it('renders as h3 when as="h3"', () => {
      render(<SectionLabel variant="accent" as="h3">Heading 3</SectionLabel>);
      const el = screen.getByText('Heading 3');
      expect(el.tagName).toBe('H3');
    });

    it('renders as h4 when as="h4"', () => {
      render(<SectionLabel variant="accent" as="h4">Heading 4</SectionLabel>);
      const el = screen.getByText('Heading 4');
      expect(el.tagName).toBe('H4');
    });

    it('renders as span when as="span"', () => {
      render(<SectionLabel variant="accent" as="span">Span Label</SectionLabel>);
      const el = screen.getByText('Span Label');
      expect(el.tagName).toBe('SPAN');
    });
  });

  describe('default as is span', () => {
    it('renders as span when as prop is not specified', () => {
      render(<SectionLabel variant="violet">Default</SectionLabel>);
      const el = screen.getByText('Default');
      expect(el.tagName).toBe('SPAN');
    });
  });
});
