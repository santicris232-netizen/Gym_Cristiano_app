import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { todayDayOfWeek } from "../lib/constants";
import { TrainScreen } from "../components/user/TrainScreen";
import { Spinner } from "../components/ui/Spinner";
import type { ExerciseSummary } from "../types";

export function TrainPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [exercise, setExercise] = useState<ExerciseSummary | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!exerciseId) return;
    let active = true;
    api
      .get<ExerciseSummary>(`/exercises/${exerciseId}`)
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

  if (!exercise || !user) {
    return (
      <div className="flex justify-center py-10 text-cream-dim">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const sets = Math.max(1, Number(searchParams.get("sets")) || 3);
  const reps = Math.max(1, Number(searchParams.get("reps")) || 10);
  const dayParam = Number(searchParams.get("day"));
  const dayOfWeek = Number.isInteger(dayParam) && searchParams.has("day") ? dayParam : todayDayOfWeek();

  return (
    <TrainScreen
      exercise={exercise}
      plannedSets={sets}
      plannedReps={reps}
      dayOfWeek={dayOfWeek}
      weightUnit={user.weight_unit}
    />
  );
}
