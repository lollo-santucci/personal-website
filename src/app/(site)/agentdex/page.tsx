import type { Metadata } from 'next';
import { getAgents, getBlogPosts, getProjects } from '@/lib/content';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import AgentCard from '@/components/AgentCard';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export const metadata: Metadata = {
  title: 'Agentdex',
  description:
    "Browse Lorenzo's AI agents — specialized entities built to assist with real-world tasks.",
  alternates: { canonical: '/agentdex' },
};

export default async function AgentdexPage() {
  const [agents, posts, projects] = await Promise.all([
    getAgents(),
    getBlogPosts(),
    getProjects(),
  ]);

  const sortedAgents = sortAgentsByIndex(agents);

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Blog',
      href: '/blog',
      items: posts.slice(0, 3).map((post) => ({
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
      title="Agentdex"
      ctaHeadline="Want to build an Agent?"
      ctaBody="Hire me!"
      crossLinkSections={crossLinkSections}
    >
      {sortedAgents.length > 0 ? (
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12 lg:grid-cols-4 lg:gap-14">
          {sortedAgents.map((agent, index) => (
            <Reveal key={String(agent.slug)} delay={index * 100}>
              <AgentCard agent={agent} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="font-pixbob-regular text-lg md:text-xl xl:text-[22px] 2xl:text-[26px] text-text-muted">
          No agents yet. Check back soon!
        </p>
      )}
    </InnerPageLayout>
  );
}
