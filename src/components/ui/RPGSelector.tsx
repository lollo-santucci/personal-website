export interface RPGSelectorProps {
  className?: string;
}

export default function RPGSelector({ className }: RPGSelectorProps) {
  const classes = [
    'inline font-pixbob-regular text-2xl md:text-3xl xl:text-[40px] text-text',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{'>'}</span>;
}
