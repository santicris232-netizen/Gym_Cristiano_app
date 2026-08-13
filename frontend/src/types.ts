export type Role = "TRAINER" | "USER";
export type WeightUnit = "KG" | "LB";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  weight_unit: WeightUnit;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  created_at: string;
  last_trained_at: string | null;
}

export interface ExerciseSummary {
  id: string;
  name: string;
  image: string;
  body_part: string;
  equipment: string;
  target: string;
}

export interface ExerciseDetail extends ExerciseSummary {
  category: string;
  muscle_group: string;
  secondary_muscles: string[];
  instructions_es: string;
  instruction_steps_es: string[];
  gif_url: string;
  attribution: string;
}

export interface ExerciseListResponse {
  items: ExerciseSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface PlanEntryOut {
  id: string;
  position: number;
  sets: number;
  reps: number;
  notes: string | null;
  exercise: ExerciseSummary;
}

export interface PlanDayOut {
  day_of_week: number;
  entries: PlanEntryOut[];
}

export interface SetLogOut {
  id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface SessionSummaryOut {
  id: string;
  date_key: string;
  day_of_week: number;
  completed: boolean;
  set_logs: SetLogOut[];
}

export interface ProgressSetPoint {
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface ProgressPointOut {
  session_id: string;
  date: string;
  date_key: string;
  max_weight_kg: number;
  sets: ProgressSetPoint[];
}

export interface CreateSessionResponse {
  session_id: string;
  date_key: string;
  day_of_week: number;
}

export interface SessionDetailOut {
  id: string;
  date_key: string;
  day_of_week: number;
  completed: boolean;
}

export interface SetLogSaved {
  id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface SessionWithSetsOut {
  session: SessionDetailOut;
  set_logs: SetLogSaved[];
}
