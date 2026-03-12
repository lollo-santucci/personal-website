import type { Metadata } from 'next';
import { getProjects } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <ul className="mt-6 space-y-6">
        {projects.map((project) => (
          <li key={project.slug}>
            <a
              href={`/projects/${project.slug}`}
              className="text-lg font-semibold underline-offset-2 hover:underline"
            >
              {project.title}
            </a>
            <p className="mt-1 text-sm text-gray-600">{project.description}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
