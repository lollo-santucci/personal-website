'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTransitionRouter } from '@/lib/transition/use-transition-router';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MENU_LINKS = [
  { label: 'ABOUT', href: '/about' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'AGENTDEX', href: '/agentdex' },
  { label: 'BLOG', href: '/blog' },
  { label: 'CONTACT', href: '/contact' },
] as const;

export default function MenuOverlay({ isOpen, onClose, triggerRef }: MenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useTransitionRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when overlay opens, focus close button
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Keyboard navigation: arrows, enter, escape, focus trap
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % MENU_LINKS.length);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + MENU_LINKS.length) % MENU_LINKS.length);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const item = MENU_LINKS[selectedIndex];
        onClose();
        router.push(item.href);
        return;
      }

      // Focus trap on Tab
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = Array.from(
          overlayRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, selectedIndex, router]);

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
    // Only react to pathname changes
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

      {/* Navigation links — landing menu style */}
      <nav className="flex flex-1 items-center justify-center" aria-label="Site navigation">
        <ul className="flex flex-col gap-2 md:gap-6" role="menu">
          {MENU_LINKS.map(({ href, label }, index) => {
            const isSelected = index === selectedIndex;

            return (
              <li key={href} role="none">
                <a
                  href={href}
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    router.push(href);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 font-pixbob-regular text-2xl text-text md:text-3xl xl:text-[48px] ${
                    isSelected ? 'animate-menu-pulse' : ''
                  }`}
                >
                  <span
                    className={`inline-block w-[1em] ${
                      isSelected ? '' : 'text-transparent'
                    }`}
                  >
                    {'>'}
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
