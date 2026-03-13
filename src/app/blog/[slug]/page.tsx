import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPosts, getBlogPostBySlug, renderMDX } from '@/lib/content';
import MdxContent from '@/components/MdxContent';
import { formatDate } from '@/lib/format';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: String(p.slug) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  let mdxContent: React.ReactNode;
  try {
    mdxContent = await renderMDX(post.content);
  } catch (error) {
    console.error(`Failed to render MDX for blog post "${post.slug}":`, error);
    mdxContent = (
      <p className="text-gray-500 italic">Content could not be rendered.</p>
    );
  }

  return (
    <article>
      <Link
        href="/blog"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to blog
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <time
          className="text-sm text-gray-500"
          dateTime={String(post.date)}
        >
          {formatDate(post.date)}
        </time>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.image && (
        <img
          src={String(post.image)}
          alt={post.title}
          className="mt-6 w-full rounded-lg"
        />
      )}

      <div className="mt-6">
        <MdxContent>{mdxContent}</MdxContent>
      </div>
    </article>
  );
}
