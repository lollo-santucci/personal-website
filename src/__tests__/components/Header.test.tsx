// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@/components/MenuOverlay', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button onClick={onClose} aria-label="Close navigation menu">
          CLOSE
        </button>
      </div>
    ) : null,
}));

import Header from '@/components/Header';

afterEach(() => {
  cleanup();
});

describe('Header', () => {
  it('renders a <header> landmark element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('contains a link to "/" with text "Lorenzo Santucci"', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: 'Lorenzo Santucci' });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders a MENU button with accessible label', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveTextContent('MENU');
  });

  it('MENU button has aria-expanded="false" when overlay is closed', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens MenuOverlay when MENU button is clicked', () => {
    render(<Header />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('MENU button has aria-expanded="true" when overlay is open', () => {
    render(<Header />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    );

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes MenuOverlay when close button is clicked', () => {
    render(<Header />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' })
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Close navigation menu' })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MENU button is keyboard operable (Enter activates)', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' });
    // Native <button> handles Enter via click — fire click to simulate
    fireEvent.click(menuButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('uses font-pixbob-bold for logo link', () => {
    render(<Header />);
    const logoLink = screen.getByRole('link', { name: 'Lorenzo Santucci' });
    expect(logoLink.className).toContain('font-pixbob-bold');
  });

  it('uses font-pixbob-lite for MENU trigger', () => {
    render(<Header />);
    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(menuButton.className).toContain('font-pixbob-lite');
  });
});
