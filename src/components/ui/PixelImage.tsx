export interface PixelImageProps {
  src: string;
  scale: 2 | 3 | 4;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function PixelImage({
  src,
  scale,
  alt,
  width,
  height,
  className,
}: PixelImageProps) {
  const displayedWidth = width * scale;
  const displayedHeight = height * scale;

  const classes = ['pixel-art', className].filter(Boolean).join(' ');

  return (
    <img
      src={src}
      alt={alt}
      width={displayedWidth}
      height={displayedHeight}
      className={classes}
    />
  );
}
