import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

type ButtonVariant = 'primary' | 'secondary' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant: ButtonVariant;
  size: ButtonSize;
  icon?: ReactNode;
  showIcon?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsAnchor = ButtonBaseProps & { href: string } & Omit<
  ComponentPropsWithoutRef<'a'>,
  keyof ButtonBaseProps | 'href'
>;

type ButtonAsButton = ButtonBaseProps & { href?: undefined } & Omit<
  ComponentPropsWithoutRef<'button'>,
  keyof ButtonBaseProps
>;

export type ButtonProps = ButtonAsAnchor | ButtonAsButton;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface',
  secondary: 'bg-surface text-text',
  dark: 'bg-text text-surface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm md:text-base xl:text-[22px] px-3 py-1 md:px-3 md:py-1.5',
  md: 'text-lg md:text-xl xl:text-[36px] px-4 py-1.5 md:px-5 md:py-3',
  lg: 'text-xl md:text-2xl xl:text-[40px] px-5 py-2 md:px-6 md:py-3',
};

export default function Button(props: ButtonProps) {
  const {
    variant,
    size,
    href,
    icon,
    showIcon = true,
    children,
    className,
    ...rest
  } = props;

  const classes = [
    'inline-flex items-center gap-2 border-standard border-black font-pixbob-regular',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = showIcon ? (icon ?? <ArrowUpRight className="size-[1em]" />) : null;

  if (href) {
    return (
      <a href={href} className={classes} {...(rest as Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className'>)}>
        {children}
        {iconElement}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<ComponentPropsWithoutRef<'button'>, 'className'>)}>
      {children}
      {iconElement}
    </button>
  );
}
