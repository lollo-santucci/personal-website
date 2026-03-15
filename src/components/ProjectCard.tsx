import Link from 'next/link';
import type { Project } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

export interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex flex-col">
      <Link href={`/projects/${project.slug}`} className="group block">
        {/* Screenshot area with offset shadow */}
        <div className="relative mb-4">
          {/* Offset shadow */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-text" />

          {/* Image frame */}
          <div className="relative border-frame border-black bg-surface">
            {project.image ? (
              <img
                src={project.image}
                alt={`Screenshot of ${project.title}`}
                className="block w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-surface">
                <span className="font-pixbob-regular text-text-muted">
                  No preview
                </span>
              </div>
            )}

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

        {/* Title + description */}
        <h3 className="flex items-center gap-1 font-pixbob-bold text-lg md:text-xl xl:text-[36px] text-text">
          {project.title}
          <ArrowUpRight className="size-[1em]" />
        </h3>
        {project.description && (
          <p className="mt-1 font-pixbob-regular text-base md:text-lg xl:text-[28px] text-text-muted line-clamp-1">
            {project.description}
          </p>
        )}
      </Link>
    </article>
  );
}
