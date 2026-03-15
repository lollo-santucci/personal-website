'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RPGSelector from '@/components/ui/RPGSelector';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MENU_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/agentdex', label: 'Agentdex' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
] as const;

export default function MenuOverlay({ isOpen, onClose, triggerRef }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Get all focusable elements within the overlay
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!overlayRef.current) return [];
    return Array.from(
      overlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }, []);

  // Focus the close button when overlay opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is rendered
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Close on Escape + focus trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, getFocusableElements]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen) return;
    return () => {
      triggerRef.current?.focus();
    };
  }, [isOpen, triggerRef]);

  // Close overlay on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // Only react to pathname changes, not isOpen/onClose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-50 flex flex-col bg-surface"
    >
      {/* Close button row */}
      <div className="flex justify-end px-6 py-4 md:px-12 xl:px-page-px">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="font-pixbob-lite text-2xl text-text md:text-3xl xl:text-[48px]"
        >
          CLOSE
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex flex-1 items-center justify-center">
        <ul className="flex flex-col gap-6 md:gap-8">
          {MENU_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 font-pixbob-regular text-3xl text-text md:text-4xl xl:text-[56px]"
              >
                <RPGSelector />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
