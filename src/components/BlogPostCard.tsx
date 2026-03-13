import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/format';

export default function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-lg border border-gray-200 p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <Link
          href={`/blog/${post.slug}`}
          className="text-lg font-semibold hover:underline"
        >
          {post.title}
        </Link>
        <time className="shrink-0 text-xs text-gray-500">
          {formatDate(post.date)}
        </time>
      </div>

      <p className="mb-3 text-sm text-gray-600">{post.excerpt}</p>

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
    </article>
  );
}
