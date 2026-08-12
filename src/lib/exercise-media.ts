// Los ejercicios importados del dataset "exercises-dataset"
// (github.com/hasaneyldrm/exercises-dataset) guardan `image` y `gifUrl`
// como rutas relativas ("images/xxxx.jpg", "videos/xxxx.gif"), tal cual
// vienen en el dataset original. No vendorizamos los binarios en este
// repo: los servimos en runtime desde jsDelivr, apuntando al repo del
// dataset (ver next.config.ts -> images.remotePatterns).

const DATASET_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/";

export function exerciseMediaUrl(relativePath: string): string {
  return `${DATASET_CDN_BASE}${relativePath}`;
}

export const exerciseImageUrl = exerciseMediaUrl;
export const exerciseGifUrl = exerciseMediaUrl;

export const DATASET_ATTRIBUTION_URL = "https://gymvisual.com/";
export const DATASET_SOURCE_URL =
  "https://github.com/hasaneyldrm/exercises-dataset";
