export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/office', label: 'Office' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Determine if a nav link is active for the given pathname.
 * - Home (`/`) matches only exactly.
 * - Other links match exactly or as a prefix (e.g., `/projects/foo` activates `/projects`).
 */
export function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
