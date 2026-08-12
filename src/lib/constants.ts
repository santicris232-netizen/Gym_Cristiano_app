export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const DAY_SHORT_NAMES = [
  "LUN",
  "MAR",
  "MIÉ",
  "JUE",
  "VIE",
  "SÁB",
  "DOM",
] as const;

/** JS `Date#getDay()` usa 0=Domingo..6=Sábado; nuestro `dayOfWeek` usa 0=Lunes..6=Domingo. */
export function jsDayToPlanDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export const BODY_PARTS = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
] as const;

export const BODY_PART_LABELS_ES: Record<string, string> = {
  back: "Espalda",
  cardio: "Cardio",
  chest: "Pecho",
  "lower arms": "Antebrazos",
  "lower legs": "Piernas (bajo)",
  neck: "Cuello",
  shoulders: "Hombros",
  "upper arms": "Brazos",
  "upper legs": "Piernas",
  waist: "Abdomen",
};

export function bodyPartLabel(bodyPart: string): string {
  return BODY_PART_LABELS_ES[bodyPart] ?? bodyPart;
}

/** Clave de fecha estable "YYYY-MM-DD" en horario local, usada como
 *  clave de idempotencia de sesiones de entrenamiento. */
export function todayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const SESSION_COOKIE_NAME = "session";
