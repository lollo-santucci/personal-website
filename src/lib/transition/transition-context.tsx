'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { TransitionPhase, TransitionEffect, TransitionConfig } from './types';
import { TOTTI_CHANCE, DEFAULT_CONFIG, EFFECT_DURATIONS, pickTransitionColor } from './types';
import { preloadTottiSheet } from './totti-runner';
import TransitionCanvas from './transition-canvas';

interface TransitionContextValue {
  startTransition: (href: string) => void;
  phase: TransitionPhase;
}

const TransitionContext = createContext<TransitionContextValue>({
  startTransition: () => {},
  phase: 'idle',
});

export function useTransitionContext() {
  return useContext(TransitionContext);
}

function pickEffect(hasTottiImage: boolean): TransitionEffect {
  const roll = Math.random();
  if (hasTottiImage && roll < TOTTI_CHANCE) return 'totti-run';
  const remaining = hasTottiImage ? roll - TOTTI_CHANCE : roll;
  const threshold = hasTottiImage ? (1 - TOTTI_CHANCE) / 3 : 1 / 3;
  if (remaining < threshold) return 'pixel-dissolve';
  if (remaining < threshold * 2) return 'pixel-wipe';
  return 'dither-fade';
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [effect, setEffect] = useState<TransitionEffect>('pixel-dissolve');
  const [config, setConfig] = useState<TransitionConfig>(DEFAULT_CONFIG);
  const [tottiImage, setTottiImage] = useState<HTMLImageElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const pendingHrefRef = useRef<string | null>(null);
  const transitionActiveRef = useRef(false);
  const waitingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect reduced motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Preload Totti spritesheet
  useEffect(() => {
    preloadTottiSheet()
      .then(setTottiImage)
      .catch(() => {
        // Totti failed to load — effects will exclude totti-run
      });
  }, []);

  // Watch pathname changes to transition from waiting → revealing
  useEffect(() => {
    if (phase === 'waiting' && pendingHrefRef.current) {
      pendingHrefRef.current = null;
      if (waitingTimeoutRef.current) {
        clearTimeout(waitingTimeoutRef.current);
        waitingTimeoutRef.current = null;
      }

      // Wait a few frames so React can fully render the new page
      // before uncovering it — prevents a visible content snap.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('revealing');
        });
      });
    }
  }, [pathname, phase]);

  const startTransition = useCallback(
    (href: string) => {
      // Skip if same page
      if (href === pathname) return;

      // Skip animation if reduced motion or already transitioning
      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      if (transitionActiveRef.current) {
        // Interrupt: fast-forward to new destination
        pendingHrefRef.current = href;
        router.push(href);
        return;
      }

      transitionActiveRef.current = true;
      pendingHrefRef.current = href;
      const chosenEffect = pickEffect(tottiImage !== null);
      const durations = EFFECT_DURATIONS[chosenEffect];
      setEffect(chosenEffect);
      setConfig({
        ...DEFAULT_CONFIG,
        fillColor: pickTransitionColor(),
        coverDurationMs: durations.cover,
        revealDurationMs: durations.reveal,
      });
      setPhase('covering');
    },
    [pathname, prefersReducedMotion, router, tottiImage],
  );

  const handleCoverComplete = useCallback(() => {
    if (pendingHrefRef.current) {
      router.push(pendingHrefRef.current);
      setPhase('waiting');

      // Safety timeout: if pathname doesn't change within 800ms, reveal anyway
      waitingTimeoutRef.current = setTimeout(() => {
        setPhase('revealing');
        pendingHrefRef.current = null;
      }, 800);
    }
  }, [router]);

  const handleRevealComplete = useCallback(() => {
    setPhase('idle');
    transitionActiveRef.current = false;
  }, []);

  return (
    <TransitionContext.Provider value={{ startTransition, phase }}>
      {children}
      <TransitionCanvas
        phase={phase}
        effect={effect}
        config={config}
        tottiImage={tottiImage}
        onCoverComplete={handleCoverComplete}
        onRevealComplete={handleRevealComplete}
      />
    </TransitionContext.Provider>
  );
}
