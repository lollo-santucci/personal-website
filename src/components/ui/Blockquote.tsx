import type { ReactNode } from 'react';

export interface BlockquoteProps {
  children: ReactNode;
  className?: string;
}

const baseClasses =
  'bg-secondary border-l-4 border-l-primary font-pixbob-regular text-surface text-2xl md:text-2xl xl:text-[24px] 2xl:text-[28px] px-6 py-4 md:px-8 md:py-6';

export default function Blockquote({ children, className }: BlockquoteProps) {
  const classes = [baseClasses, className].filter(Boolean).join(' ');

  return <blockquote className={classes}>{children}</blockquote>;
}
