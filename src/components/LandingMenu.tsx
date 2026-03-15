'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTransitionRouter } from '@/lib/transition/use-transition-router';

const MENU_ITEMS = [
  { label: 'NEW GAME (coming soon)', href: null },
  { label: 'ABOUT', href: '/about' },
  { label: 'PROJECTS', href: '/projects' },
  { label: 'AGENTDEX', href: '/agentdex' },
  { label: 'BLOG', href: '/blog' },
] as const;

// Find the first navigable index to start with
const FIRST_NAVIGABLE = MENU_ITEMS.findIndex((item) => item.href !== null);

export default function LandingMenu() {
  const router = useTransitionRouter();
  const [selectedIndex, setSelectedIndex] = useState(FIRST_NAVIGABLE);
  const listRef = useRef<HTMLUListElement>(null);

  const getNextNavigableIndex = useCallback((from: number, direction: 1 | -1): number => {
    let next = from;
    for (let i = 0; i < MENU_ITEMS.length; i++) {
      next += direction;
      if (next < 0) next = MENU_ITEMS.length - 1;
      if (next >= MENU_ITEMS.length) next = 0;
      if (MENU_ITEMS[next].href !== null) return next;
    }
    return from;
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => getNextNavigableIndex(prev, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => getNextNavigableIndex(prev, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        const item = MENU_ITEMS[selectedIndex];
        if (item.href) {
          router.push(item.href);
        }
      }
    },
    [selectedIndex, getNextNavigableIndex, router],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav aria-label="Site navigation">
      <ul ref={listRef} className="flex flex-col gap-2 md:gap-6" role="menu">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          const isDisabled = item.href === null;

          if (isDisabled) {
            return (
              <li key={item.label} role="none">
                <span
                  role="menuitem"
                  aria-disabled="true"
                  className="flex items-center gap-3 font-pixbob-regular text-2xl text-text-muted md:text-3xl xl:text-[48px]"
                >
                  <span className="inline-block w-[1em] text-transparent">{'>'}</span>
                  <span>{item.label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.label} role="none">
              <a
                href={item.href}
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
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
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
