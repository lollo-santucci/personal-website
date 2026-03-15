'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// State machine types & pure transition function (exported for PBT testing)
// ---------------------------------------------------------------------------

export type TottiState = 'sitting' | 'playful' | 'sleeping';
export type TottiEvent =
  | 'playful_timer'
  | 'inactivity_timeout'
  | 'playful_complete'
  | 'user_interaction';

export function tottiTransition(
  state: TottiState,
  event: TottiEvent,
): TottiState {
  if (state === 'sitting' && event === 'playful_timer') return 'playful';
  if (state === 'sitting' && event === 'inactivity_timeout') return 'sleeping';
  if (state === 'playful' && event === 'playful_complete') return 'sitting';
  if (state === 'sleeping' && event === 'user_interaction') return 'sitting';
  return state;
}

// ---------------------------------------------------------------------------
// Spritesheet constants
// ---------------------------------------------------------------------------

const SPRITE_BASE = '/assets/characters/totti/spritesheets';
const FRAME_SIZE = 32; // px per frame in the spritesheet
const SCALE = 16;
const DISPLAY_SIZE = FRAME_SIZE * SCALE; // 512px full frame

// Crop: trim empty space around Totti so the layout box is tight.
// Values are in original sprite pixels (before scaling).
const CROP_TOP = 7;
const CROP_BOTTOM = 1;
const CROP_LEFT = 3;
const CROP_RIGHT = 3;
const VISUAL_WIDTH = (FRAME_SIZE - CROP_LEFT - CROP_RIGHT) * SCALE;   // ~352px
const VISUAL_HEIGHT = (FRAME_SIZE - CROP_TOP - CROP_BOTTOM) * SCALE;  // ~384px

// Sitting spritesheet: 160×352 → 5 cols × 11 rows
// Use row 4 (0-indexed) for front-facing tail wagging — 5 frames
const SITTING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_SITTING.png`,
  sheetWidth: 160,
  sheetHeight: 352,
  cols: 5,
  row: 10, // right-facing tail wagging row
  frames: 4,
} as const;

// Playful/playful spritesheet: 128×128 → 4 cols × 4 rows
// Use row 0 (0-indexed) for front-facing playful/playful — 4 frames
const PLAYFUL = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_PLAYFUL.png`,
  sheetWidth: 128,
  sheetHeight: 128,
  cols: 4,
  row: 3, // right-facing playful row
  frames: 4,
} as const;

// Sleeping spritesheet: 128×64 → 4 cols × 2 rows
// Use row 0 (0-indexed) for sleeping animation — 4 frames
const SLEEPING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_SLEEPING.png`,
  sheetWidth: 128,
  sheetHeight: 64,
  cols: 4,
  row: 1, // right-facing sleeping row
  frames: 4,
} as const;

// Static frame for reduced-motion: right-facing from sitting sheet, col 0 row 5
const STATIC_FRAME = {
  sheet: SITTING.sheet,
  col: 0,
  row: SITTING.row,
} as const;

// Timing constants
const PLAYFUL_MIN_INTERVAL = 8000; // ms
const PLAYFUL_MAX_INTERVAL = 15000; // ms
const PLAYFUL_LOOPS = 2; // playful animation repeats this many times
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
  const playfulEnd = (PLAYFUL.frames - 1) * DISPLAY_SIZE;
  const sleepingEnd = (SLEEPING.frames - 1) * DISPLAY_SIZE;

  style.textContent = `
    @keyframes ${getKeyframeName('sitting')} {
      from { background-position-x: 0px; }
      to { background-position-x: -${sittingEnd}px; }
    }
    @keyframes ${getKeyframeName('playful')} {
      from { background-position-x: 0px; }
      to { background-position-x: -${playfulEnd}px; }
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

  const playfulTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playfulAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  // Helper: random playful interval
  // -------------------------------------------------------------------------
  const randomPlayfulDelay = useCallback(
    () =>
      PLAYFUL_MIN_INTERVAL +
      Math.random() * (PLAYFUL_MAX_INTERVAL - PLAYFUL_MIN_INTERVAL),
    [],
  );

  // -------------------------------------------------------------------------
  // Clear all timers
  // -------------------------------------------------------------------------
  const clearAllTimers = useCallback(() => {
    if (playfulTimerRef.current) {
      clearTimeout(playfulTimerRef.current);
      playfulTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (playfulAnimTimerRef.current) {
      clearTimeout(playfulAnimTimerRef.current);
      playfulAnimTimerRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Start timers for the sitting state
  // -------------------------------------------------------------------------
  const startSittingTimers = useCallback(() => {
    // Schedule a random playful moment
    playfulTimerRef.current = setTimeout(() => {
      setState((prev) => tottiTransition(prev, 'playful_timer'));
    }, randomPlayfulDelay());

    // Schedule inactivity → sleeping
    inactivityTimerRef.current = setTimeout(() => {
      setState((prev) => tottiTransition(prev, 'inactivity_timeout'));
    }, INACTIVITY_TIMEOUT);
  }, [randomPlayfulDelay]);

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
    } else if (state === 'playful') {
      // Playful animation completes after all frames play twice
      const playfulDuration = PLAYFUL.frames * FRAME_DURATION_MS * PLAYFUL_LOOPS;
      playfulAnimTimerRef.current = setTimeout(() => {
        setState((prev) => tottiTransition(prev, 'playful_complete'));
      }, playfulDuration);
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

  // Wrapper style: tight box around Totti, sprite offset inside via negative margin
  const wrapperStyle: React.CSSProperties = {
    width: VISUAL_WIDTH,
    height: VISUAL_HEIGHT,
    overflow: 'hidden',
  };

  const spriteOffset: React.CSSProperties = {
    marginTop: -(CROP_TOP * SCALE),
    marginLeft: -(CROP_LEFT * SCALE),
  };

  // Reduced motion: static right-facing frame
  if (prefersReducedMotion) {
    return (
      <div className="mx-auto" style={wrapperStyle} role="img" aria-label="Totti the companion dog">
        <div
          className="pixel-art"
          style={{ ...buildStaticStyle(), ...spriteOffset }}
        />
      </div>
    );
  }

  // Animated: pick config based on current state
  const config =
    state === 'playful' ? PLAYFUL : state === 'sleeping' ? SLEEPING : SITTING;

  const animationName = getKeyframeName(state);
  const totalDuration = config.frames * FRAME_DURATION_MS;
  // For sitting & sleeping: loop infinitely. For playful: play twice then transition.
  const iterationCount = state === 'playful' ? PLAYFUL_LOOPS : 'infinite';

  const spriteStyle: React.CSSProperties = {
    ...buildSpriteStyle(config),
    ...spriteOffset,
    animation: `${animationName} ${totalDuration}ms steps(${config.frames - 1}) ${iterationCount}`,
  };

  return (
    <div className="mx-auto" style={wrapperStyle} role="img" aria-label="Totti the companion dog">
      <div className="pixel-art" style={spriteStyle} />
    </div>
  );
}
