import type { Metadata } from 'next';
import LandingMenu from '@/components/LandingMenu';
import TottiSprite from '@/components/TottiSprite';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  description: 'Freelance full-stack developer and ML/AI engineer',
  alternates: { canonical: '/' },
};

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      {/* Main content — centered */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12 xl:px-page-px">
      {/* Title + Subtitle */}
      <div className="mb-10 text-center md:mb-14">
        <h1
          className="font-pixbob-bold text-5xl text-surface md:text-7xl xl:text-[128px] leading-[1.2] tracking-[0px]"
          style={{
            WebkitTextStrokeWidth: '20px',
            WebkitTextStrokeColor: 'var(--black)',
            paintOrder: 'stroke fill',
          }}
        >
          Lorenzo Santucci
        </h1>
        <p className="mt-3 font-pixbob-lite text-lg text-text md:text-2xl xl:text-[48px]">
          FULL STACK DEVELOPER <span className="font-pixbob-regular">&amp;</span> AI ENGINEER
        </p>
      </div>

      {/* Two-column: TottiSprite left, LandingMenu right */}
      <div className="flex w-full max-w-content-max flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-16 xl:gap-section-gap">
        <div className="flex shrink-0 items-center justify-center">
          <TottiSprite />
        </div>
        <div>
          <LandingMenu />
        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}
