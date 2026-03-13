import type { Metadata } from 'next';
import { getBlogPosts } from '@/lib/content';
import BlogPostCard from '@/components/BlogPostCard';

export const metadata: Metadata = {
  title: 'Blog',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      {posts.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-500">No posts yet.</p>
      )}
    </article>
  );
}
