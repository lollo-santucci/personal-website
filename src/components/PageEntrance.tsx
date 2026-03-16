'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';
import { useTransitionContext } from '@/lib/transition/transition-context';

interface PageEntranceProps {
  children: ReactNode;
}

export default function PageEntrance({ children }: PageEntranceProps) {
  const { phase } = useTransitionContext();
  const [animate, setAnimate] = useState(false);
  const prevPhaseRef = useRef(phase);
  const isInitialRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip animation on initial mount (SSR/first load)
    if (isInitialRef.current) {
      isInitialRef.current = false;
      prevPhaseRef.current = phase;
      return;
    }

    // Trigger entrance when transitioning to 'revealing'
    if (prevPhaseRef.current !== 'revealing' && phase === 'revealing') {
      setAnimate(true);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!animate) return;
    const el = containerRef.current;
    if (!el) return;

    function handleEnd() {
      setAnimate(false);
    }

    el.addEventListener('animationend', handleEnd, { once: true });
    return () => el.removeEventListener('animationend', handleEnd);
  }, [animate]);

  return (
    <div ref={containerRef} className={animate ? 'animate-page-enter' : undefined}>
      {children}
    </div>
  );
}
