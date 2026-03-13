import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjects, getProjectBySlug, renderMDX } from '@/lib/content';
import MdxContent from '@/components/MdxContent';
import StatusBadge from '@/components/StatusBadge';

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

  const hasLinks =
    project.links &&
    (project.links.live || project.links.github || project.links.demo);

  let mdxContent: React.ReactNode;
  try {
    mdxContent = await renderMDX(project.content);
  } catch (error) {
    console.error(`Failed to render MDX for project "${project.slug}":`, error);
    mdxContent = (
      <p className="text-gray-500 italic">Content could not be rendered.</p>
    );
  }

  return (
    <article>
      <Link
        href="/projects"
        className="mb-6 inline-block text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to projects
      </Link>

      <div className="mb-4 flex items-start gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
        <StatusBadge status={project.status} />
      </div>

      {project.stack.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {project.image && (
        <img
          src={String(project.image)}
          alt={project.title}
          className="mb-6 w-full rounded-lg"
        />
      )}

      <MdxContent>{mdxContent}</MdxContent>

      {hasLinks && (
        <div className="mt-8 flex flex-wrap gap-4">
          {project.links!.live && (
            <a
              href={project.links!.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Live Site
            </a>
          )}
          {project.links!.github && (
            <a
              href={project.links!.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              GitHub
            </a>
          )}
          {project.links!.demo && (
            <a
              href={project.links!.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Demo
            </a>
          )}
        </div>
      )}
    </article>
  );
}
