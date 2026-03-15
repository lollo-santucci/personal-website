export type TransitionPhase = 'idle' | 'covering' | 'waiting' | 'revealing';

export type TransitionEffect = 'pixel-dissolve' | 'pixel-wipe' | 'totti-run' | 'dither-fade';

export interface TransitionConfig {
  blockSize: number;
  coverDurationMs: number;
  revealDurationMs: number;
  fillColor: string;
}

export const DEFAULT_CONFIG: TransitionConfig = {
  blockSize: 32,
  coverDurationMs: 600,
  revealDurationMs: 600,
  fillColor: '#222222',
};

/** Duration overrides per effect (cover / reveal in ms) */
export const EFFECT_DURATIONS: Record<TransitionEffect, { cover: number; reveal: number }> = {
  'pixel-dissolve': { cover: 600, reveal: 600 },
  'pixel-wipe': { cover: 700, reveal: 700 },
  'dither-fade': { cover: 500, reveal: 500 },
  'totti-run': { cover: 1500, reveal: 500 },
};

/** Totti run-across appears ~30% of the time */
export const TOTTI_CHANCE = 0.3;

/** Palette colors for transitions — picked randomly each time */
export const TRANSITION_COLORS = [
  '#222222', // black
  '#fc5c46', // accent
  '#b87dfe', // violet
  '#467afc', // blue
  '#cbfd00', // lime
  '#00cf00', // green
];

export function pickTransitionColor(): string {
  return TRANSITION_COLORS[Math.floor(Math.random() * TRANSITION_COLORS.length)];
}
