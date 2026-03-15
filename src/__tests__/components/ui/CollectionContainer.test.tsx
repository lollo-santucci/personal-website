// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CollectionContainer from '@/components/ui/CollectionContainer';

afterEach(cleanup);

describe('CollectionContainer', () => {
  describe('border classes', () => {
    it('has border-black class', () => {
      render(<CollectionContainer><p>Content</p></CollectionContainer>);
      const el = screen.getByText('Content').parentElement!;
      expect(el).toHaveClass('border-black');
    });

    it('has mobile border-[6px] and desktop md:border-collection classes', () => {
      render(<CollectionContainer><p>Content</p></CollectionContainer>);
      const el = screen.getByText('Content').parentElement!;
      expect(el).toHaveClass('border-[6px]');
      expect(el).toHaveClass('md:border-collection');
    });
  });

  describe('padding classes', () => {
    it('has responsive horizontal padding classes', () => {
      render(<CollectionContainer><p>Content</p></CollectionContainer>);
      const el = screen.getByText('Content').parentElement!;
      expect(el).toHaveClass('px-4', 'md:px-6', 'xl:px-collection-px');
    });

    it('has responsive vertical padding classes', () => {
      render(<CollectionContainer><p>Content</p></CollectionContainer>);
      const el = screen.getByText('Content').parentElement!;
      expect(el).toHaveClass('py-4', 'md:py-5', 'xl:py-collection-py');
    });
  });

  describe('children rendering', () => {
    it('renders children content', () => {
      render(
        <CollectionContainer>
          <p>First item</p>
          <p>Second item</p>
        </CollectionContainer>,
      );
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <CollectionContainer className="mt-8">
          <p>Content</p>
        </CollectionContainer>,
      );
      const el = screen.getByText('Content').parentElement!;
      expect(el).toHaveClass('mt-8');
    });
  });
});
