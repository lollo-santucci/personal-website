import Header from '@/components/Header';
import CTABanner from '@/components/ui/CTABanner';
import CrossLinks from '@/components/ui/CrossLinks';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

interface InnerPageLayoutProps {
  title: string;
  ctaHeadline: string;
  ctaBody: string;
  crossLinkSections: [CrossLinkSection, CrossLinkSection];
  children: React.ReactNode;
}

export default function InnerPageLayout({
  title,
  ctaHeadline,
  ctaBody,
  crossLinkSections,
  children,
}: InnerPageLayoutProps) {
  return (
    <div className="flex flex-col gap-8 md:gap-12 xl:gap-section-gap">
      <Header />

      <div className="px-6 md:px-12 xl:px-page-px">
        <h1 className="mx-auto max-w-content-max font-pixbob-bold text-4xl md:text-5xl xl:text-[128px]">
          {title}
        </h1>
      </div>

      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto max-w-content-max">{children}</div>
      </div>

      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto max-w-content-max">
          <CTABanner headline={ctaHeadline} body={ctaBody} href="/contact" />
        </div>
      </div>

      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto max-w-content-max">
          <CrossLinks sections={crossLinkSections} />
        </div>
      </div>
    </div>
  );
}
