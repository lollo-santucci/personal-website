import type { ReactNode } from 'react';

export type BadgeVariant = 'accent' | 'violet' | 'blue' | 'green' | 'lime' | 'yellow' | 'dark';

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
  yellow: 'bg-yellow text-text',
  dark: 'bg-text text-surface',
};

export const badgeBaseClasses =
  'inline-flex self-start items-center border-standard border-black outline outline-3 outline-text font-pixbob-regular text-sm md:text-lg xl:text-[24px] 2xl:text-[28px] leading-[32px] px-1 py-0 md:px-2 md:py-1 xl:px-3 xl:py-1.5';

export default function Badge({ variant, children, className }: BadgeProps) {
  const classes = [badgeBaseClasses, badgeVariantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
