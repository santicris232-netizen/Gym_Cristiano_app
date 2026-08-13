export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const DAY_SHORT_NAMES = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"] as const;

/** 0=Lunes..6=Domingo. `Date#getDay()` de JS usa 0=Domingo, por eso el +6 % 7. */
export function todayDayOfWeek(): number {
  const jsDay = new Date().getDay();
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

export const DATASET_ATTRIBUTION_URL = "https://gymvisual.com/";
export const DATASET_SOURCE_URL = "https://github.com/hasaneyldrm/exercises-dataset";
