// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CollectionRow from '@/components/ui/CollectionRow';

afterEach(cleanup);

describe('CollectionRow', () => {
  describe('flex layout classes', () => {
    it('has flex, items-center, and justify-between classes', () => {
      render(<CollectionRow><span>Content</span></CollectionRow>);
      const row = screen.getByText('Content').parentElement!.parentElement!;
      expect(row).toHaveClass('flex', 'items-center', 'justify-between');
    });

    it('has gap-card-gap and flex-nowrap classes', () => {
      render(<CollectionRow><span>Content</span></CollectionRow>);
      const row = screen.getByText('Content').parentElement!.parentElement!;
      expect(row).toHaveClass('gap-card-gap', 'flex-nowrap');
    });
  });

  describe('children rendered in left area', () => {
    it('renders children in the left content area', () => {
      render(
        <CollectionRow>
          <span>Left content</span>
        </CollectionRow>,
      );
      const leftContent = screen.getByText('Left content');
      expect(leftContent).toBeInTheDocument();
      const leftArea = leftContent.parentElement!;
      expect(leftArea).toHaveClass('flex-1', 'min-w-0', 'overflow-hidden');
    });
  });

  describe('action slot rendered in right area', () => {
    it('renders action element in the right area', () => {
      render(
        <CollectionRow action={<button>Click me</button>}>
          <span>Content</span>
        </CollectionRow>,
      );
      const actionBtn = screen.getByText('Click me');
      expect(actionBtn).toBeInTheDocument();
      const rightArea = actionBtn.parentElement!;
      expect(rightArea).toHaveClass('flex-shrink-0');
    });
  });

  describe('renders without action slot', () => {
    it('renders without action when action prop is not provided', () => {
      const { container } = render(
        <CollectionRow>
          <span>Content only</span>
        </CollectionRow>,
      );
      expect(screen.getByText('Content only')).toBeInTheDocument();
      // Only the left area div should be present inside the row
      const row = container.firstElementChild!;
      expect(row.children).toHaveLength(1);
    });

    it('applies custom className', () => {
      render(
        <CollectionRow className="my-4">
          <span>Content</span>
        </CollectionRow>,
      );
      const row = screen.getByText('Content').parentElement!.parentElement!;
      expect(row).toHaveClass('my-4');
    });
  });
});
