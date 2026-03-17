'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface SheetConfig {
  url: string;
  cols: number;
  totalRows: number;
  frameW: number;
  frameH: number;
  row: number;
  frames: number;
  interval: number;
}

const SLEEPING: SheetConfig = {
  url: '/assets/characters/totti/spritesheets/BROWN_DOG_SLEEPING.png',
  cols: 4,
  totalRows: 2,
  frameW: 32,
  frameH: 32,
  row: 0,
  frames: 5,
  interval: 400,
};

const LAYING: SheetConfig = {
  url: '/assets/characters/totti/spritesheets/BROWN_DOG_LAYING.png',
  cols: 5,
  totalRows: 8,
  frameW: 32,
  frameH: 32,
  row: 3,
  frames: 5,
  interval: 300,
};

interface TottiLayingSpriteProps {
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
}

export default function TottiLayingSprite({ className, style, scale = 3 }: TottiLayingSpriteProps) {
  const [sheet, setSheet] = useState<SheetConfig>(SLEEPING);
  const [frame, setFrame] = useState(0);
  const reducedMotion = useRef(false);

  const toggle = useCallback(() => {
    setSheet((prev) => (prev === SLEEPING ? LAYING : SLEEPING));
    setFrame(0);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
    mql.addEventListener('change', handler);

    const id = setInterval(() => {
      if (!reducedMotion.current) {
        setFrame((f) => {
          const next = f + 1;
          // Laying plays once then returns to sleeping
          if (sheet === LAYING && next >= sheet.frames) {
            setSheet(SLEEPING);
            return 0;
          }
          return next % sheet.frames;
        });
      }
    }, sheet.interval);

    return () => {
      clearInterval(id);
      mql.removeEventListener('change', handler);
    };
  }, [sheet]);

  const col = frame % sheet.cols;
  const hasExternalSize = style?.width || style?.height;

  const spriteStyle: React.CSSProperties = hasExternalSize
    ? {
        backgroundImage: `url(${sheet.url})`,
        backgroundSize: `${sheet.cols * 100}% ${sheet.totalRows * 100}%`,
        backgroundPosition: `${sheet.cols > 1 ? (col / (sheet.cols - 1)) * 100 : 0}% ${sheet.totalRows > 1 ? (sheet.row / (sheet.totalRows - 1)) * 100 : 0}%`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        cursor: 'pointer',
        ...style,
      }
    : {
        width: sheet.frameW * scale,
        height: sheet.frameH * scale,
        backgroundImage: `url(${sheet.url})`,
        backgroundSize: `${sheet.frameW * sheet.cols * scale}px auto`,
        backgroundPosition: `-${col * sheet.frameW * scale}px -${sheet.row * sheet.frameH * scale}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        cursor: 'pointer',
        ...style,
      };

  return (
    <div
      className={className}
      style={spriteStyle}
      onClick={toggle}
      role="button"
      aria-label={sheet === SLEEPING ? 'Wake up Totti' : 'Let Totti sleep'}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); }}
    />
  );
}
