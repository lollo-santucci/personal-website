import ArrowUpRight from '@/components/ui/ArrowUpRight';
import TransitionLink from '@/components/TransitionLink';

interface CrossLinkItem {
  label: string;
  href: string;
  /** Optional thumbnail rendered before the label (e.g. agent sprite). */
  thumbnail?: React.ReactNode;
}

interface CrossLinkSection {
  title: string;
  href: string;
  items: CrossLinkItem[];
}

interface CrossLinksProps {
  sections: [CrossLinkSection, CrossLinkSection];
  className?: string;
}

export type { CrossLinkItem, CrossLinkSection, CrossLinksProps };

export default function CrossLinks({ sections, className }: CrossLinksProps) {
  return (
    <div
      className={[
        'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-crosslink-gap',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {sections.map((section) => (
        <div key={section.href} className="flex flex-col gap-6 md:gap-8 xl:gap-10">
          <TransitionLink
            href={section.href}
            className="group inline-flex items-center gap-2.5 font-pixbob-bold text-xl md:text-2xl xl:text-[48px]"
          >
            {section.title}
            <ArrowUpRight className="size-4 md:size-5 xl:size-6" />
          </TransitionLink>
          <div className="flex flex-wrap gap-4 md:gap-6 xl:gap-10 ">
            {section.items.map((item) => (
              <TransitionLink
                key={item.href}
                href={item.href}
                className="group inline-flex items-center gap-2.5 border-standard border-black bg-surface font-pixbob-regular text-lg md:text-xl xl:text-[36px] px-4 py-2 md:px-5 md:py-3 xl:px-[25px] xl:py-4 outline outline-3 outline-text transition-all duration-200 motion-reduce:transition-none hover:-translate-y-0.5"
              >
                {item.thumbnail}
                {item.label}
                <ArrowUpRight className="size-4 md:size-5 xl:size-6 flex-shrink-0" />
              </TransitionLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
