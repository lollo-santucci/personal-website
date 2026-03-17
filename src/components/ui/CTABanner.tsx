import ArrowUpRight from '@/components/ui/ArrowUpRight';
import TransitionLink from '@/components/TransitionLink';

interface CTABannerProps {
  headline: string;
  body: string;
  href: string;
  className?: string;
}

export default function CTABanner({ headline, body, href, className }: CTABannerProps) {
  return (
    <TransitionLink
      href={href}
      className={[
        'group block bg-secondary border-standard border-black outline outline-3 outline-text text-surface',
        'px-6 md:px-8 xl:px-[40px] py-4 md:py-5 xl:py-[26px] xl:my-[40px]',
        'transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-0.5 active:translate-y-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span className="font-pixbob-bold text-xl md:text-2xl xl:text-[40px]">
            {headline}
          </span>
          <span className="font-pixbob-regular text-lg md:text-xl xl:text-[36px] leading-[32px]">
            {body}
          </span>
        </div>
        <ArrowUpRight className="size-6 md:size-8 xl:size-10 flex-shrink-0" />
      </div>
    </TransitionLink>
  );
}
