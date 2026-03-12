import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <ul className="mt-6 space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <a
              href={`/blog/${post.slug}`}
              className="text-lg font-semibold underline-offset-2 hover:underline"
            >
              {post.title}
            </a>
            <time className="mt-1 block text-sm text-gray-500">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <p className="mt-1 text-sm text-gray-600">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
