import type { Metadata } from 'next';
import {
  getPageBySlug,
  renderMDX,
  getBlogPosts,
  getProjects,
} from '@/lib/content';
import InnerPageLayout from '@/components/InnerPageLayout';
import Prose from '@/components/ui/Prose';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('contact');

  return {
    title: page?.title ?? 'Contact',
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/contact' },
  };
}

export default async function ContactPage() {
  const [page, blogPosts, projects] = await Promise.all([
    getPageBySlug('contact'),
    getBlogPosts(),
    getProjects(),
  ]);

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

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Blog',
      href: '/blog',
      items: blogPosts.slice(0, 3).map((post) => ({
        label: post.title,
        href: `/blog/${String(post.slug)}`,
      })),
    },
    {
      title: 'Projects',
      href: '/projects',
      items: projects.slice(0, 3).map((project) => ({
        label: project.title,
        href: `/projects/${String(project.slug)}`,
      })),
    },
  ];

  return (
    <InnerPageLayout
      title={title}
      ctaHeadline="Have a project in mind?"
      ctaBody="Let's talk about how to turn it into something clear, useful and well built."
      crossLinkSections={crossLinkSections}
    >
      {mdxContent ? (
        <Prose>{mdxContent}</Prose>
      ) : (
        <div />
      )}
    </InnerPageLayout>
  );
}
