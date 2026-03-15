'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnimationConfig {
  row: number;
  startCol: number;
  frames: number;
}

export interface CharacterSpriteProps {
  slug: string;
  name: string;
  idleCol?: number;
  idleRow?: number;
  animations?: readonly AnimationConfig[];
  scale?: number;
  sheetWidth: number;
  sheetHeight: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FRAME_W = 32;
const FRAME_H = 64; // 2 tiles tall
const FRAME_DURATION_MS = 200;
const ANIM_MIN_INTERVAL = 6000;
const ANIM_MAX_INTERVAL = 12000;

// ---------------------------------------------------------------------------
// Keyframe injection
// ---------------------------------------------------------------------------

function injectKeyframes(
  slug: string,
  animations: readonly AnimationConfig[],
  scale: number,
): void {
  if (typeof document === 'undefined') return;
  const id = `character-sprite-keyframes-${slug}`;
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;

  const displayW = FRAME_W * scale;
  const rules = animations
    .map((anim, i) => {
      const endX = (anim.frames - 1) * displayW;
      return `
      @keyframes character-${slug}-anim-${String(i)} {
        from { background-position-x: -${anim.startCol * displayW}px; }
        to { background-position-x: -${(anim.startCol + anim.frames - 1) * displayW}px; }
      }`;
    })
    .join('\n');

  style.textContent = rules;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CharacterSprite({
  slug,
  name,
  idleCol = 3,
  idleRow = 0,
  animations = [],
  scale = 5,
  sheetWidth,
  sheetHeight,
}: CharacterSpriteProps) {
  const [activeAnim, setActiveAnim] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayW = FRAME_W * scale;
  const displayH = FRAME_H * scale;
  const sheetUrl = `/assets/agents/${slug}/spritesheets/character_spritesheet.png`;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Inject keyframes once
  useEffect(() => {
    if (!prefersReducedMotion && animations.length > 0) {
      injectKeyframes(slug, animations, scale);
    }
  }, [prefersReducedMotion, slug, animations, scale]);

  const randomDelay = useCallback(
    () => ANIM_MIN_INTERVAL + Math.random() * (ANIM_MAX_INTERVAL - ANIM_MIN_INTERVAL),
    [],
  );

  // Schedule random animations
  useEffect(() => {
    if (prefersReducedMotion || animations.length === 0) return;

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        const idx = Math.floor(Math.random() * animations.length);
        setActiveAnim(idx);

        // Return to idle after animation completes
        const anim = animations[idx];
        const duration = anim.frames * FRAME_DURATION_MS;
        animTimerRef.current = setTimeout(() => {
          setActiveAnim(null);
          scheduleNext();
        }, duration);
      }, randomDelay());
    }

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [prefersReducedMotion, animations, randomDelay]);

  // Base style for idle frame
  const idleStyle: React.CSSProperties = {
    width: displayW,
    height: displayH,
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
    backgroundPosition: `-${idleCol * displayW}px -${idleRow * displayH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
  };

  // Static or reduced motion
  if (prefersReducedMotion || activeAnim === null) {
    return (
      <div
        role="img"
        aria-label={`${name} character sprite`}
        className="pixel-art"
        style={idleStyle}
      />
    );
  }

  // Animated frame
  const anim = animations[activeAnim];
  const totalDuration = anim.frames * FRAME_DURATION_MS;

  const animStyle: React.CSSProperties = {
    width: displayW,
    height: displayH,
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
    backgroundPosition: `-${anim.startCol * displayW}px -${anim.row * displayH}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
    animation: `character-${slug}-anim-${String(activeAnim)} ${String(totalDuration)}ms steps(${String(anim.frames - 1)}) 1`,
  };

  return (
    <div
      role="img"
      aria-label={`${name} character sprite`}
      className="pixel-art"
      style={animStyle}
    />
  );
}
