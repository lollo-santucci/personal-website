import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProjects,
  getProjectBySlug,
  getAgents,
  getBlogPosts,
  renderMDX,
} from '@/lib/content';
import { formatAgentIndex } from '@/lib/format';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import Prose from '@/components/ui/Prose';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import ProjectMetadataPanel from '@/components/ProjectMetadataPanel';
import CTABanner from '@/components/ui/CTABanner';
import CrossLinks from '@/components/ui/CrossLinks';
import AgentCrossLinkSprite from '@/components/AgentCrossLinkSprite';
import Reveal from '@/components/Reveal';
import type { CrossLinkSection } from '@/components/ui/CrossLinks';

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: String(p.slug) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${slug}` },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [agents, posts] = await Promise.all([getAgents(), getBlogPosts()]);
  const sortedAgents = sortAgentsByIndex(agents);

  const crossLinkSections: [CrossLinkSection, CrossLinkSection] = [
    {
      title: 'Agentdex',
      href: '/agentdex',
      items: sortedAgents.slice(0, 3).map((agent) => ({
        label: `${formatAgentIndex(agent.index)} - ${agent.name}`,
        href: `/agentdex/${String(agent.slug)}`,
        thumbnail: <AgentCrossLinkSprite slug={String(agent.slug)} name={agent.name} />,
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

  let mdxContent: React.ReactNode;
  try {
    mdxContent = await renderMDX(project.content);
  } catch (error) {
    console.error(
      `Failed to render MDX for project "${project.slug}":`,
      error,
    );
    mdxContent = (
      <p className="italic text-text-muted">Content could not be rendered.</p>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-12 xl:gap-section-gap">
      <Header />

      {/* Breadcrumb */}
      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto max-w-content-max">
          <Breadcrumb
            items={[{ label: 'Projects', href: '/projects' }]}
            current={project.title}
          />
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto max-w-content-max">
          <div className="relative overflow-hidden">
            {/* Background image */}
            <img
              src="/assets/imgs/project-header-bg.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
              aria-hidden="true"
            />

            {/* Content overlay */}
            <div className="relative flex flex-col gap-4 px-6 py-6 md:flex-row md:gap-4 md:px-10 md:py-8">
              {/* Screenshot thumbnail */}
              {project.image && (
                <div className="shrink-0 overflow-hidden border-[5px] border-black md:h-[200px] md:w-[268px]">
                  <img
                    src={String(project.image)}
                    alt={`Screenshot of ${project.title}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Title + badges */}
              <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-3 md:items-end">
                <h1 className="font-pixbob-bold text-4xl text-surface md:text-5xl md:text-right xl:text-[128px]">
                  {project.title}
                </h1>
                {project.integrations && project.integrations.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 md:justify-end">
                    {project.integrations.map((item) => (
                      <Badge key={item.name} variant={(item.variant as BadgeVariant) || 'green'}>
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                ) : project.stack.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 md:justify-end">
                    {project.stack.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="green">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column content */}
      <div className="px-6 md:px-12 xl:px-page-px">
        <div className="mx-auto flex max-w-content-max flex-col gap-8 lg:flex-row md:gap-10">
          {/* Left column — prose */}
          <div className="min-w-0 flex-1">
            <Prose>{mdxContent}</Prose>
          </div>

          {/* Right column — metadata sidebar */}
          <div className="w-full shrink-0 lg:w-80 xl:w-96">
            <ProjectMetadataPanel
              integrations={project.integrations}
              stack={project.stack}
              metrics={project.metrics}
              liveUrl={project.links?.live}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <Reveal>
        <div className="px-6 md:px-12 xl:px-page-px">
          <div className="mx-auto max-w-content-max xl:px-[100px]">
            <CTABanner
              headline="Have a project in mind?"
              body="Let's talk about how to turn it into something clear, useful and well built."
              href="/contact"
            />
          </div>
        </div>
      </Reveal>

      {/* Cross-links */}
      <Reveal delay={100}>
        <div className="px-6 md:px-12 xl:px-page-px">
          <div className="mx-auto max-w-content-max">
            <CrossLinks sections={crossLinkSections} />
          </div>
        </div>
      </Reveal>
    </div>
  );
}
