"use client";

import { useEffect, useState } from "react";
import { ProgressTable } from "@/components/trainer/ProgressTable";
import { ProgressChart } from "@/components/trainer/ProgressChart";
import { Spinner } from "@/components/ui/Spinner";
import type { SessionSummaryDTO, PlanDayDTO } from "@/types";
import type { WeightUnit } from "@/generated/prisma/client";

export function ProgressPanel({
  userId,
  weightUnit,
  planDays,
}: {
  userId: string;
  weightUnit: WeightUnit;
  planDays: PlanDayDTO[];
}) {
  const [sessions, setSessions] = useState<SessionSummaryDTO[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/users/${userId}/sessions`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setSessions(data.sessions ?? []);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Ejercicios candidatos para el selector del gráfico: todos los del
  // plan asignado (de cualquier día), sin duplicar.
  const planExercises = Array.from(
    new Map(
      planDays.flatMap((d) => d.entries).map((e) => [e.exercise.id, e.exercise]),
    ).values(),
  );

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

  return (
    <div className="space-y-8">
      <ProgressChart
        userId={userId}
        weightUnit={weightUnit}
        exercises={planExercises}
      />
      <ProgressTable sessions={sessions} weightUnit={weightUnit} />
    </div>
  );
}
