import { useEffect, useState } from "react";
import { ProgressTable } from "./ProgressTable";
import { ProgressChart, type ProgressExerciseOption } from "./ProgressChart";
import { Spinner } from "../ui/Spinner";
import { api, ApiError } from "../../lib/api";
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
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Reseteamos al arrancar: si no, al cambiar de alumno se puede ver
    // por un instante el historial (o el error) del alumno anterior.
    setSessions(null);
    setSessionsError(null);
    api
      .get<SessionSummaryOut[]>(`/users/${userId}/sessions`)
      .then((data) => {
        if (!active) return;
        setSessions(data);
        setSessionsError(null);
      })
      .catch((err) => {
        if (!active) return;
        // Sin esto, un error acá dejaba "sessions" en null para siempre
        // y el panel quedaba con el spinner girando indefinidamente.
        setSessions([]);
        setSessionsError(err instanceof ApiError ? err.message : "No se pudo cargar el historial.");
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
        {sessionsError ?? "Este alumno todavía no registró ningún entrenamiento."}
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
