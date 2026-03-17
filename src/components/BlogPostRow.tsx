'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TransitionLink from '@/components/TransitionLink';

interface BlogPostRowProps {
  href: string;
  date: string;
  title: string;
  excerpt: string;
  isNew?: boolean;
}

export default function BlogPostRow({ href, date, title, excerpt, isNew }: BlogPostRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TransitionLink
      href={href}
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Title row */}
      <div
        className="flex items-center justify-between gap-6 transition-transform duration-200 motion-reduce:transition-none"
        style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}
      >
        <div className="flex flex-1 min-w-0 items-center gap-6 font-pixbob-regular text-xl md:text-4xl xl:text-[42px]">
          <span className="shrink-0 text-text-muted md:text-4xl">
            {date}
          </span>
          <span
            className="shrink-0 font-pixbob-regular text-2xl md:text-3xl xl:text-[40px] text-text transition-all duration-200 motion-reduce:transition-none"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(-8px)',
            }}
            aria-hidden="true"
          >
            {'>'}
          </span>
          <span className="truncate">{title}</span>
          {isNew && (
            <Badge variant="accent" className="shrink-0">
              New
            </Badge>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button variant="secondary" size="sm" as="span">
            Read
          </Button>
        </div>
      </div>

      {/* Excerpt expand */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        style={{
          gridTemplateRows: isHovered ? '1fr' : '0fr',
          opacity: isHovered ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <p className="pt-2 md:pt-4 font-manrope text-sm md:text-lg xl:text-xl text-text-muted line-clamp-2">
            {excerpt}
          </p>
        </div>
      </div>
    </TransitionLink>
  );
}
