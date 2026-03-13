import type { Metadata } from 'next';
import Link from 'next/link';
import { getPageBySlug } from '@/lib/content/pages';
import { getProjects } from '@/lib/content/projects';
import { getBlogPosts } from '@/lib/content/blog';
import { renderMDX } from '@/lib/content/mdx';
import MdxContent from '@/components/MdxContent';
import ProjectCard from '@/components/ProjectCard';
import BlogPostCard from '@/components/BlogPostCard';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home');

  return {
    ...(page?.title ? { title: page.title } : {}),
    ...(page?.description ? { description: page.description } : {}),
    alternates: { canonical: '/' },
  };
}

export default async function Home() {
  const [page, projects, posts] = await Promise.all([
    getPageBySlug('home'),
    getProjects(),
    getBlogPosts(),
  ]);

  const featuredProjects = projects.filter((p) => p.highlight);
  const latestPosts = posts.slice(0, 3);

  let mdxContent: React.ReactNode = null;
  if (page) {
    try {
      mdxContent = await renderMDX(page.content);
    } catch (error) {
      console.error('Failed to render home page MDX content:', error);
      mdxContent = <p>Content could not be rendered.</p>;
    }
  }

  return (
    <>
      {page && (
        <section className="py-12">
          <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
          <MdxContent>{mdxContent}</MdxContent>
        </section>
      )}

      {featuredProjects.length > 0 && (
        <section className="pb-12">
          <h2 className="mb-6 text-2xl font-bold">Featured Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="pb-12">
          <h2 className="mb-6 text-2xl font-bold">Latest Posts</h2>
          <div className="grid grid-cols-1 gap-6">
            {latestPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="pb-12">
        <Link
          href="/contact"
          className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Get in touch
        </Link>
      </section>

      <section className="pb-12 text-center text-sm text-gray-400">
        Play View — Explore the world
      </section>
    </>
  );
}
