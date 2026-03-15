import TransitionLink from '@/components/TransitionLink';

interface BreadcrumbProps {
  items: Array<{ label: string; href: string }>;
  current: string;
}

export default function Breadcrumb({ items, current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 font-pixbob-regular text-base md:text-lg xl:text-[48px]">
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <TransitionLink href={item.href} className="text-text-muted hover:text-text">
              {item.label}/
            </TransitionLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
