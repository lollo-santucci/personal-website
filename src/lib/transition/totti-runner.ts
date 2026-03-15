const SPRITE_BASE = '/assets/characters/totti/spritesheets';
const FRAME_SIZE = 32;

const TOTTI_RUNNING = {
  sheet: `${SPRITE_BASE}/BROWN_DOG_RUNNING.png`,
  sheetWidth: 128,
  sheetHeight: 224,
  cols: 4,
  rowRight: 5,
  rowLeft: 3,
  frames: 4,
  frameDurationMs: 100,
} as const;

/** Preload the running spritesheet. Returns the Image once loaded. */
export function preloadTottiSheet(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = TOTTI_RUNNING.sheet;
  });
}

/**
 * Compute responsive scale for Totti based on viewport width.
 * Mobile: 4x (128px), Tablet: 5x (160px), Desktop: 6x (192px)
 */
function getScale(viewportWidth: number): number {
  if (viewportWidth < 768) return 8;
  if (viewportWidth < 1280) return 10;
  return 12;
}

/**
 * Draw Totti on a canvas context.
 * @param direction 'right' for cover phase, 'left' for reveal phase
 */
export function drawTotti(
  ctx: CanvasRenderingContext2D,
  spriteImage: HTMLImageElement,
  frame: number,
  x: number,
  y: number,
  viewportWidth: number,
  direction: 'left' | 'right',
): void {
  const scale = getScale(viewportWidth);
  const row = direction === 'right' ? TOTTI_RUNNING.rowRight : TOTTI_RUNNING.rowLeft;
  const srcX = (frame % TOTTI_RUNNING.frames) * FRAME_SIZE;
  const srcY = row * FRAME_SIZE;
  const destSize = FRAME_SIZE * scale;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteImage,
    srcX, srcY, FRAME_SIZE, FRAME_SIZE,
    x, y, destSize, destSize,
  );
}

/** Get the display size of Totti for a given viewport width */
export function getTottiSize(viewportWidth: number): number {
  return FRAME_SIZE * getScale(viewportWidth);
}

export { TOTTI_RUNNING };
