import type { Metadata } from 'next';
import { getBlogPosts, getAgents, getProjects } from '@/lib/content';
import { formatDateDDMMYYYY, isRecentPost } from '@/lib/format';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import CollectionContainer from '@/components/ui/CollectionContainer';
import CollectionRow from '@/components/ui/CollectionRow';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RPGSelector from '@/components/ui/RPGSelector';
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
        label: agent.name,
        href: `/agentdex/${String(agent.slug)}`,
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
          <div className="flex flex-col gap-3 md:gap-4">
            {posts.map((post, index) => (
              <Reveal key={String(post.slug)} delay={index * 80}>
                <CollectionRow
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      href={`/blog/${String(post.slug)}`}
                    >
                      Read
                    </Button>
                  }
                >
                  <div className="flex items-center gap-2 font-pixbob-regular text-lg md:text-xl xl:text-[26px]">
                    <span className="shrink-0 text-text-muted">
                      {formatDateDDMMYYYY(post.date)}
                    </span>
                    <RPGSelector className="shrink-0" />
                    <span className="truncate">{post.title}</span>
                    {isRecentPost(post.date) && (
                      <Badge variant="accent" className="shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                </CollectionRow>
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
