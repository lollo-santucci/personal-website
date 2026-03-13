import type { Metadata } from 'next';
import { getProjects } from '@/lib/content';
import ProjectCard from '@/components/ProjectCard';

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      {projects.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-500">No projects yet.</p>
      )}
    </article>
  );
}
