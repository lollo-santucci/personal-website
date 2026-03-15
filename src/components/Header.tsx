'use client';

import { useState, useRef } from 'react';
import MenuOverlay from '@/components/MenuOverlay';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="px-6 py-4 md:px-12 xl:px-page-px">
      <div className="mx-auto flex max-w-content-max items-center justify-between">
        <a
          href="/"
          className="font-pixbob-bold text-2xl text-surface md:text-3xl xl:text-[46px]"
          style={{
            WebkitTextStrokeWidth: '10px',
            WebkitTextStrokeColor: 'var(--black)',
            paintOrder: 'stroke fill',
          }}
        >
          Lorenzo Santucci
        </a>
        <button
          ref={menuTriggerRef}
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          className="font-pixbob-lite text-2xl text-text md:text-3xl xl:text-[48px]"
        >
          MENU
        </button>
      </div>
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={menuTriggerRef}
      />
    </header>
  );
}
