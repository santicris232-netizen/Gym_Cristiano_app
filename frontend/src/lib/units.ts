import type { WeightUnit } from "../types";

const KG_TO_LB = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB;
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB;
}

/** Convierte un peso canónico (kg, tal cual lo devuelve la API) a la
 *  unidad preferida del usuario, para mostrarlo en la UI. */
export function toDisplayWeight(weightKg: number, unit: WeightUnit): number {
  return unit === "LB" ? kgToLb(weightKg) : weightKg;
}

export function formatWeight(
  weightKg: number,
  unit: WeightUnit,
  opts: { withUnit?: boolean } = {},
): string {
  const { withUnit = true } = opts;
  const value = toDisplayWeight(weightKg, unit);
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return withUnit ? `${formatted} ${WEIGHT_UNIT_LABEL[unit]}` : formatted;
}

/** Incremento por defecto del stepper de peso: 2.5kg ó 5lb. */
export function stepFor(unit: WeightUnit): number {
  return unit === "LB" ? 5 : 2.5;
}

export const WEIGHT_UNIT_LABEL: Record<WeightUnit, string> = {
  KG: "kg",
  LB: "lb",
};

export const WEIGHT_UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: "KG", label: "Kilogramos (kg)" },
  { value: "LB", label: "Libras (lb)" },
];
