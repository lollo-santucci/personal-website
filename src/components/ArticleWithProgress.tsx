'use client';

import { useRef } from 'react';
import TottiScrollProgress from '@/components/TottiScrollProgress';

interface ArticleWithProgressProps {
  children: React.ReactNode;
}

export default function ArticleWithProgress({ children }: ArticleWithProgressProps) {
  const articleRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={articleRef}>{children}</div>
      <TottiScrollProgress articleRef={articleRef} />
    </>
  );
}
