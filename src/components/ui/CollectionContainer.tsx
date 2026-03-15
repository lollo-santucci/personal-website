import type { ReactNode } from 'react';

export interface CollectionContainerProps {
  children: ReactNode;
  className?: string;
}

export default function CollectionContainer({
  children,
  className,
}: CollectionContainerProps) {
  const classes = [
    'border-[6px] md:border-collection border-black',
    'px-4 md:px-6 xl:px-collection-px',
    'py-4 md:py-5 xl:py-collection-py',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
