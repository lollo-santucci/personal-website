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
import InnerPageLayout from '@/components/InnerPageLayout';
import Breadcrumb from '@/components/Breadcrumb';
import Prose from '@/components/ui/Prose';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import ProjectMetadataPanel from '@/components/ProjectMetadataPanel';
import AgentSprite from '@/components/AgentSprite';
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

  const heroContent = (
    <div className="px-6 md:px-12 xl:px-[120px] 2xl:px-page-px">
      <div className="mx-auto max-w-content-max flex flex-col gap-3 md:gap-4">
        <Breadcrumb
          items={[{ label: 'Projects', href: '/projects' }]}
          current={project.title}
        />
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
            <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-1 md:items-end">
              <div className="flex flex-col gap-1 md:gap-2 md:items-end">
                <h1 className="font-pixbob-bold text-4xl text-surface md:text-5xl md:text-right xl:text-[96px] 2xl:text-[128px]">
                  {project.title}
                </h1>
                {project.description && (
                  <p className="font-pixbob-regular text-base text-surface/80 md:text-lg md:text-right xl:text-[30px] 2xl:text-[36px]">
                    {project.description}
                  </p>
                )}
              </div>
              {project.integrations && project.integrations.length > 0 ? (
                <div className="flex flex-wrap gap-4 md:justify-end">
                  {project.integrations.map((item) => (
                    <Badge key={item.name} variant={(item.variant as BadgeVariant) || 'green'}>
                      {item.name}
                    </Badge>
                  ))}
                </div>
              ) : project.stack.length > 0 ? (
                <div className="flex flex-wrap gap-4 md:justify-end">
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
  );

  return (
    <InnerPageLayout
      title={project.title}
      hero={heroContent}
      ctaHeadline="Have a project in mind?"
      ctaBody="Let's talk about how to turn it into something clear, useful and well built."
      crossLinkSections={crossLinkSections}
    >
      <div className="flex flex-col gap-8 lg:flex-row md:justify-between">
        {/* Left column — prose */}
        <div className="min-w-0 lg:basis-[55%]">
          <Prose className="max-w-none">{mdxContent}</Prose>
        </div>

        {/* Right column — metadata sidebar */}
        <div className="min-w-0 lg:basis-[40%]">
          <ProjectMetadataPanel
            integrations={project.integrations}
            stack={project.stack}
            metrics={project.metrics}
            liveUrl={project.links?.live}
          />
        </div>
      </div>
    </InnerPageLayout>
  );
}
