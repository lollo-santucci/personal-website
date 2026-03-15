import { drawTotti, getTottiSize, TOTTI_RUNNING } from './totti-runner';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Compute grid dimensions for the given canvas and block size */
function gridDims(w: number, h: number, blockSize: number) {
  const cols = Math.ceil(w / blockSize);
  const rows = Math.ceil(h / blockSize);
  return { cols, rows, total: cols * rows };
}

/** Deterministic shuffle using Fisher-Yates with a seed derived from timestamp */
function shuffleIndices(total: number, seed: number): number[] {
  const arr = Array.from({ length: total }, (_, i) => i);
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Effect: Pixel Dissolve
// ---------------------------------------------------------------------------

export interface PixelDissolveState {
  indices: number[];
  cols: number;
}

export function initPixelDissolve(
  w: number, h: number, blockSize: number,
): PixelDissolveState {
  const { cols, total } = gridDims(w, h, blockSize);
  return { indices: shuffleIndices(total, Date.now()), cols };
}

export function renderPixelDissolve(
  ctx: CanvasRenderingContext2D,
  state: PixelDissolveState,
  progress: number,
  blockSize: number,
  fillColor: string,
  canvasW: number,
  canvasH: number,
): void {
  const { indices, cols } = state;
  const count = Math.floor(progress * indices.length);

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = fillColor;

  for (let i = 0; i < count; i++) {
    const idx = indices[i];
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
  }
}

// ---------------------------------------------------------------------------
// Effect: Pixel Wipe
// ---------------------------------------------------------------------------

export interface PixelWipeState {
  cols: number;
  rows: number;
  direction: 'ltr' | 'rtl';
}

export function initPixelWipe(
  w: number, h: number, blockSize: number,
): PixelWipeState {
  const { cols, rows } = gridDims(w, h, blockSize);
  return { cols, rows, direction: Math.random() > 0.5 ? 'ltr' : 'rtl' };
}

export function renderPixelWipe(
  ctx: CanvasRenderingContext2D,
  state: PixelWipeState,
  progress: number,
  blockSize: number,
  fillColor: string,
  canvasW: number,
  canvasH: number,
): void {
  const { cols, rows, direction } = state;
  // Add a few columns of stagger for curtain feel
  const staggerCols = 3;
  const totalProgress = cols + staggerCols;

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = fillColor;

  const currentCol = progress * totalProgress;

  for (let c = 0; c < cols; c++) {
    const col = direction === 'ltr' ? c : cols - 1 - c;
    for (let r = 0; r < rows; r++) {
      // Stagger: each row is offset slightly
      const stagger = (r % staggerCols) * 0.5;
      if (c + stagger < currentCol) {
        ctx.fillRect(col * blockSize, r * blockSize, blockSize, blockSize);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Effect: Dither Fade
// ---------------------------------------------------------------------------

// 4x4 Bayer matrix for ordered dithering
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export function renderDitherFade(
  ctx: CanvasRenderingContext2D,
  progress: number,
  blockSize: number,
  fillColor: string,
  canvasW: number,
  canvasH: number,
): void {
  const { cols, rows } = gridDims(canvasW, canvasH, blockSize);
  const threshold = progress * 16; // Bayer values are 0-15

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = fillColor;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bayerValue = BAYER_4X4[r % 4][c % 4];
      if (bayerValue < threshold) {
        ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Effect: Totti Run-Across
// ---------------------------------------------------------------------------

export interface TottiRunState {
  cols: number;
  rows: number;
  spriteImage: HTMLImageElement;
  frameCounter: number;
  lastFrameTime: number;
}

export function initTottiRun(
  w: number, h: number, blockSize: number,
  spriteImage: HTMLImageElement,
): TottiRunState {
  const { cols, rows } = gridDims(w, h, blockSize);
  return { cols, rows, spriteImage, frameCounter: 0, lastFrameTime: 0 };
}

export function renderTottiRun(
  ctx: CanvasRenderingContext2D,
  state: TottiRunState,
  progress: number,
  blockSize: number,
  fillColor: string,
  canvasW: number,
  canvasH: number,
  elapsed: number,
  phase: 'cover' | 'reveal',
): void {
  const { cols, rows, spriteImage } = state;
  const tottiSize = getTottiSize(canvasW);

  // Wipe progress mapped to columns (left to right in both phases)
  const wipeProgress = progress;
  const wipeFrontCol = Math.floor(wipeProgress * (cols + 2));

  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = fillColor;

  if (phase === 'cover') {
    // Fill columns from left up to wipe front
    for (let c = 0; c < cols; c++) {
      if (c <= wipeFrontCol) {
        for (let r = 0; r < rows; r++) {
          ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
      }
    }

    // Totti runs ahead of the wipe (only during cover)
    const tottiX = -tottiSize + (canvasW + tottiSize) * progress;
    const tottiY = (canvasH - tottiSize) / 2;

    const frameDuration = TOTTI_RUNNING.frameDurationMs;
    if (elapsed - state.lastFrameTime >= frameDuration) {
      state.frameCounter++;
      state.lastFrameTime = elapsed;
    }

    drawTotti(ctx, spriteImage, state.frameCounter, tottiX, tottiY, canvasW, 'right');
  } else {
    // Reveal: same wipe direction (left to right) but clearing — fill what's still covered
    for (let c = 0; c < cols; c++) {
      if (c > wipeFrontCol) {
        for (let r = 0; r < rows; r++) {
          ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
      }
    }
  }
}
