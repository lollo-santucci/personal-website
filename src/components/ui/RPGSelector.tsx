export interface RPGSelectorProps {
  className?: string;
}

export default function RPGSelector({ className }: RPGSelectorProps) {
  const classes = [
    'inline font-pixbob-regular text-2xl md:text-3xl xl:text-[32px] 2xl:text-[40px] text-text opacity-0 -translate-x-2 transition-all duration-200 motion-reduce:transition-none group-hover:opacity-100 group-hover:translate-x-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{'>'}</span>;
}
