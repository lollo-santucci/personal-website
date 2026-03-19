'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import TransitionLink from '@/components/TransitionLink';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

type ButtonVariant = 'primary' | 'secondary' | 'dark';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant: ButtonVariant;
  size: ButtonSize;
  icon?: ReactNode;
  showIcon?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsAnchor = ButtonBaseProps & { href: string; as?: never } & Omit<
  ComponentPropsWithoutRef<'a'>,
  keyof ButtonBaseProps | 'href' | 'as'
>;

type ButtonAsSpan = ButtonBaseProps & { as: 'span'; href?: never };

type ButtonAsButton = ButtonBaseProps & { href?: never; as?: never } & Omit<
  ComponentPropsWithoutRef<'button'>,
  keyof ButtonBaseProps | 'as'
>;

export type ButtonProps = ButtonAsAnchor | ButtonAsSpan | ButtonAsButton;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-surface hover:bg-primary/80',
  secondary: 'bg-surface text-text hover:bg-text/5',
  dark: 'bg-text text-surface hover:bg-text/80',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'text-xs md:text-sm xl:text-[16px] 2xl:text-[18px] px-2 py-0.5 md:px-2.5 md:py-1',
  sm: 'text-sm md:text-base xl:text-[20px] 2xl:text-[22px] px-3 py-1 md:px-3 md:py-1.5',
  md: 'text-lg md:text-xl xl:text-[30px] 2xl:text-[36px] px-4 py-1.5 md:px-5 md:py-3',
  lg: 'text-xl md:text-2xl xl:text-[32px] 2xl:text-[40px] px-5 py-2 md:px-6 md:py-3',
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
    as,
    ...rest
  } = props;

  const classes = [
    'group inline-flex items-center gap-2 border-standard border-black outline outline-3 outline-text font-pixbob-regular transition-all duration-200 motion-reduce:transition-none hover:-translate-y-0.5 active:translate-y-0',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconElement = showIcon ? (icon ?? <ArrowUpRight className="size-[1em]" />) : null;

  if (href) {
    return (
      <TransitionLink href={href} className={classes} {...(rest as Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className'>)}>
        {children}
        {iconElement}
      </TransitionLink>
    );
  }

  if (as === 'span') {
    return (
      <span className={classes}>
        {children}
        {iconElement}
      </span>
    );
  }

  return (
    <button className={classes} {...(rest as Omit<ComponentPropsWithoutRef<'button'>, 'className'>)}>
      {children}
      {iconElement}
    </button>
  );
}
