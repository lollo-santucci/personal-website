import type { ReactNode } from 'react';

export interface StatBarProps {
  label: string;
  value: number;
  className?: string;
}

export interface StatBarGroupProps {
  children: ReactNode;
  className?: string;
}

function clampValue(value: number): number {
  const rounded = Math.round(value);
  return Math.max(1, Math.min(5, rounded));
}

export default function StatBar({ label, value, className }: StatBarProps) {
  const clamped = clampValue(value);

  const rectangles = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < clamped;
    return (
      <div
        key={i}
        className={`w-8 h-3 md:w-10 md:h-4 border-2 border-black ${isFilled ? 'bg-lime' : 'bg-surface'}`}
      />
    );
  });

  return (
    <div
      role="img"
      aria-label={`${label}: ${clamped} out of 5`}
      className={className}
    >
      <div className="flex flex-col-reverse gap-0.5">{rectangles}</div>
      <span className="font-pixbob-regular text-lg md:text-xl xl:text-[32px]">
        {label}
      </span>
    </div>
  );
}

export function StatBarGroup({ children, className }: StatBarGroupProps) {
  const classes = ['flex gap-2 md:gap-3', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
