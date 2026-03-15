import Link from 'next/link';
import RPGSelector from '@/components/ui/RPGSelector';

const MENU_ITEMS = [
  { label: 'New Game', href: null },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Agentdex', href: '/agentdex' },
  { label: 'Blog', href: '/blog' },
] as const;

export default function LandingMenu() {
  return (
    <nav aria-label="Site navigation">
      <ul className="flex flex-col gap-4 md:gap-6">
        {MENU_ITEMS.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-3 font-pixbob-regular text-2xl text-text md:text-3xl xl:text-[40px]"
              >
                <RPGSelector />
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                tabIndex={-1}
                className="flex items-center gap-3 font-pixbob-regular text-2xl text-text-muted md:text-3xl xl:text-[40px]"
              >
                <RPGSelector className="text-text-muted" />
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
