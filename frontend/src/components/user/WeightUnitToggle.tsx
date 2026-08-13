import { useState } from "react";
import { WEIGHT_UNIT_OPTIONS } from "../../lib/units";
import { api, ApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { UserPublic, WeightUnit } from "../../types";

export function WeightUnitToggle({ initialUnit }: { initialUnit: WeightUnit }) {
  const { setUser } = useAuth();
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: WeightUnit) {
    if (next === unit) return;
    const previous = unit;
    // Optimista: si el PATCH falla, se revierte más abajo.
    setUnit(next);
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await api.patch<UserPublic>("/me/weight-unit", { weight_unit: next });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setUnit(previous);
      setError(err instanceof ApiError ? err.message : "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        {WEIGHT_UNIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            className={`flex-1 rounded-md border px-4 py-3 text-sm font-semibold tracking-wide uppercase transition ${
              unit === opt.value
                ? "border-neon-blue text-neon-blue shadow-neon"
                : "border-line text-cream-dim hover:text-cream"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {saving && <p className="mt-2 text-xs text-cream-dim">Guardando...</p>}
      {saved && <p className="mt-2 text-xs text-neon-gold">Preferencia guardada.</p>}
      {error && <p className="mt-2 text-xs text-usa-red">{error}</p>}
    </div>
  );
}
