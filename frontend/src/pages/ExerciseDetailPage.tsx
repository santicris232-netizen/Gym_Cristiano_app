import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { ExerciseDetailView } from "../components/user/ExerciseDetailView";
import { Spinner } from "../components/ui/Spinner";
import type { ExerciseDetail } from "../types";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!exerciseId) return;
    let active = true;
    api
      .get<ExerciseDetail>(`/exercises/${exerciseId}`)
      .then((data) => {
        if (active) setExercise(data);
      })
      .catch(() => {
        if (active) setNotFound(true);
      });
    return () => {
      active = false;
    };
  }, [exerciseId]);

  if (notFound) return <p className="text-sm text-cream-dim">Ejercicio no encontrado.</p>;

  if (!exercise) {
    return (
      <div className="flex justify-center py-10 text-cream-dim">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const sets = Math.max(1, Number(searchParams.get("sets")) || 3);
  const reps = Math.max(1, Number(searchParams.get("reps")) || 10);
  const dayParam = Number(searchParams.get("day"));

  return (
    <ExerciseDetailView
      exercise={exercise}
      sets={sets}
      reps={reps}
      dayOfWeek={Number.isInteger(dayParam) && searchParams.has("day") ? dayParam : undefined}
    />
  );
}
