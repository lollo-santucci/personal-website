import type { ReactNode } from 'react';
import type { BadgeVariant } from '@/components/ui/Badge';
import { badgeBaseClasses, badgeVariantClasses } from '@/components/ui/Badge';

export interface SectionLabelProps {
  variant: BadgeVariant;
  as?: 'h2' | 'h3' | 'h4' | 'span';
  children: ReactNode;
  className?: string;
}

export default function SectionLabel({
  variant,
  as: Tag = 'span',
  children,
  className,
}: SectionLabelProps) {
  const classes = [badgeBaseClasses, badgeVariantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
