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
      <div className="mb-8 text-center md:mb-14">
        <h1
          className="font-pixbob-bold text-7xl text-surface md:text-8xl xl:text-[128px] leading-[0.6] md:leading-[1.2] tracking-[0px] landing-title-stroke"
        >
          Lorenzo Santucci
        </h1>
        <p className="mt-3 font-pixbob-lite text-xl text-text md:text-3xl xl:text-[48px]">
          FULL STACK DEVELOPER <span className="font-pixbob-regular">&amp;</span> AI ENGINEER
        </p>
      </div>

      {/* Two-column: TottiSprite left, LandingMenu right */}
      <div className="flex w-full max-w-content-max flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-16 xl:gap-section-gap">
        <div className="flex shrink-0 items-center justify-center">
          <div className="h-[160px] w-[170px] md:h-[240px] md:w-[250px] xl:h-[384px] xl:w-[416px]">
            <div className="origin-top-left scale-[0.42] md:scale-[0.63] xl:scale-100">
              <TottiSprite />
            </div>
          </div>
        </div>
        <div>
          <LandingMenu />
        </div>
      </div>
      </div>

      <div className="px-6 md:px-12 xl:px-page-px">
        <Footer variant="minimal" />
      </div>
    </div>
  );
}
