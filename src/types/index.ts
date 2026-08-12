import type { WeightUnit } from "@/generated/prisma/client";

/** Ejercicio resumido, para listas/combobox/tarjetas del día. */
export interface ExerciseSummary {
  id: string;
  name: string;
  image: string;
  bodyPart: string;
  equipment: string;
  target: string;
}

/** Ejercicio completo, para la pantalla de detalle. */
export interface ExerciseDetail extends ExerciseSummary {
  category: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  instructionsEs: string;
  instructionStepsEs: string[];
  gifUrl: string;
  attribution: string;
}

export interface PlanEntryDTO {
  id: string;
  order: number;
  sets: number;
  reps: number;
  notes: string | null;
  exercise: ExerciseSummary;
}

export interface PlanDayDTO {
  dayOfWeek: number;
  entries: PlanEntryDTO[];
}

export interface SetLogDTO {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
}

export interface SessionSummaryDTO {
  id: string;
  dateKey: string;
  dayOfWeek: number;
  completed: boolean;
  setLogs: SetLogDTO[];
}

export interface ProgressPointDTO {
  sessionId: string;
  date: string;
  dateKey: string;
  maxWeightKg: number;
  sets: { setNumber: number; weightKg: number; reps: number }[];
}

export interface UserSummaryDTO {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastTrainedAt: string | null;
}

export interface CurrentUserDTO {
  id: string;
  name: string;
  email: string;
  role: "TRAINER" | "USER";
  weightUnit: WeightUnit;
}
