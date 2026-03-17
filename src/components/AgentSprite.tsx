'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Animation catalog — all agent spritesheets share the same layout
// ---------------------------------------------------------------------------

const AGENT_ANIMATIONS = {
  'read-book': { row: 7, startCol: 0, frames: 11 },
  'walk-up': { row: 4, startCol: 0, frames: 6 },
  'walk-right': { row: 6, startCol: 0, frames: 6 },
  'walk-down': { row: 0, startCol: 0, frames: 6 },
  'walk-left': { row: 2, startCol: 0, frames: 6 },
} as const;

export type AgentAnimationName = keyof typeof AGENT_ANIMATIONS;

// ---------------------------------------------------------------------------
// Spritesheet constants (universal for all agents)
// ---------------------------------------------------------------------------

const FRAME_W = 32;
const FRAME_H = 64;
const IDLE_COL = 3;
const IDLE_ROW = 0;
const SHEET_W = 1792;
const SHEET_H = 1312;
const FRAME_DURATION_MS = 200;
const ANIM_MIN_INTERVAL = 6000;
const ANIM_MAX_INTERVAL = 12000;

// ---------------------------------------------------------------------------
// Responsive scale
// ---------------------------------------------------------------------------

/** Tailwind breakpoint order for deterministic class output. */
const BREAKPOINT_ORDER = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

type Breakpoint = (typeof BREAKPOINT_ORDER)[number];
type ResponsiveScale = number | Partial<Record<Breakpoint, number>>;

/**
 * Converts the `scale` prop into Tailwind arbitrary-property classes that set
 * `--sprite-scale` at each breakpoint.
 *
 * - `scale={4}`                        → `"[--sprite-scale:4]"`
 * - `scale={{ base: 2, md: 4, xl: 6 }}` → `"[--sprite-scale:2] md:[--sprite-scale:4] xl:[--sprite-scale:6]"`
 */
