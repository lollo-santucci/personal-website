'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rectangles = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < clamped;
    const fillStyle: React.CSSProperties =
      isFilled && !prefersReducedMotion
        ? {
            transformOrigin: 'bottom',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transition: `transform 300ms ease-out ${i * 100}ms`,
          }
        : {};

    return (
      <div
        key={i}
        className="relative w-8 h-2.5 md:w-10 md:h-3 border-3 border-black bg-surface"
      >
        {isFilled && (
          <div
            className="absolute inset-0 bg-lime"
            style={fillStyle}
          />
        )}
      </div>
    );
  });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${label}: ${clamped} out of 5`}
      className={['flex flex-col items-center', className].filter(Boolean).join(' ')}
    >
      <div className="flex flex-col-reverse gap-1.5 xl:gap-2 p-2 xl:p-2.5">{rectangles}</div>
      <div className="p-2 xl:p-2">
        <span className="font-pixbob-regular text-lg md:text-xl xl:text-[26px] 2xl:text-[32px] leading-[32px] text-center whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}

export function StatBarGroup({ children, className }: StatBarGroupProps) {
  const classes = ['flex gap-2 md:gap-2.5 xl:gap-5 items-center justify-center', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}
