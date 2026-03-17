'use client';

import { useEffect, useRef } from 'react';

// ── Sprite config ───────────────────────────────────────────────────────────
const SPRITE_BASE = '/assets/characters/totti/spritesheets';
const F = 32;

interface SpriteConfig {
  src: string;
  cols: number;
  row: number;
  frames: number;
  ms: number;
}

const RUNNING_R: SpriteConfig = {
  src: `${SPRITE_BASE}/BROWN_DOG_RUNNING.png`,
  cols: 4, row: 5, frames: 4, ms: 100,
};
const RUNNING_L: SpriteConfig = {
  src: `${SPRITE_BASE}/BROWN_DOG_RUNNING.png`,
  cols: 4, row: 2, frames: 4, ms: 100,
};

const EATING: SpriteConfig = {
  src: `${SPRITE_BASE}/BROWN_DOG_EATING.png`,
  cols: 4, row: 3, frames: 4, ms: 200,
};

const SITTING_R: SpriteConfig = {
  src: `${SPRITE_BASE}/BROWN_DOG_SITTING.png`,
  cols: 5, row: 10, frames: 4, ms: 250,
};
const SITTING_L: SpriteConfig = {
  src: `${SPRITE_BASE}/BROWN_DOG_SITTING.png`,
  cols: 5, row: 4, frames: 4, ms: 250,
};

const BOWL_SRC = '/assets/characters/totti/props/PET_PROPS.png';
const BOWL_COL = 0;
const BOWL_ROW = 0;

// ── Canvas constants ────────────────────────────────────────────────────────
const BAR_H = 100; // tall enough for sprite at 3x (96px) + ground
const LERP = 0.1;
const IDLE_DELAY = 250;

type TottiState = 'running' | 'sitting' | 'eating';
type Dir = 'left' | 'right';

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── Component ───────────────────────────────────────────────────────────────
interface Props {
  articleRef: React.RefObject<HTMLElement | null>;
}

