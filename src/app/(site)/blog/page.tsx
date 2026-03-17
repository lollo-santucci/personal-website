import type { Metadata } from 'next';
import { getBlogPosts, getAgents, getProjects } from '@/lib/content';
import { formatDateDDMMYYYY, isRecentPost } from '@/lib/format';
import { formatAgentIndex } from '@/lib/format';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import AgentSprite from '@/components/AgentSprite';
import CollectionContainer from '@/components/ui/CollectionContainer';
import BlogPostRow from '@/components/BlogPostRow';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articles, essays, and tutorials on full-stack development, AI engineering, and building things that work.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const [posts, agents, projects] = await Promise.all([
    getBlogPosts(),
    getAgents(),
    getProjects(),
  ]);

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

  return (
    <InnerPageLayout
      title="Blog"
      ctaHeadline="Read something interesting?"
      ctaBody="Let's discuss it!"
      crossLinkSections={crossLinkSections}
    >
      {posts.length > 0 ? (
        <CollectionContainer>
          <div className="flex flex-col gap-6 md:gap-10">
            {posts.map((post, index) => (
              <Reveal key={String(post.slug)} delay={index * 80}>
                <BlogPostRow
                  href={`/blog/${String(post.slug)}`}
                  date={formatDateDDMMYYYY(post.date)}
                  title={post.title}
                  excerpt={post.excerpt}
                  isNew={isRecentPost(post.date)}
                />
              </Reveal>
            ))}
          </div>
        </CollectionContainer>
      ) : (
        <CollectionContainer>
          <p className="font-pixbob-regular text-lg md:text-xl xl:text-[26px] text-text-muted">
            No posts yet. Check back soon!
          </p>
        </CollectionContainer>
      )}
    </InnerPageLayout>
  );
}
