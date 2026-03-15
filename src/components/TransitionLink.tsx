'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { useTransitionContext } from '@/lib/transition/transition-context';

type TransitionLinkProps = ComponentPropsWithoutRef<typeof Link>;

export default function TransitionLink({ href, onClick, children, ...props }: TransitionLinkProps) {
  const { startTransition } = useTransitionContext();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e);
    const url = typeof href === 'string' ? href : href.pathname ?? '/';
    startTransition(url);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
