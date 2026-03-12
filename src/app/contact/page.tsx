import type { Metadata } from 'next';
import { getPageBySlug, renderMDX } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const page = await getPageBySlug('contact');
  const title = page?.title ?? 'Contact';

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
