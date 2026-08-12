"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExerciseThumb } from "@/components/ui/ExerciseThumb";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Stepper } from "@/components/user/SetStepper";
import { SetLogList } from "@/components/user/SetLogList";
import { stepFor, toDisplayWeight } from "@/lib/units";
import type { ExerciseSummary } from "@/types";
import type { WeightUnit } from "@/generated/prisma/client";

interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
}

interface RawSetLog {
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
}

export function TrainScreen({
  exercise,
  plannedSets,
  plannedReps,
  dayOfWeek,
  weightUnit,
}: {
  exercise: ExerciseSummary;
  plannedSets: number;
  plannedReps: number;
  dayOfWeek: number;
  weightUnit: WeightUnit;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [weight, setWeight] = useState(weightUnit === "LB" ? 45 : 20);
  const [reps, setReps] = useState(plannedReps);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = stepFor(weightUnit);
  const nextSetNumber = loggedSets.length + 1;
  const done = loggedSets.length >= plannedSets;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayOfWeek }),
        });
        const data = await res.json();
        if (!active) return;
        setSessionId(data.sessionId);

        const detailRes = await fetch(`/api/sessions/${data.sessionId}`);
        const detail = await detailRes.json();
        if (!active) return;

        const existing: LoggedSet[] = ((detail.setLogs ?? []) as RawSetLog[])
          .filter((s) => s.exerciseId === exercise.id)
          .map((s) => ({
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
          }));
        setLoggedSets(existing);
        if (existing.length > 0) {
          const last = existing[existing.length - 1];
          setWeight(Math.round(toDisplayWeight(last.weightKg, weightUnit) * 10) / 10);
        }
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveSet() {
    if (!sessionId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          setNumber: nextSetNumber,
          weight,
          reps,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la serie.");
        return;
      }
      setLoggedSets((prev) => [
        ...prev,
        {
          setNumber: data.setLog.setNumber,
          weightKg: data.setLog.weightKg,
          reps: data.setLog.reps,
        },
      ]);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-cream-dim">
        <Spinner className="h-8 w-8" />
        <p className="font-mono text-xs tracking-widest uppercase">
          Preparando tu sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Link
        href={`/dashboard/exercise/${exercise.id}`}
        className="mb-4 self-start text-xs font-semibold tracking-wide text-cream-dim uppercase hover:text-neon-blue"
      >
        ← Ver instrucciones
      </Link>

      <ExerciseThumb src={exercise.image} alt="" size={72} className="mb-3" />
      <h1 className="mb-1 font-display text-2xl tracking-wide text-cream">
        {exercise.name}
      </h1>

      {done ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-counter text-3xl tracking-wide text-neon-gold">
            ¡Ejercicio completo! 🔥
          </p>
          <p className="text-sm text-cream-dim">
            Registraste {loggedSets.length} de {plannedSets} series.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Volver a mi semana
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-6 font-mono text-sm text-neon-blue">
            Serie {nextSetNumber} de {plannedSets}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 rounded-xl border border-line bg-surface p-6">
            <Stepper
              label={`Peso (${weightUnit.toLowerCase()})`}
              value={weight}
              step={step}
              min={0}
              onChange={setWeight}
            />
            <Stepper
              label="Repeticiones"
              value={reps}
              step={1}
              min={1}
              onChange={setReps}
            />
          </div>

          {error && <p className="mt-3 text-xs text-usa-red">{error}</p>}

          <Button
            onClick={handleSaveSet}
            disabled={saving}
            className="mt-6 w-full max-w-xs"
          >
            {saving ? "Guardando..." : `Guardar serie ${nextSetNumber}`}
          </Button>
        </>
      )}

      <SetLogList sets={loggedSets} weightUnit={weightUnit} />
    </div>
  );
}
