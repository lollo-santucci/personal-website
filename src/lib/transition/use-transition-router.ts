'use client';

import { useRouter } from 'next/navigation';
import { useTransitionContext } from './transition-context';

/**
 * Drop-in replacement for useRouter() that triggers page transitions.
 * Usage: const router = useTransitionRouter(); router.push('/about');
 */
export function useTransitionRouter() {
  const router = useRouter();
  const { startTransition } = useTransitionContext();

  return {
    ...router,
    push: (href: string) => startTransition(href),
    replace: (href: string) => startTransition(href),
  };
}
