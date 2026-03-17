import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getBlogPosts,
  getBlogPostBySlug,
  getAgents,
  getProjects,
  renderMDX,
} from '@/lib/content';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import { formatDateDDMMYYYY, calculateReadTime, formatAgentIndex } from '@/lib/format';
import InnerPageLayout from '@/components/InnerPageLayout';
import AgentSprite from '@/components/AgentSprite';
import Breadcrumb from '@/components/Breadcrumb';
import Prose from '@/components/ui/Prose';
import Badge from '@/components/ui/Badge';
import ArticleWithProgress from '@/components/ArticleWithProgress';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

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

  const [agents, projects] = await Promise.all([getAgents(), getProjects()]);
  const sortedAgents = sortAgentsByIndex(agents);

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Agentdex',
      href: '/agentdex',
      items: sortedAgents.slice(0, 3).map((agent) => ({
        label: `${formatAgentIndex(agent.index)} - ${agent.name}`,
        href: `/agentdex/${String(agent.slug)}`,
        thumbnail: <AgentSprite slug={String(agent.slug)} name={agent.name} scale={1} className="shrink-0 mr-[15px]" />,
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

  let mdxContent: React.ReactNode;
  try {
    mdxContent = await renderMDX(post.content);
  } catch (error) {
    console.error(`Failed to render MDX for blog post "${post.slug}":`, error);
    mdxContent = (
      <p className="italic text-text-muted">Content could not be rendered.</p>
    );
  }

  const readTime = calculateReadTime(post.content);

  return (
    <InnerPageLayout
      title={post.title}
      ctaHeadline="Read something interesting?"
      ctaBody="Let's discuss it!"
      crossLinkSections={crossLinkSections}
      beforeTitle={
        <Breadcrumb
          items={[{ label: 'Blog', href: '/blog' }]}
          current={post.title}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3 font-pixbob-regular text-base md:text-lg xl:text-[26px]">
        <time className="text-text-muted" dateTime={String(post.date)}>
          {formatDateDDMMYYYY(post.date)}
        </time>
        <span className="text-text-muted">·</span>
        <span className="text-text-muted">{readTime} min read</span>
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {post.categories.map((category) => (
              <Badge key={category} variant="blue">
                {category}
              </Badge>
            ))}
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="violet">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ArticleWithProgress>
        <div className="mt-6 md:mt-8">
          <Prose className="max-w-none">{mdxContent}</Prose>
        </div>
      </ArticleWithProgress>
    </InnerPageLayout>
  );
}
