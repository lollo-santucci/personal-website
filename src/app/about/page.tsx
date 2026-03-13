import type { Metadata } from 'next';
import { getPageBySlug, renderMDX } from '@/lib/content';
import MdxContent from '@/components/MdxContent';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');

  return {
    title: page?.title ?? 'About',
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/about' },
  };
}

export default async function AboutPage() {
  const page = await getPageBySlug('about');
  const title = page?.title ?? 'About';

  let mdxContent: React.ReactNode = null;
  if (page) {
    try {
      mdxContent = await renderMDX(page.content);
    } catch (error) {
      console.error('Failed to render about page MDX content:', error);
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
