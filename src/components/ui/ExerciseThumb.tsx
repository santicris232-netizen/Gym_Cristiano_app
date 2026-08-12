// Usamos <img> plano (no next/image) para los thumbnails del dataset:
// son ~1300 URLs remotas servidas desde jsDelivr y no necesitan pasar
// por el optimizador de imágenes de Next para este alcance.
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`shrink-0 rounded-md border border-line bg-surface-2 object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
