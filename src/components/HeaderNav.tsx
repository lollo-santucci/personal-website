'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS, isActiveLink } from '@/lib/navigation';

export default function HeaderNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linkClasses = (href: string) => {
    const active = isActiveLink(href, pathname);
    return active
      ? 'font-bold underline underline-offset-4'
      : 'hover:text-gray-900';
  };

  const navLinks = NAV_LINKS.map((link) => {
    const active = isActiveLink(link.href, pathname);
    return (
      <Link
        key={link.href}
        href={link.href}
        className={linkClasses(link.href)}
        {...(active ? { 'aria-current': 'page' as const } : {})}
      >
        {link.label}
      </Link>
    );
  });

  const playModePlaceholder = (
    <span aria-disabled="true" className="opacity-40 cursor-default">
      Play Mode
    </span>
  );

  return (
    <nav aria-label="Main navigation">
      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
        {navLinks}
        {playModePlaceholder}
      </div>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className="md:hidden text-2xl text-gray-700"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu panel */}
      {isOpen && (
        <div className="absolute left-0 top-full w-full bg-white border-t border-gray-200 shadow-sm md:hidden">
          <div className="flex flex-col gap-4 px-4 py-4 text-sm text-gray-600">
            {navLinks}
            {playModePlaceholder}
          </div>
        </div>
      )}
    </nav>
  );
}
