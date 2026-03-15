import ArrowUpRight from '@/components/ui/ArrowUpRight';

interface CrossLinkItem {
  label: string;
  href: string;
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
        <div key={section.href}>
          <a
            href={section.href}
            className="inline-flex items-center gap-2 font-pixbob-bold text-xl md:text-2xl xl:text-[48px] mb-4 md:mb-6"
          >
            {section.title}
            <ArrowUpRight className="size-[1em]" />
          </a>
          <div className="flex flex-col gap-3 md:gap-4">
            {section.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center justify-between gap-2 border-standard border-black bg-surface font-pixbob-regular text-lg md:text-xl xl:text-[36px] px-4 py-2 md:px-5 md:py-3"
              >
                {item.label}
                <ArrowUpRight className="size-[1em] flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
