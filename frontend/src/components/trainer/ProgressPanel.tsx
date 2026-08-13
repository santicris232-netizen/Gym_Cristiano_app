import { useEffect, useState } from "react";
import { ProgressTable } from "./ProgressTable";
import { ProgressChart, type ProgressExerciseOption } from "./ProgressChart";
import { Spinner } from "../ui/Spinner";
import { api } from "../../lib/api";
import type { PlanDayOut, SessionSummaryOut, WeightUnit } from "../../types";

export function ProgressPanel({
  userId,
  weightUnit,
  planDays,
}: {
  userId: string;
  weightUnit: WeightUnit;
  planDays: PlanDayOut[];
}) {
  const [sessions, setSessions] = useState<SessionSummaryOut[] | null>(null);

  useEffect(() => {
    let active = true;
    api.get<SessionSummaryOut[]>(`/users/${userId}/sessions`).then((data) => {
      if (active) setSessions(data);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!sessions) {
    return (
      <div className="flex justify-center py-10 text-cream-dim">
        <Spinner />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-cream-dim">
        Este alumno todavía no registró ningún entrenamiento.
      </p>
    );
  }

  // Ejercicios candidatos para el selector del gráfico: los del plan
  // asignado (de cualquier día) UNIDOS a los que aparecen en el
  // historial de sesiones. Antes el selector solo miraba el plan
  // actual, así que si un ejercicio se sacaba del plan, su progreso
  // pasado quedaba inaccesible aunque los datos siguieran ahí.
  const exerciseOptions = new Map<string, ProgressExerciseOption>();
  for (const day of planDays) {
    for (const entry of day.entries) {
      exerciseOptions.set(entry.exercise.id, { id: entry.exercise.id, name: entry.exercise.name });
    }
  }
  for (const session of sessions) {
    for (const setLog of session.set_logs) {
      if (!exerciseOptions.has(setLog.exercise_id)) {
        exerciseOptions.set(setLog.exercise_id, {
          id: setLog.exercise_id,
          name: setLog.exercise_name,
        });
      }
    }
  }
  const exercises = Array.from(exerciseOptions.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-8">
      <ProgressChart userId={userId} weightUnit={weightUnit} exercises={exercises} />
      <ProgressTable sessions={sessions} weightUnit={weightUnit} />
    </div>
  );
}
