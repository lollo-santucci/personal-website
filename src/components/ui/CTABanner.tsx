import ArrowUpRight from '@/components/ui/ArrowUpRight';

interface CTABannerProps {
  headline: string;
  body: string;
  href: string;
  className?: string;
}

export default function CTABanner({ headline, body, href, className }: CTABannerProps) {
  return (
    <a
      href={href}
      className={[
        'block bg-secondary border-standard border-black text-surface',
        'px-6 md:px-8 xl:px-12 py-6 md:py-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-pixbob-bold text-xl md:text-2xl xl:text-[40px]">
            {headline}
          </span>
          <span className="font-pixbob-regular text-lg md:text-xl xl:text-[36px]">
            {body}
          </span>
        </div>
        <ArrowUpRight className="size-[1em] flex-shrink-0 text-2xl md:text-3xl" />
      </div>
    </a>
  );
}
