'use client';

import { useState, useEffect } from 'react';

const FRAMES = [
  // Frame 0
  [
    [0,0,1,0,0,0,1,0],
    [0,0,0,1,0,1,0,0],
    [0,0,1,1,1,1,1,0],
    [0,1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,0,1,0,0,1,0,1],
    [0,0,0,1,1,0,0,0],
  ],
  // Frame 1
  [
    [0,0,1,0,0,0,1,0],
    [1,0,0,1,0,1,0,0],
    [1,0,1,1,1,1,1,0],
    [1,1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
  ],
];

const PX = 3; // each pixel = 3×3 CSS px
const SIZE = 8;

export default function FooterAlien() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 500);
    return () => clearInterval(id);
  }, []);

  const style = { width: SIZE * PX, height: SIZE * PX };
  const pixels = FRAMES[frame];

  return (
    <svg
      width={style.width}
      height={style.height}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="inline-block"
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      {pixels.map((row, y) =>
        row.map((val, x) =>
          val ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  );
}
