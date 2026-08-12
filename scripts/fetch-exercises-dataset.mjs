// Descarga el dataset público "exercises-dataset"
// (github.com/hasaneyldrm/exercises-dataset) y lo recorta a los campos
// que usa esta app (español + inglés como fallback, sin el resto de
// idiomas) para no versionar un JSON de más de 10MB.
//
// Se ejecuta UNA SOLA VEZ manualmente:
//   node scripts/fetch-exercises-dataset.mjs
// El resultado (prisma/data/exercises.seed.json) se commitea al repo
// como semilla versionada; prisma/seed.ts lo lee sin volver a pegarle
// a la red en cada seed.
//
// Los medios (images/*.jpg, videos/*.gif) NO se descargan: se sirven
// en runtime desde jsDelivr apuntando al repo original (ver
// src/lib/exercise-media.ts), respetando la atribución "© Gym visual".

import { writeFile } from "node:fs/promises";

const SOURCE =
  "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/data/exercises.json";
const OUT = new URL("../prisma/data/exercises.seed.json", import.meta.url);

console.log(`Descargando ${SOURCE} ...`);
const res = await fetch(SOURCE);
if (!res.ok) {
  throw new Error(`Fetch falló: ${res.status} ${res.statusText}`);
}
const raw = await res.json();

if (!Array.isArray(raw)) {
  throw new Error("Formato inesperado: se esperaba un array de ejercicios.");
}

const trimmed = raw.map((e) => ({
  id: e.id,
  name: e.name,
  category: e.category,
  body_part: e.body_part,
  equipment: e.equipment,
  muscle_group: e.muscle_group,
  secondary_muscles: e.secondary_muscles ?? [],
  target: e.target,
  instructions_es: e.instructions?.es ?? e.instructions?.en ?? "",
  instructions_en: e.instructions?.en ?? "",
  instruction_steps_es:
    e.instruction_steps?.es ?? e.instruction_steps?.en ?? [],
  image: e.image,
  gif_url: e.gif_url,
  attribution: e.attribution,
}));

await writeFile(OUT, JSON.stringify(trimmed), "utf-8");
console.log(
  `OK: ${trimmed.length} ejercicios guardados en prisma/data/exercises.seed.json`,
);
