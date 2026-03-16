interface ArrowUpRightProps {
  className?: string;
}

export default function ArrowUpRight({ className }: ArrowUpRightProps) {
  const classes = [
    'transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1 group-hover:-translate-y-1',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      width="16"
      height="16"
      className={classes}
      aria-hidden="true"
    >
      <path d="M4 12L12 4M12 4H5M12 4V11" />
    </svg>
  );
}
