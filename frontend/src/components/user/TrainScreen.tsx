import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExerciseThumb } from "../ui/ExerciseThumb";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Stepper } from "./SetStepper";
import { SetLogList } from "./SetLogList";
import { stepFor, toDisplayWeight } from "../../lib/units";
import { api, ApiError } from "../../lib/api";
import type {
  CreateSessionResponse,
  ExerciseSummary,
  SessionWithSetsOut,
  SetLogSaved,
  WeightUnit,
} from "../../types";

type Phase = "loading" | "error" | "ready";

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
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("loading");
  const [initError, setInitError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loggedSets, setLoggedSets] = useState<SetLogSaved[]>([]);
  const [weight, setWeight] = useState(weightUnit === "LB" ? 45 : 20);
  const [reps, setReps] = useState(plannedReps);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Antes, si esto fallaba (red caída, servidor caído, etc.), la
  // pantalla igual mostraba el stepper con "Guardar serie" pero sin
  // sessionId — el botón no hacía nada y no se explicaba por qué. Ahora
  // hay un estado de error explícito con botón de reintentar, y el
  // botón de guardar queda deshabilitado (nunca "vivo pero roto")
  // mientras no haya una sesión válida.
  const initSession = useCallback(async () => {
    setPhase("loading");
    setInitError(null);
    try {
      const created = await api.post<CreateSessionResponse>("/sessions", {
        day_of_week: dayOfWeek,
      });
      const detail = await api.get<SessionWithSetsOut>(`/sessions/${created.session_id}`);
      const existing = detail.set_logs.filter((s) => s.exercise_id === exercise.id);

      setSessionId(created.session_id);
      setLoggedSets(existing);
      if (existing.length > 0) {
        const last = existing[existing.length - 1];
        setWeight(Math.round(toDisplayWeight(last.weight_kg, weightUnit) * 10) / 10);
      }
      setPhase("ready");
    } catch (err) {
      setInitError(
        err instanceof ApiError ? err.message : "No se pudo iniciar la sesión de entrenamiento.",
      );
      setPhase("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayOfWeek, exercise.id]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const step = stepFor(weightUnit);
  const nextSetNumber = loggedSets.length + 1;
  const done = loggedSets.length >= plannedSets;

  async function handleSaveSet() {
    if (!sessionId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const setLog = await api.post<SetLogSaved>(`/sessions/${sessionId}/sets`, {
        exercise_id: exercise.id,
        set_number: nextSetNumber,
        weight,
        reps,
      });
      setLoggedSets((prev) => [...prev, setLog]);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "No se pudo guardar la serie. Intenta de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-cream-dim">
        <Spinner className="h-8 w-8" />
        <p className="font-mono text-xs tracking-widest uppercase">Preparando tu sesión...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="font-display text-xl text-usa-red">No pudimos iniciar tu sesión</p>
        <p className="max-w-sm text-sm text-cream-dim">{initError}</p>
        <Button onClick={initSession}>Reintentar</Button>
        <Link
          to={`/dashboard/ejercicio/${exercise.id}`}
          className="text-xs text-cream-dim underline hover:text-neon-blue"
        >
          Volver al ejercicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Link
        to={`/dashboard/ejercicio/${exercise.id}`}
        className="mb-4 self-start text-xs font-semibold tracking-wide text-cream-dim uppercase hover:text-neon-blue"
      >
        ← Ver instrucciones
      </Link>

      <ExerciseThumb src={exercise.image} alt="" size={72} className="mb-3" />
      <h1 className="mb-1 font-display text-2xl tracking-wide text-cream">{exercise.name}</h1>

      {done ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-counter text-3xl tracking-wide text-neon-gold">
            ¡Ejercicio completo! 🔥
          </p>
          <p className="text-sm text-cream-dim">
            Registraste {loggedSets.length} de {plannedSets} series.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Volver a mi semana</Button>
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
            <Stepper label="Repeticiones" value={reps} step={1} min={1} onChange={setReps} />
          </div>

          {saveError && (
            <p className="mt-3 max-w-xs text-xs text-usa-red">{saveError}</p>
          )}

          <Button
            onClick={handleSaveSet}
            disabled={saving || !sessionId}
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
