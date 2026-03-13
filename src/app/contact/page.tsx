import type { Metadata } from 'next';
import { getPageBySlug, renderMDX } from '@/lib/content';
import MdxContent from '@/components/MdxContent';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact');

  return {
    title: page?.title ?? 'Contact',
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const page = await getPageBySlug('contact');
  const title = page?.title ?? 'Contact';

  let mdxContent: React.ReactNode = null;
  if (page) {
    try {
      mdxContent = await renderMDX(page.content);
    } catch (error) {
      console.error('Failed to render contact page MDX content:', error);
      mdxContent = <p>Content could not be rendered.</p>;
    }
  }

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {page ? (
        <MdxContent>{mdxContent}</MdxContent>
      ) : (
        <div className="mt-6" />
      )}
    </article>
  );
}
