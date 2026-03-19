'use client';

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Spritesheet constants (in original sprite pixels)
// ---------------------------------------------------------------------------

const SPRITE_BASE = '/assets/characters/totti/spritesheets';
const FRAME_SIZE = 32;

// Responsive scale: mobile → md → xl
function getScale(): number {
  if (typeof window === 'undefined') return 4;
  const w = window.innerWidth;
  if (w >= 1536) return 8;
  if (w >= 1280) return 6;
  if (w >= 768) return 6;
  return 4;
}

// Walking: 128×224 → 4 cols × 7 rows, 4 frames
const WALK_SHEET = `${SPRITE_BASE}/BROWN_DOG_WALKING.png`;
const WALK_SHEET_W = 128;
const WALK_SHEET_H = 224;
const WALK_FRAMES = 4;
const WALK_RIGHT_ROW = 5;
const WALK_LEFT_ROW = 2;

// Sniffing: 64×128 → 2 cols × 4 rows, 2 frames
const SNIFF_SHEET = `${SPRITE_BASE}/BROWN_DOG_SNIFFING.png`;
const SNIFF_SHEET_W = 64;
const SNIFF_SHEET_H = 128;
const SNIFF_FRAMES = 2;
const SNIFF_RIGHT_ROW = 3;
const SNIFF_LEFT_ROW = 1;

// Timing
const FRAME_DURATION = 200; // ms per sprite frame
const SNIFF_DURATION = 1600;
const MIN_WALK_LOOPS = 2;
const MAX_WALK_LOOPS = 5;
const BASE_SPEED = 1.5; // px/frame at scale 4

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Direction = 'right' | 'left';
type Phase = 'walk' | 'sniff';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Totti404Sprite() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const stateRef = useRef({
    x: -(FRAME_SIZE * getScale()),
    direction: 'right' as Direction,
    phase: 'walk' as Phase,
    walkLoopsLeft: randInt(MIN_WALK_LOOPS, MAX_WALK_LOOPS),
    walkDistance: 0,
    walkLoopSize: 300,
    sniffStart: 0,
    frame: 0,
    lastFrameTime: 0,
    scale: getScale(),
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const sprite = spriteRef.current;
    const container = containerRef.current;
    if (!sprite || !container) return;

    const s = stateRef.current;
    s.scale = getScale();

    // Update scale on resize
    function handleResize() {
      stateRef.current.scale = getScale();
    }
    window.addEventListener('resize', handleResize);

    function applySprite() {
      if (!sprite) return;
      const { phase, direction, frame, scale } = stateRef.current;
      const display = FRAME_SIZE * scale;

      const isWalk = phase === 'walk';
      const sheet = isWalk ? WALK_SHEET : SNIFF_SHEET;
      const sheetW = isWalk ? WALK_SHEET_W : SNIFF_SHEET_W;
      const sheetH = isWalk ? WALK_SHEET_H : SNIFF_SHEET_H;
      const row = isWalk
        ? (direction === 'right' ? WALK_RIGHT_ROW : WALK_LEFT_ROW)
        : (direction === 'right' ? SNIFF_RIGHT_ROW : SNIFF_LEFT_ROW);

      sprite.style.width = `${display}px`;
      sprite.style.height = `${display}px`;
      sprite.style.backgroundImage = `url(${sheet})`;
      sprite.style.backgroundSize = `${sheetW * scale}px ${sheetH * scale}px`;
      sprite.style.backgroundPosition = `-${frame * display}px -${row * display}px`;
      sprite.style.backgroundRepeat = 'no-repeat';
      sprite.style.imageRendering = 'pixelated';
    }

    function tick(now: number) {
      const containerW = container!.offsetWidth;
      const { scale } = s;
      const display = FRAME_SIZE * scale;
      const speed = BASE_SPEED * (scale / 4);
      const maxFrames = s.phase === 'walk' ? WALK_FRAMES : SNIFF_FRAMES;

      // Advance sprite frame
      if (now - s.lastFrameTime >= FRAME_DURATION) {
        s.frame = (s.frame + 1) % maxFrames;
        s.lastFrameTime = now;
      }

      if (s.phase === 'walk') {
        const delta = s.direction === 'right' ? speed : -speed;
        s.x += delta;
        s.walkDistance += speed;

        if (s.walkDistance >= s.walkLoopSize) {
          s.walkDistance = 0;
          s.walkLoopsLeft -= 1;

          if (s.walkLoopsLeft <= 0) {
            s.phase = 'sniff';
            s.sniffStart = now;
            s.frame = 0;
            s.lastFrameTime = now;
          }
        }

        // Wrap around
        if (s.x > containerW) {
          s.x = -display;
        }
        if (s.x < -display) {
          s.x = containerW;
        }
      } else {
        // Sniffing — stay in place
        if (now - s.sniffStart >= SNIFF_DURATION) {
          s.direction = Math.random() > 0.5 ? 'right' : 'left';
          s.walkLoopsLeft = randInt(MIN_WALK_LOOPS, MAX_WALK_LOOPS);
          s.walkDistance = 0;
          s.phase = 'walk';
          s.frame = 0;
          s.lastFrameTime = now;
        }
      }

      applySprite();
      sprite!.style.transform = `translateX(${s.x}px)`;

      rafRef.current = requestAnimationFrame(tick);
    }

    // Init
    s.lastFrameTime = performance.now();
    applySprite();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion]);

  // Reduced motion: static sniffing frame
  if (prefersReducedMotion) {
    const scale = getScale();
    const display = FRAME_SIZE * scale;
    return (
      <div className="w-full flex justify-center" role="img" aria-label="Totti the dog sniffing around">
        <div
          style={{
            width: display,
            height: display,
            backgroundImage: `url(${SNIFF_SHEET})`,
            backgroundSize: `${SNIFF_SHEET_W * scale}px ${SNIFF_SHEET_H * scale}px`,
            backgroundPosition: `0px -${SNIFF_RIGHT_ROW * display}px`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 h-32 md:h-48 xl:h-48 2xl:h-64 overflow-visible"
      role="img"
      aria-label="Totti the dog walking and sniffing"
    >
      <div ref={spriteRef} className="absolute bottom-0" />
    </div>
  );
}
