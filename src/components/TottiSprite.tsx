'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// State machine types & pure transition function (exported for PBT testing)
// ---------------------------------------------------------------------------

export type TottiState = 'sitting' | 'barking' | 'sleeping';
export type TottiEvent =
  | 'bark_timer'
  | 'inactivity_timeout'
  | 'bark_complete'
  | 'user_interaction';

export function tottiTransition(
  state: TottiState,
  event: TottiEvent,
): TottiState {
  if (state === 'sitting' && event === 'bark_timer') return 'barking';
  if (state === 'sitting' && event === 'inactivity_timeout') return 'sleeping';
  if (state === 'barking' && event === 'bark_complete') return 'sitting';
  if (state === 'sleeping' && event === 'user_interaction') return 'sitting';
  return state;
}

// ---------------------------------------------------------------------------
// Spritesheet constants
// ---------------------------------------------------------------------------

const SPRITE_BASE = '/assets/characters/totti/spritesheets';
const FRAME_SIZE = 32; // px per frame in the spritesheet
const SCALE = 4; // display at 4× → 128px
const DISPLAY_SIZE = FRAME_SIZE * SCALE; // 128px

// Sitting spritesheet: 160×352 → 5 cols × 11 rows
// Use row 4 (0-indexed) for front-facing tail wagging — 5 frames
const SITTING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_SITTING.png`,
  sheetWidth: 160,
  sheetHeight: 352,
  cols: 5,
  row: 4, // front-facing tail wagging row
  frames: 5,
} as const;

// Playful/barking spritesheet: 128×128 → 4 cols × 4 rows
// Use row 0 (0-indexed) for front-facing playful/barking — 4 frames
const BARKING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_PLAYFUL.png`,
  sheetWidth: 128,
  sheetHeight: 128,
  cols: 4,
  row: 0, // front-facing playful row
  frames: 4,
} as const;

// Sleeping spritesheet: 128×64 → 4 cols × 2 rows
// Use row 0 (0-indexed) for sleeping animation — 4 frames
const SLEEPING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_SLEEPING.png`,
  sheetWidth: 128,
  sheetHeight: 64,
  cols: 4,
  row: 0, // sleeping row
  frames: 4,
} as const;

// Static frame for reduced-motion: front-facing from sitting sheet, col 0 row 4
const STATIC_FRAME = {
  sheet: SITTING.sheet,
  col: 0,
  row: SITTING.row,
} as const;

// Timing constants
const BARK_MIN_INTERVAL = 8000; // ms
const BARK_MAX_INTERVAL = 15000; // ms
const INACTIVITY_TIMEOUT = 10000; // ms
const FRAME_DURATION_MS = 200; // ~5 FPS (pixel-art feel)

// ---------------------------------------------------------------------------
// CSS keyframe animation style builder
// ---------------------------------------------------------------------------

function buildSpriteStyle(
  config: { sheet: string; sheetWidth: number; sheetHeight: number; row: number; frames: number },
): React.CSSProperties {
  // The animation moves background-position across the row's frames.
  // We use a single-axis horizontal strip approach:
  // background-size scales the entire sheet to SCALE, then we offset by row.
  return {
    width: DISPLAY_SIZE,
    height: DISPLAY_SIZE,
    backgroundImage: `url(${config.sheet})`,
    backgroundSize: `${config.sheetWidth * SCALE}px ${config.sheetHeight * SCALE}px`,
    backgroundPosition: `0px -${config.row * DISPLAY_SIZE}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
  };
}

