'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Inline media block for MDX content — image or video, centered with a thick border.
 * Usage in MDX:
 *   <ProjectMedia src="/assets/projects/my-project/demo.webp" alt="App screenshot" />
 *   <ProjectMedia src="/assets/projects/my-project/demo.mp4" type="video" />
 *   <ProjectMedia src="/assets/projects/my-project/demo.mp4" type="video" autoPlay={false} />
 */

interface ProjectMediaProps {
  src: string;
  alt?: string;
  type?: 'image' | 'video';
  caption?: string;
  /** Auto-play video on load. Default true. Set false for click-to-play. */
  autoPlay?: boolean;
}

export default function ProjectMedia({
  src,
  alt = '',
  type,
  caption,
  autoPlay = true,
}: ProjectMediaProps) {
  const isVideo =
    type === 'video' || /\.(mp4|webm|mov)$/i.test(src);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) handlePause();
    else handlePlay();
  };

  return (
    <figure className="!my-8 flex flex-col items-center gap-3">
      <div className="w-full max-w-[560px] aspect-[16/10] border-[5px] border-black overflow-hidden relative bg-black">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={src}
              autoPlay={autoPlay}
              loop
              muted
              playsInline
              className="!m-0 absolute inset-0 h-full w-full object-cover"
            />
            {/* Play/pause overlay */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
            >
              <span className="flex items-center justify-center size-12 bg-text/70 text-surface">
                {isPlaying ? (
                  /* Pause icon */
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="4" y="2" width="4" height="16" />
                    <rect x="12" y="2" width="4" height="16" />
                  </svg>
                ) : (
                  /* Play icon */
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <polygon points="4,2 18,10 4,18" />
                  </svg>
                )}
              </span>
            </button>
          </>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 560px) 100vw, 560px"
            className="object-cover"
          />
        )}
      </div>
      {caption && (
        <figcaption className="font-pixbob-regular text-sm md:text-base text-text-muted text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
