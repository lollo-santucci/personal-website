'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  scrambleOnMount?: boolean;
  scrambleOnHover?: boolean;
  className?: string;
  /** Total animation duration in ms. */
  duration?: number;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
/** Fraction of duration spent fully scrambled before characters start resolving. */
const SCRAMBLE_HOLD = 0.3;
/** Each character gets multiple random cycles before locking in. */
const CYCLE_INTERVAL = 40; // ms between random swaps

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export default function TextScramble({
  text,
  scrambleOnMount = false,
  scrambleOnHover = true,
  className,
  duration = 600,
}: TextScrambleProps) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);
  const reducedMotionRef = useRef(false);
  const lastCycleRef = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const scramble = useCallback(() => {
    if (reducedMotionRef.current) {
      setDisplay(text);
      return;
    }

    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    lastCycleRef.current = 0;
    const resolveStart = duration * SCRAMBLE_HOLD;
    const resolveDuration = duration * (1 - SCRAMBLE_HOLD);

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Throttle random char updates to CYCLE_INTERVAL for a readable "ticking" feel
      const shouldUpdate =
        now - lastCycleRef.current >= CYCLE_INTERVAL || progress >= 1;
      if (!shouldUpdate) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      lastCycleRef.current = now;

      // How many characters have resolved (0 during hold phase)
      const resolveProgress =
        elapsed <= resolveStart
          ? 0
          : Math.min((elapsed - resolveStart) / resolveDuration, 1);
      const resolved = Math.floor(resolveProgress * text.length);

      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < resolved) {
          result += text[i];
        } else {
          result += randomChar();
        }
      }
      setDisplay(result);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }, [text, duration]);

  useEffect(() => {
    if (scrambleOnMount) {
      scramble();
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [scrambleOnMount, scramble]);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={scrambleOnHover ? scramble : undefined}
    >
      {display}
    </span>
  );
}
