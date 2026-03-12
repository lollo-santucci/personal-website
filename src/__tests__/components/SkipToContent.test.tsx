// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SkipToContent from '@/components/SkipToContent';

describe('SkipToContent', () => {
  it('renders a link with href="#main-content" and text "Skip to content"', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: 'Skip to content' });
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('is the first focusable element in the rendered output', () => {
    render(<SkipToContent />);
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThan(0);
    expect(focusableElements[0]).toHaveAttribute('href', '#main-content');
    expect(focusableElements[0]).toHaveTextContent('Skip to content');
  });
});
