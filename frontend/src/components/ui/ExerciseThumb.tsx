export function ExerciseThumb({
  src,
  alt,
  size = 48,
  className = "",
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`shrink-0 rounded-md border border-line bg-surface-2 object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
