// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CrossLinks from '@/components/ui/CrossLinks';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

afterEach(cleanup);

const testSections: [CrossLinkSection, CrossLinkSection] = [
  {
    title: 'Projects',
    href: '/projects',
    items: [
      { label: 'ML Pipeline', href: '/projects/ml-pipeline' },
      { label: 'Website', href: '/projects/website' },
    ],
  },
  {
    title: 'Blog',
    href: '/blog',
    items: [
      { label: 'First Post', href: '/blog/first-post' },
    ],
  },
];

describe('CrossLinks', () => {
  it('renders a two-column grid structure', () => {
    const { container } = render(<CrossLinks sections={testSections} />);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid).toHaveClass('grid', 'md:grid-cols-2');
  });

  it('renders section titles with ArrowUpRight icons', () => {
    render(<CrossLinks sections={testSections} />);
    const projectsLink = screen.getByText('Projects').closest('a')!;
    const blogLink = screen.getByText('Blog').closest('a')!;

    // Section title links exist
    expect(projectsLink).toHaveAttribute('href', '/projects');
    expect(blogLink).toHaveAttribute('href', '/blog');

    // Each section title link contains an SVG icon
    expect(projectsLink.querySelector('svg')).toBeInTheDocument();
    expect(blogLink.querySelector('svg')).toBeInTheDocument();
  });

  it('renders item links with border and icon', () => {
    render(<CrossLinks sections={testSections} />);

    const mlLink = screen.getByText('ML Pipeline').closest('a')!;
    expect(mlLink).toHaveAttribute('href', '/projects/ml-pipeline');
    expect(mlLink).toHaveClass('border-standard', 'border-black');
    expect(mlLink.querySelector('svg')).toBeInTheDocument();

    const websiteLink = screen.getByText('Website').closest('a')!;
    expect(websiteLink).toHaveAttribute('href', '/projects/website');
    expect(websiteLink).toHaveClass('border-standard', 'border-black');

    const postLink = screen.getByText('First Post').closest('a')!;
    expect(postLink).toHaveAttribute('href', '/blog/first-post');
    expect(postLink).toHaveClass('border-standard', 'border-black');
  });
});
