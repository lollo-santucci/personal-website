import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProjects,
  getProjectBySlug,
  getAgents,
  getBlogPosts,
  renderMDX,
} from '@/lib/content';
import { sortAgentsByIndex } from '@/lib/content/agent-utils';
import InnerPageLayout from '@/components/InnerPageLayout';
import Breadcrumb from '@/components/Breadcrumb';
import Prose from '@/components/ui/Prose';
import Badge from '@/components/ui/Badge';
import ProjectMetadataPanel from '@/components/ProjectMetadataPanel';
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
        label: agent.name,
        href: `/agentdex/${String(agent.slug)}`,
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
    <InnerPageLayout
      title={project.title}
      ctaHeadline="Have a project in mind?"
      ctaBody="Let's talk about how to turn it into something clear, useful and well built."
      crossLinkSections={crossLinkSections}
      beforeTitle={
        <Breadcrumb
          items={[{ label: 'Projects', href: '/projects' }]}
          current={project.title}
        />
      }
    >

      {/* Hero area: screenshot with border frame + tech badges */}
      {project.image && (
        <div className="relative mt-6 mb-6">
          {/* Offset shadow */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-text" />

          {/* Image frame */}
          <div className="relative border-frame border-black bg-surface">
            <img
              src={String(project.image)}
              alt={`Screenshot of ${project.title}`}
              className="block w-full object-cover"
            />

            {/* Tech badges stacked on screenshot */}
            {project.stack.length > 0 && (
              <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="dark">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tech badges below title when no image */}
      {!project.image && project.stack.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="dark">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {/* Two-column layout: prose left, metadata right */}
      <div className="mt-6 flex flex-col lg:flex-row gap-8 md:gap-10">
        {/* Left column — prose content */}
        <div className="flex-1 min-w-0">
          <Prose>{mdxContent}</Prose>
        </div>

        {/* Right column — metadata panel */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <ProjectMetadataPanel
            stack={project.stack}
            liveUrl={project.links?.live}
          />
        </div>
      </div>
    </InnerPageLayout>
  );
}
