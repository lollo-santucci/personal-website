import type { Metadata } from 'next';
import { getPageBySlug, renderMDX } from '@/lib/content';

export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const page = await getPageBySlug('about');
  const title = page?.title ?? 'About';

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {page ? (
        <div className="prose mt-6">{await renderMDX(page.content)}</div>
      ) : (
        <div className="mt-6" />
      )}
    </article>
  );
}
