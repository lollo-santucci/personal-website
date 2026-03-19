'use client';

import { useRef } from 'react';
import TransitionLink from '@/components/TransitionLink';
import type { Project } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

export interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <article className="flex flex-col">
      <TransitionLink
        href={`/projects/${project.slug}`}
        className="group block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Screenshot area with offset shadow */}
        <div className="relative mb-4">
          {/* Offset shadow */}
          <div className="absolute inset-0 translate-x-4 translate-y-4 bg-text transition-all duration-300 motion-reduce:transition-none group-hover:translate-x-3 group-hover:translate-y-3" />

          {/* Image frame */}
          <div className="relative overflow-hidden border-frame border-black bg-surface aspect-[4/3]">
            {project.image ? (
              <img
                src={project.image}
                alt={`Screenshot of ${project.title}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${project.video ? 'group-hover:opacity-0' : ''}`}
              />
            ) : (
              <img
                src="/assets/projects/fallback.jpg"
                alt={`Screenshot of ${project.title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Video overlay — visible on hover */}
            {project.video && (
              <video
                ref={videoRef}
                src={project.video}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100"
              />
            )}

            {/* Integration badges on screenshot */}
            {project.integrations && project.integrations.length > 0 && (
              <div className="absolute top-2 right-2 flex flex-col items-end gap-4 z-10">
                {project.integrations.map((item) => (
                  <Badge key={item.name} variant={(item.variant as BadgeVariant) || 'green'} className="!self-end">
                    {item.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title + description */}
        <h3 className="flex items-center gap-1 font-pixbob-bold text-lg md:text-xl xl:text-[30px] 2xl:text-[36px] text-text">
          {project.title}
          <ArrowUpRight className="size-[1em]" />
        </h3>
        {project.description && (
          <p className="mt-1 font-pixbob-regular text-base md:text-lg xl:text-[24px] 2xl:text-[28px] text-text-muted line-clamp-1">
            {project.description}
          </p>
        )}
      </TransitionLink>
    </article>
  );
}
