import type { Metadata } from 'next';
import { getProjects, getBlogPosts, getAgents } from '@/lib/content';
import { formatAgentIndex } from '@/lib/format';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import AgentSprite from '@/components/AgentSprite';
import ProjectCard from '@/components/ProjectCard';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A selection of projects built by Lorenzo Santucci — full-stack applications, AI systems, and developer tools.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const [projects, agents, posts] = await Promise.all([
    getProjects(),
    getAgents(),
    getBlogPosts(),
  ]);

  const sortedAgents = sortAgentsByIndex(agents);

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Agentdex',
      href: '/agentdex',
      items: sortedAgents.slice(0, 3).map((agent) => ({
        label: `${formatAgentIndex(agent.index)} - ${agent.name}`,
        href: `/agentdex/${String(agent.slug)}`,
        thumbnail: <AgentSprite slug={String(agent.slug)} name={agent.name} scale={1} animations={['walk-down', 'walk-right']} autoPlay hoverToAnimate className="shrink-0 mr-[15px]" />,
      })),
    },
    {
      title: 'Blog',
      href: '/blog',
      items: posts.slice(0, 3).map((post) => ({
        label: post.title,
        href: `/blog/${String(post.slug)}`,
      })),
    },
  ];

  return (
    <InnerPageLayout
      title="Projects"
      ctaHeadline="Have a project in mind?"
      ctaBody="Let's talk about how to turn it into something clear, useful and well built."
      crossLinkSections={crossLinkSections}
    >
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {projects.map((project, index) => (
            <Reveal key={String(project.slug)} delay={index * 80}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="font-pixbob-regular text-lg md:text-xl xl:text-[22px] 2xl:text-[26px] text-text-muted">
          No projects yet. Check back soon!
        </p>
      )}
    </InnerPageLayout>
  );
}
