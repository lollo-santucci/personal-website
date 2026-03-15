'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { TransitionPhase, TransitionEffect, TransitionConfig } from './types';
import { DEFAULT_CONFIG } from './types';
import {
  initPixelDissolve,
  renderPixelDissolve,
  initPixelWipe,
  renderPixelWipe,
  renderDitherFade,
  initTottiRun,
  renderTottiRun,
  type PixelDissolveState,
  type PixelWipeState,
  type TottiRunState,
} from './effects';

interface TransitionCanvasProps {
  phase: TransitionPhase;
  effect: TransitionEffect;
  config?: TransitionConfig;
  tottiImage: HTMLImageElement | null;
  onCoverComplete: () => void;
  onRevealComplete: () => void;
}

type EffectState = PixelDissolveState | PixelWipeState | TottiRunState | null;

function getResponsiveBlockSize(width: number): number {
  if (width < 768) return 48;
  if (width < 1280) return 64;
  return 128;
}

export default function TransitionCanvas({
  phase,
  effect,
  config = DEFAULT_CONFIG,
  tottiImage,
  onCoverComplete,
  onRevealComplete,
}: TransitionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const effectStateRef = useRef<EffectState>(null);
  const initializedRef = useRef(false);

  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const isReveal = phase === 'revealing';

      const activeEffect = effect;

      const duration = isReveal ? config.revealDurationMs : config.coverDurationMs;
      const rawProgress = Math.min(elapsed / duration, 1);
      // Cover: 0→1, Reveal: 1→0 (except totti-run reveal which goes 0→1)
      const progress = isReveal
        ? (activeEffect === 'totti-run' ? rawProgress : 1 - rawProgress)
        : rawProgress;

      // Use CSS pixel dimensions (not physical), since ctx is already scaled by dpr
      const w = window.innerWidth;
      const h = window.innerHeight;
      const blockSize = getResponsiveBlockSize(w);
      const { fillColor } = config;

      // Initialize effect state on first frame
      if (!initializedRef.current) {
        initializedRef.current = true;
        if (activeEffect === 'pixel-dissolve') {
          effectStateRef.current = initPixelDissolve(w, h, blockSize);
        } else if (activeEffect === 'pixel-wipe') {
          effectStateRef.current = initPixelWipe(w, h, blockSize);
        } else if (activeEffect === 'totti-run' && tottiImage) {
          effectStateRef.current = initTottiRun(w, h, blockSize, tottiImage);
        } else if (activeEffect === 'dither-fade') {
          effectStateRef.current = null;
        }
      }

      // Render current effect
      switch (activeEffect) {
        case 'pixel-dissolve':
          renderPixelDissolve(
            ctx,
            effectStateRef.current as PixelDissolveState,
            progress,
            blockSize,
            fillColor,
            w,
            h,
          );
          break;
        case 'pixel-wipe':
          renderPixelWipe(
            ctx,
            effectStateRef.current as PixelWipeState,
            progress,
            blockSize,
            fillColor,
            w,
            h,
          );
          break;
        case 'dither-fade':
          renderDitherFade(ctx, progress, blockSize, fillColor, w, h);
          break;
        case 'totti-run':
          if (tottiImage && effectStateRef.current) {
            renderTottiRun(
              ctx,
              effectStateRef.current as TottiRunState,
              progress,
              blockSize,
              fillColor,
              w,
              h,
              elapsed,
              isReveal ? 'reveal' : 'cover',
            );
          }
          break;
      }

      if (rawProgress >= 1) {
        if (isReveal) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          onRevealComplete();
        } else {
          onCoverComplete();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [phase, effect, config, tottiImage, onCoverComplete, onRevealComplete],
  );

  // Start/stop animation loop
  useEffect(() => {
    if (phase !== 'covering' && phase !== 'revealing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);

      // When revealing, fill canvas immediately so there's no flash between
      // the cover phase ending and the first reveal frame drawing.
      if (phase === 'revealing') {
        ctx.fillStyle = config.fillColor;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }

    // Reset state for new animation
    startTimeRef.current = 0;
    initializedRef.current = false;
    effectStateRef.current = null;

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, animate]);

  if (phase === 'idle') return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
    />
  );
}
