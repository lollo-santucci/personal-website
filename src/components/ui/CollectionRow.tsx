import type { ReactNode } from 'react';

export interface CollectionRowProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function CollectionRow({
  children,
  action,
  className,
}: CollectionRowProps) {
  const classes = [
    'flex items-center justify-between gap-card-gap flex-nowrap transition-all duration-200 motion-reduce:transition-none hover:bg-text/5 hover:translate-x-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
