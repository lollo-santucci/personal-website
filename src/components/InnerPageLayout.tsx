import CTABanner from '@/components/ui/CTABanner';
import CrossLinks from '@/components/ui/CrossLinks';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

interface InnerPageLayoutProps {
  title: string;
  ctaHeadline: string;
  ctaBody: string;
  crossLinkSections: [CrossLinkSection, CrossLinkSection];
  children: React.ReactNode;
  /** Rendered above the title (e.g. breadcrumb). */
  beforeTitle?: React.ReactNode;
  /** Custom hero section replacing the default title block. */
  hero?: React.ReactNode;
  /** Full-width content rendered between children and CTA (no max-width constraint). */
  afterContent?: React.ReactNode;
}

export default function InnerPageLayout({
  title,
  ctaHeadline,
  ctaBody,
  crossLinkSections,
  children,
  beforeTitle,
  hero,
  afterContent,
}: InnerPageLayoutProps) {
  return (
    <div className="flex flex-col gap-10 md:gap-12 xl:gap-12 2xl:gap-section-gap">
      {hero ?? (
        <div className="px-6 md:px-10 xl:px-[120px] 2xl:px-page-px">
          <div className="mx-auto max-w-content-max">
            {beforeTitle}
            <h1 className="font-pixbob-bold text-5xl mb-[-15px] md:text-7xl xl:text-[96px] 2xl:text-[128px]">
              {title}
            </h1>
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 xl:px-[120px] 2xl:px-page-px">
        <div className="mx-auto max-w-content-max">{children}</div>
      </div>

      {afterContent}

      <Reveal>
        <div className="px-6 md:px-10 xl:px-[120px] 2xl:px-page-px">
          <div className="mx-auto max-w-content-max xl:px-[60px] 2xl:px-[100px]">
            <CTABanner headline={ctaHeadline} body={ctaBody} href="/contact" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="px-6 md:px-10 xl:px-[120px] 2xl:px-page-px">
          <div className="mx-auto max-w-content-max">
            <CrossLinks sections={crossLinkSections} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