function buildStaticStyle(): React.CSSProperties {
  return {
    width: DISPLAY_SIZE,
    height: DISPLAY_SIZE,
    backgroundImage: `url(${STATIC_FRAME.sheet})`,
    backgroundSize: `${SITTING.sheetWidth * SCALE}px ${SITTING.sheetHeight * SCALE}px`,
    backgroundPosition: `-${STATIC_FRAME.col * DISPLAY_SIZE}px -${STATIC_FRAME.row * DISPLAY_SIZE}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
  };
}

// ---------------------------------------------------------------------------
// Keyframe names (injected once into the document)
// ---------------------------------------------------------------------------

const KEYFRAME_ID_PREFIX = 'totti-sprite-';

function getKeyframeName(state: TottiState): string {
  return `${KEYFRAME_ID_PREFIX}${state}`;
}

function injectKeyframes(): void {
  if (typeof document === 'undefined') return;
  const id = 'totti-sprite-keyframes';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;

  // Each animation moves background-position-x across the frames in the row.
  // steps(N-1) creates N distinct frames (the initial position is frame 0).
  const sittingEnd = (SITTING.frames - 1) * DISPLAY_SIZE;
  const barkingEnd = (BARKING.frames - 1) * DISPLAY_SIZE;
  const sleepingEnd = (SLEEPING.frames - 1) * DISPLAY_SIZE;

  style.textContent = `
    @keyframes ${getKeyframeName('sitting')} {
      from { background-position-x: 0px; }
      to { background-position-x: -${sittingEnd}px; }
    }
    @keyframes ${getKeyframeName('barking')} {
      from { background-position-x: 0px; }
      to { background-position-x: -${barkingEnd}px; }
    }
    @keyframes ${getKeyframeName('sleeping')} {
      from { background-position-x: 0px; }
      to { background-position-x: -${sleepingEnd}px; }
    }
  `;

  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TottiSprite() {
  const [state, setState] = useState<TottiState>('sitting');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const barkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barkAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Inject CSS keyframes once
  useEffect(() => {
    if (!prefersReducedMotion) {
      injectKeyframes();
    }
  }, [prefersReducedMotion]);

  // -------------------------------------------------------------------------
  // Helper: random bark interval
  // -------------------------------------------------------------------------
  const randomBarkDelay = useCallback(
    () =>
      BARK_MIN_INTERVAL +
      Math.random() * (BARK_MAX_INTERVAL - BARK_MIN_INTERVAL),
    [],
  );

  // -------------------------------------------------------------------------
  // Clear all timers
  // -------------------------------------------------------------------------
  const clearAllTimers = useCallback(() => {
    if (barkTimerRef.current) {
      clearTimeout(barkTimerRef.current);
      barkTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (barkAnimTimerRef.current) {
      clearTimeout(barkAnimTimerRef.current);
      barkAnimTimerRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Start timers for the sitting state
  // -------------------------------------------------------------------------
  const startSittingTimers = useCallback(() => {
    // Schedule a random bark
    barkTimerRef.current = setTimeout(() => {
      setState((prev) => tottiTransition(prev, 'bark_timer'));
    }, randomBarkDelay());

    // Schedule inactivity → sleeping
    inactivityTimerRef.current = setTimeout(() => {
      setState((prev) => tottiTransition(prev, 'inactivity_timeout'));
    }, INACTIVITY_TIMEOUT);
  }, [randomBarkDelay]);

  // -------------------------------------------------------------------------
  // Handle user interaction (wake from sleeping, reset inactivity)
  // -------------------------------------------------------------------------
  const handleInteraction = useCallback(() => {
    if (prefersReducedMotion) return;

    setState((prev) => {
      const next = tottiTransition(prev, 'user_interaction');
      return next;
    });

    // Reset inactivity timer whenever user interacts
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setState((prev) => tottiTransition(prev, 'inactivity_timeout'));
    }, INACTIVITY_TIMEOUT);
  }, [prefersReducedMotion]);

  // -------------------------------------------------------------------------
  // State machine effect: manage timers based on current state
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion) return;

    clearAllTimers();

    if (state === 'sitting') {
      startSittingTimers();
    } else if (state === 'barking') {
      // Barking animation completes after all frames play once
      const barkDuration = BARKING.frames * FRAME_DURATION_MS;
      barkAnimTimerRef.current = setTimeout(() => {
        setState((prev) => tottiTransition(prev, 'bark_complete'));
      }, barkDuration);
    }
    // sleeping: no timers — waits for user interaction

    return clearAllTimers;
  }, [state, prefersReducedMotion, clearAllTimers, startSittingTimers]);

  // -------------------------------------------------------------------------
  // Global interaction listeners (mousemove, click on the landing page)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion) return;

    const events = ['mousemove', 'click', 'touchstart'] as const;
    events.forEach((evt) => document.addEventListener(evt, handleInteraction));

    return () => {
      events.forEach((evt) =>
        document.removeEventListener(evt, handleInteraction),
      );
    };
  }, [handleInteraction, prefersReducedMotion]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Reduced motion: static front-facing frame
  if (prefersReducedMotion) {
    return (
      <div
        role="img"
        aria-label="Totti the companion dog"
        className="pixel-art mx-auto"
        style={buildStaticStyle()}
      />
    );
  }

  // Animated: pick config based on current state
  const config =
    state === 'barking' ? BARKING : state === 'sleeping' ? SLEEPING : SITTING;

  const animationName = getKeyframeName(state);
  const totalDuration = config.frames * FRAME_DURATION_MS;
  // For sitting & sleeping: loop. For barking: play once (timer handles transition).
  const iterationCount = state === 'barking' ? 1 : 'infinite';

  const spriteStyle: React.CSSProperties = {
    ...buildSpriteStyle(config),
    animation: `${animationName} ${totalDuration}ms steps(${config.frames - 1}) ${iterationCount}`,
  };

  return (
    <div
      role="img"
      aria-label="Totti the companion dog"
      className="pixel-art mx-auto"
      style={spriteStyle}
    />
  );
}
