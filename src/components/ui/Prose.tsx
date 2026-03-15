import type { ReactNode } from 'react';

export interface ProseProps {
  children: ReactNode;
  className?: string;
}

const baseClasses = [
  'prose',
  'font-manrope',
  'text-base md:text-lg xl:text-[26px]',
  'text-text',
  'leading-relaxed',
  'prose-headings:font-pixbob-bold prose-headings:text-2xl prose-headings:md:text-3xl prose-headings:xl:text-[48px]',
].join(' ');

export default function Prose({ children, className }: ProseProps) {
  const classes = [baseClasses, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}
