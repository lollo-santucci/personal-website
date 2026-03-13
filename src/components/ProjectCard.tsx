import Link from 'next/link';
import type { Project } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-gray-200 p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link
          href={`/projects/${project.slug}`}
          className="text-lg font-semibold hover:underline"
        >
          {project.title}
        </Link>
        <StatusBadge status={project.status} />
      </div>

      <p className="mb-3 text-sm text-gray-600">{project.description}</p>

      {project.stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
    </article>
  );
}