function scaleClasses(scale: ResponsiveScale): string {
  if (typeof scale === 'number') {
    return `[--sprite-scale:${String(scale)}]`;
  }

  return BREAKPOINT_ORDER
    .filter((bp) => scale[bp] !== undefined)
    .map((bp) => {
      const val = String(scale[bp]);
      return bp === 'base'
        ? `[--sprite-scale:${val}]`
        : `${bp}:[--sprite-scale:${val}]`;
    })
    .join(' ');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentSpriteProps {
  slug: string;
  name: string;
  /** Static number or responsive object, e.g. `{ base: 2, md: 4, xl: 6 }`. Default `4`. */
  scale?: ResponsiveScale;
  animations?: AgentAnimationName[];
  autoPlay?: boolean;
  clickToAnimate?: boolean;
  hoverToAnimate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Keyframe injection (scale-independent — uses var(--sprite-scale))
// ---------------------------------------------------------------------------

function injectKeyframes(
  slug: string,
  animations: AgentAnimationName[],
): void {
  if (typeof document === 'undefined') return;
  const id = `agent-sprite-keyframes-${slug}`;
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;

  const rules = animations
    .map((animName) => {
      const anim = AGENT_ANIMATIONS[animName];
      const fromCol = anim.startCol;
      const toCol = anim.startCol + anim.frames - 1;
      return `
      @keyframes agent-${slug}-${animName} {
        from { background-position-x: calc(${String(-fromCol * FRAME_W)}px * var(--sprite-scale)); }
        to   { background-position-x: calc(${String(-toCol * FRAME_W)}px * var(--sprite-scale)); }
      }`;
    })
    .join('\n');

  style.textContent = rules;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Shared calc()-based inline styles (driven by --sprite-scale)
// ---------------------------------------------------------------------------

const S = 'var(--sprite-scale)';

function baseStyles(sheetUrl: string): React.CSSProperties {
  return {
    width: `calc(${String(FRAME_W)}px * ${S})`,
    height: `calc(${String(FRAME_H)}px * ${S})`,
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: `calc(${String(SHEET_W)}px * ${S}) calc(${String(SHEET_H)}px * ${S})`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
  };
}

function idlePosition(): React.CSSProperties {
  return {
    backgroundPosition: `calc(${String(-IDLE_COL * FRAME_W)}px * ${S}) calc(${String(-IDLE_ROW * FRAME_H)}px * ${S})`,
  };
}

function animPosition(animName: AgentAnimationName, slug: string): React.CSSProperties {
  const anim = AGENT_ANIMATIONS[animName];
  const totalDuration = anim.frames * FRAME_DURATION_MS;
  return {
    backgroundPosition: `calc(${String(-anim.startCol * FRAME_W)}px * ${S}) calc(${String(-anim.row * FRAME_H)}px * ${S})`,
    animation: `agent-${slug}-${animName} ${String(totalDuration)}ms steps(${String(anim.frames - 1)}) 1`,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AgentSprite({
  slug,
  name,
  scale = 4,
  animations = [],
  autoPlay = false,
  clickToAnimate = false,
  hoverToAnimate = false,
  className,
  style: styleProp,
}: AgentSpriteProps) {
  const [activeAnim, setActiveAnim] = useState<AgentAnimationName | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimating = useRef(false);

  const hasAnimations = animations.length > 0;
  const hasTriggers = autoPlay || clickToAnimate || hoverToAnimate;
  const sheetUrl = `/assets/agents/${slug}/spritesheets/character_spritesheet.png`;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Inject keyframes once (scale-independent)
  useEffect(() => {
    if (!prefersReducedMotion && hasAnimations && hasTriggers) {
      injectKeyframes(slug, animations);
    }
  }, [prefersReducedMotion, slug, animations, hasAnimations, hasTriggers]);

  const randomDelay = useCallback(
    () => ANIM_MIN_INTERVAL + Math.random() * (ANIM_MAX_INTERVAL - ANIM_MIN_INTERVAL),
    [],
  );

  const pickRandomAnimation = useCallback(
    () => animations[Math.floor(Math.random() * animations.length)],
    [animations],
  );

  const playAnimation = useCallback(
    (animName: AgentAnimationName, onComplete?: () => void) => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      setActiveAnim(animName);

      const anim = AGENT_ANIMATIONS[animName];
      const duration = anim.frames * FRAME_DURATION_MS;
      animTimerRef.current = setTimeout(() => {
        setActiveAnim(null);
        isAnimating.current = false;
        onComplete?.();
      }, duration);
    },
    [],
  );

  // AutoPlay: schedule random animations at intervals
  useEffect(() => {
    if (prefersReducedMotion || !hasAnimations || !autoPlay) return;

    function scheduleNext() {
      timerRef.current = setTimeout(() => {
        const animName = pickRandomAnimation();
        playAnimation(animName, scheduleNext);
      }, randomDelay());
    }

    scheduleNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      isAnimating.current = false;
    };
  }, [prefersReducedMotion, hasAnimations, autoPlay, pickRandomAnimation, playAnimation, randomDelay]);

  // Click handler
  const handleClick = useCallback(() => {
    if (!clickToAnimate || !hasAnimations || prefersReducedMotion) return;
    if (isAnimating.current) return;

    if (autoPlay && timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const animName = pickRandomAnimation();
    playAnimation(animName, () => {
      if (autoPlay) {
        timerRef.current = setTimeout(() => {
          const next = pickRandomAnimation();
          playAnimation(next);
        }, randomDelay());
      }
    });
  }, [clickToAnimate, hasAnimations, prefersReducedMotion, autoPlay, pickRandomAnimation, playAnimation, randomDelay]);

  // Hover handler
  const handleMouseEnter = useCallback(() => {
    if (!hoverToAnimate || !hasAnimations || prefersReducedMotion) return;
    if (isAnimating.current) return;

    if (autoPlay && timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const animName = pickRandomAnimation();
    playAnimation(animName, () => {
      if (autoPlay) {
        timerRef.current = setTimeout(() => {
          const next = pickRandomAnimation();
          playAnimation(next);
        }, randomDelay());
      }
    });
  }, [hoverToAnimate, hasAnimations, prefersReducedMotion, autoPlay, pickRandomAnimation, playAnimation, randomDelay]);

  // Compose classes: scale classes + pixel-art + user className
  const cls = `${scaleClasses(scale)} pixel-art ${className ?? ''}`.trim();

  // Compose styles
  const base = baseStyles(sheetUrl);
  const posStyles = prefersReducedMotion || activeAnim === null
    ? idlePosition()
    : animPosition(activeAnim, slug);
  const mergedStyle: React.CSSProperties = { ...base, ...posStyles, ...styleProp };

  // Interactive props
  const interactiveProps: React.HTMLAttributes<HTMLDivElement> = {};
  if (clickToAnimate && hasAnimations && !prefersReducedMotion) {
    interactiveProps.onClick = handleClick;
    interactiveProps.onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };
    interactiveProps.tabIndex = 0;
    interactiveProps.role = 'button';
    mergedStyle.cursor = 'pointer';
  }
  if (hoverToAnimate && hasAnimations && !prefersReducedMotion) {
    interactiveProps.onMouseEnter = handleMouseEnter;
  }

  return (
    <div
      role={interactiveProps.role ?? 'img'}
      aria-label={`${name} sprite`}
      className={cls}
      style={mergedStyle}
      {...interactiveProps}
    />
  );
}
