import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ExerciseThumb } from "../ui/ExerciseThumb";
import { ExerciseCombobox } from "./ExerciseCombobox";
import { api, ApiError } from "../../lib/api";
import type { ExerciseSummary, PlanDayOut, PlanEntryOut } from "../../types";

interface DraftEntry {
  key: string;
  exercise: ExerciseSummary;
  sets: number;
  reps: number;
  notes: string;
}

function toDraft(entries: PlanEntryOut[]): DraftEntry[] {
  return entries.map((e) => ({
    key: e.id,
    exercise: e.exercise,
    sets: e.sets,
    reps: e.reps,
    notes: e.notes ?? "",
  }));
}

export function DayPlanEditor({
  userId,
  dayOfWeek,
  initialEntries,
  onSaved,
}: {
  userId: string;
  dayOfWeek: number;
  initialEntries: PlanEntryOut[];
  onSaved: (entries: PlanEntryOut[]) => void;
}) {
  const [entries, setEntries] = useState<DraftEntry[]>(toDraft(initialEntries));
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  function addExercise(exercise: ExerciseSummary) {
    // La API igual rechaza duplicados con un 400 claro, pero evitamos
    // el viaje de red de entrada.
    if (entries.some((e) => e.exercise.id === exercise.id)) {
      setShowPicker(false);
      return;
    }
    setEntries((prev) => [
      ...prev,
      { key: `${exercise.id}-${Date.now()}`, exercise, sets: 4, reps: 10, notes: "" },
    ]);
    setShowPicker(false);
    setDirty(true);
  }

  function updateEntry(key: string, patch: Partial<DraftEntry>) {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
    setDirty(true);
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e.key !== key));
    setDirty(true);
  }

  function move(key: string, dir: -1 | 1) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.key === key);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const day = await api.put<PlanDayOut>(`/users/${userId}/plan/${dayOfWeek}`, {
        entries: entries.map((e, i) => ({
          exercise_id: e.exercise.id,
          position: i,
          sets: e.sets,
          reps: e.reps,
          notes: e.notes,
        })),
      });
      setEntries(toDraft(day.entries));
      onSaved(day.entries);
      setDirty(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error de red. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-cream-dim">
          Sin ejercicios asignados este día. Agregá el primero.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.key}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2/60 p-3"
            >
              <ExerciseThumb src={entry.exercise.image} alt="" size={48} />
              <div className="min-w-[10rem] flex-1">
                <p className="text-sm font-semibold text-cream">{entry.exercise.name}</p>
                <p className="font-mono text-[11px] text-cream-dim uppercase">
                  {entry.exercise.equipment}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex flex-col items-center">
                  <span className="font-mono text-[10px] text-cream-dim uppercase">Sets</span>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={entry.sets}
                    onChange={(e) =>
                      updateEntry(entry.key, { sets: Number(e.target.value) || 1 })
                    }
                    className="w-16 px-2 py-1 text-center"
                  />
                </label>
                <label className="flex flex-col items-center">
                  <span className="font-mono text-[10px] text-cream-dim uppercase">Reps</span>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={entry.reps}
                    onChange={(e) =>
                      updateEntry(entry.key, { reps: Number(e.target.value) || 1 })
                    }
                    className="w-16 px-2 py-1 text-center"
                  />
                </label>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(entry.key, -1)}
                  disabled={i === 0}
                  className="rounded border border-line px-2 py-1 text-xs text-cream-dim hover:text-cream disabled:opacity-30"
                  aria-label="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(entry.key, 1)}
                  disabled={i === entries.length - 1}
                  className="rounded border border-line px-2 py-1 text-xs text-cream-dim hover:text-cream disabled:opacity-30"
                  aria-label="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.key)}
                  className="rounded border border-usa-red/50 px-2 py-1 text-xs text-usa-red hover:bg-usa-red/10"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showPicker ? (
        <ExerciseCombobox
          onSelect={addExercise}
          onClose={() => setShowPicker(false)}
          excludeIds={entries.map((e) => e.exercise.id)}
        />
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowPicker(true)}>
          + Agregar ejercicio
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <Button onClick={handleSave} disabled={saving || !dirty}>
          {saving ? "Guardando..." : "Guardar día"}
        </Button>
        {error && <span className="text-xs text-usa-red">{error}</span>}
        {!error && dirty && <span className="text-xs text-cream-dim">Cambios sin guardar</span>}
      </div>
    </div>
  );
}
