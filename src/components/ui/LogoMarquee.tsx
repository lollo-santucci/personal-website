'use client';

import Image from 'next/image';

interface LogoItem {
  src: string;
  alt: string;
  href: string;
  height: number;
  className?: string;
}

interface LogoMarqueeProps {
  logos: readonly LogoItem[];
}

export default function LogoMarquee({ logos }: LogoMarqueeProps) {
  // Duplicate logos enough times to fill the viewport seamlessly
  const repeated = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden motion-reduce:overflow-x-auto">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent md:w-24" />

      <div className="flex w-max animate-marquee items-center gap-12 py-4 md:gap-32 motion-reduce:animate-none">
        {repeated.map((logo, i) => (
          <a
            key={`${logo.alt}-${String(i)}`}
            href={logo.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 opacity-60 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={0}
              height={logo.height}
              className={`w-auto ${logo.className ?? 'h-7 md:h-16'}`}
              style={{ width: 'auto' }}
              unoptimized
            />
          </a>
        ))}
      </div>
    </div>
  );
}
