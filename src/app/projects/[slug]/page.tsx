import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjects, getProjectBySlug, renderMDX } from '@/lib/content';

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

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
      <div className="prose mt-6">{await renderMDX(project.content)}</div>
    </article>
  );
}