export default function TottiScrollProgress({ articleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let targetP = 0;
    let renderP = 0;
    let state: TottiState = 'sitting';
    let dir: Dir = 'right';
    let pendingDir: Dir = 'right';
    let dirAccum = 0; // accumulated scroll delta for direction confirmation
    let frame = 0;
    let lastFrameT = 0;
    let lastScrollT = 0;
    let scrolling = false;
    let cssW = 0;
    let reduced = false;
    let raf = 0;
    const sheets: Record<string, HTMLImageElement> = {};
    let ready = false;

    // ── Preload ─────────────────────────────────────────────────────────
    const srcs = [RUNNING_R.src, EATING.src, SITTING_R.src, BOWL_SRC];
    Promise.all(srcs.map(loadImg)).then((imgs) => {
      for (let i = 0; i < srcs.length; i++) sheets[srcs[i]] = imgs[i];
      ready = true;
    });

    // ── Reduced motion ──────────────────────────────────────────────────
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduced = mql.matches;
    const onMql = (e: MediaQueryListEvent) => { reduced = e.matches; };
    mql.addEventListener('change', onMql);

    // ── Resize ──────────────────────────────────────────────────────────
    function resize() {
      const rect = cv!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cssW = rect.width;
      cv!.width = Math.round(rect.width * dpr);
      cv!.height = Math.round(BAR_H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Scroll ──────────────────────────────────────────────────────────
    let prevScrollY = window.scrollY;

    function onScroll() {
      const el = articleRef.current;
      if (!el) return;

      // End = bottom of article reaches bottom of viewport
      const rect = el.getBoundingClientRect();
      const articleBottom = rect.bottom + window.scrollY;
      const endScroll = articleBottom - window.innerHeight;
      if (endScroll <= 0) { targetP = 0; return; }

      // Start = top of page (scrollY=0), end = article bottom in view
      const p = Math.max(0, Math.min(1, window.scrollY / endScroll));

      // Track direction
      const scrollDelta = window.scrollY - prevScrollY;
      prevScrollY = window.scrollY;

      const newDir: Dir = scrollDelta > 0 ? 'right' : 'left';
      const wasRunning = state === 'running';

      if (wasRunning) {
        // While running: accumulate to prevent mid-run flips
        if (newDir === pendingDir) {
          dirAccum += Math.abs(scrollDelta);
        } else {
          pendingDir = newDir;
          dirAccum = Math.abs(scrollDelta);
        }
        if (dirAccum > 15) {
          dir = pendingDir;
        }
      } else if (Math.abs(scrollDelta) > 2) {
        // From sitting/eating: commit direction immediately
        dir = newDir;
        pendingDir = newDir;
        dirAccum = 0;
      }

      targetP = p;
      lastScrollT = performance.now();
      scrolling = true;

      if (p >= 0.98) {
        state = 'eating';
      } else if (!wasRunning) {
        state = 'running';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ── Draw helpers ────────────────────────────────────────────────────
    function getScale(): number {
      if (cssW < 500) return 2;
      if (cssW < 900) return 2.5;
      return 3;
    }

    function drawSprite(cfg: SpriteConfig, f: number, x: number, y: number, s: number) {
      const img = sheets[cfg.src];
      if (!img) return;
      ctx!.imageSmoothingEnabled = false;
      ctx!.drawImage(img, (f % cfg.cols) * F, cfg.row * F, F, F, x, y, F * s, F * s);
    }

    function drawBowl(x: number, y: number, s: number) {
      const img = sheets[BOWL_SRC];
      if (!img) return;
      ctx!.imageSmoothingEnabled = false;
      ctx!.drawImage(img, BOWL_COL * F, BOWL_ROW * F, F, F, x, y, F * s, F * s);
    }

    // ── Pick sprite config based on state + direction ───────────────────
    function getCfg(): SpriteConfig {
      if (state === 'eating') return EATING;
      if (state === 'running') return dir === 'right' ? RUNNING_R : RUNNING_L;
      return dir === 'right' ? SITTING_R : SITTING_L;
    }

    // ── RAF loop ────────────────────────────────────────────────────────
    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (!ready) return;

      const W = cssW;

      // Idle → sitting (only when scroll stopped AND lerp settled)
      if (scrolling && now - lastScrollT > IDLE_DELAY) {
        scrolling = false;
      }
      if (!scrolling && state === 'running' && Math.abs(targetP - renderP) < 0.003) {
        state = 'sitting';
      }

      // Lerp position
      const diff = targetP - renderP;
      if (Math.abs(diff) < 0.0003) {
        renderP = targetP;
      } else {
        renderP += diff * LERP;
      }

      // Advance frame
      const cfg = getCfg();
      if (!reduced && now - lastFrameT >= cfg.ms) {
        frame = (frame + 1) % cfg.frames;
        lastFrameT = now;
      }

      // ── Render ────────────────────────────────────────────────────────
      const s = getScale();
      const spriteD = F * s;
      const pad = 16;

      ctx!.clearRect(0, 0, W, BAR_H);

      // Progress trail (left → right)
      const trailW = renderP * (W - pad * 2);
      if (trailW > 0) {
        ctx!.fillStyle = 'rgba(252,92,70,0.05)';
        ctx!.fillRect(pad, 0, trailW, BAR_H);
      }

      // Top accent line (left → right)
      const lineW = renderP * W;
      if (lineW > 0) {
        ctx!.fillStyle = 'rgba(252,92,70,0.3)';
        ctx!.fillRect(0, 0, lineW, 2);
      }

      // Hairline separator
      ctx!.fillStyle = 'rgba(34,34,34,0.06)';
      ctx!.fillRect(0, 0, W, 1);

      // Ground line
      const gy = BAR_H - 2;
      ctx!.fillStyle = 'rgba(34,34,34,0.05)';
      ctx!.fillRect(pad, gy, W - pad * 2, 1);

      // Bowl position (independent)
      const bowlS = s * 0.7;
      const bowlD = F * bowlS;
      const bowlX = W - pad - bowlD + (spriteD - bowlD)/2;
      const bowlY = BAR_H - bowlD;

      // Totti track (independent from bowl visual position)
      const trackL = pad;
      const trackR = W - pad - spriteD; // Totti's rightmost stop
      const tottiX = trackL + renderP * (trackR - trackL);
      const tottiY = BAR_H - spriteD;

      // Paw prints behind Totti
      ctx!.fillStyle = 'rgba(34,34,34,0.06)';
      for (let x = pad; x < tottiX; x += 14) {
        ctx!.fillRect(x, gy - 2, 2, 2);
        ctx!.fillRect(x + 5, gy - 4, 2, 2);
      }

      // Totti (drawn first → prop on top)
      drawSprite(cfg, reduced ? 0 : frame, tottiX, tottiY, s);

      // Prop — drawn second → Prop on top
      drawBowl(bowlX, bowlY, bowlS);

      // Percentage
      const pct = Math.round(renderP * 100);
      if (pct > 0 && pct < 100) {
        ctx!.font = `${9 * (s / 3)}px monospace`;
        ctx!.fillStyle = 'rgba(34,34,34,0.2)';
        ctx!.textAlign = 'left';
        ctx!.fillText(`${pct}%`, pad, 14);
      }
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      mql.removeEventListener('change', onMql);
    };
  }, [articleRef]);

  return (
    <div className="sticky bottom-0 z-10 w-full bg-surface">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: BAR_H, imageRendering: 'pixelated' }}
        aria-hidden="true"
      />
    </div>
  );
}
