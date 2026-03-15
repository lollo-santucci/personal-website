// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CTABanner from '@/components/ui/CTABanner';

afterEach(cleanup);

describe('CTABanner', () => {
  const defaultProps = {
    headline: 'Get in touch',
    body: "Let's work together on your next project.",
    href: '/contact',
  };

  it('renders with violet background class', () => {
    render(<CTABanner {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-secondary');
  });

  it('renders headline text', () => {
    render(<CTABanner {...defaultProps} />);
    expect(screen.getByText('Get in touch')).toBeInTheDocument();
  });

  it('renders body text', () => {
    render(<CTABanner {...defaultProps} />);
    expect(screen.getByText("Let's work together on your next project.")).toBeInTheDocument();
  });

  it('renders as an anchor element with correct href', () => {
    render(<CTABanner {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('has accessible name containing the headline text', () => {
    render(<CTABanner {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Get in touch');
  });
});
