import type { ReactNode } from 'react';

export type BadgeVariant = 'accent' | 'violet' | 'blue' | 'green' | 'lime' | 'dark';

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export const badgeVariantClasses: Record<BadgeVariant, string> = {
  accent: 'bg-primary text-surface',
  violet: 'bg-secondary text-surface',
  blue: 'bg-blue text-surface',
  green: 'bg-green text-surface',
  lime: 'bg-lime text-text',
  dark: 'bg-text text-surface',
};

export const badgeBaseClasses =
  'inline-flex items-center border-standard border-black font-pixbob-regular text-sm md:text-base xl:text-[22px] px-2 py-0.5 md:px-3 md:py-1';

export default function Badge({ variant, children, className }: BadgeProps) {
  const classes = [badgeBaseClasses, badgeVariantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
